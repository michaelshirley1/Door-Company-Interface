using System.IO.Compression;
using System.Text.RegularExpressions;
using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace DataImport;

/// <summary>
/// Imports "TheDoorshop Merchant Pricelist.docx" — a flattened Word table of whole-unit
/// (jamb-inclusive) Prehung prices: DoorRange x Height x Jamb x Configuration -> Price.
/// Also creates a handful of global "Products" for line-item extras mentioned in the doc
/// that don't fit any single catalog table (non-standard width/height surcharges, cavity
/// softstop, wide jamb up-charges).
/// </summary>
public static class MerchantPricelistImporter
{
    private static readonly (string Config, bool IsWidthVariant)[] Columns =
    [
        ("Single", false),
        ("Single", true),
        ("Pair", false),
        ("2 Slide", false),
        ("3 Slide", false),
        ("2 Door Bifold", false),
        ("4 Door Bifold", false),
        ("Single Cavity", false),
        ("Biparting Cavity", false),
        ("__NonStdWidth", false),
        ("__NonStdHeight", false),
    ];

    public static void Run(AppDbContext db, string path)
    {
        Console.WriteLine($"\n== Merchant Pricelist: {Path.GetFileName(path)} ==");
        var text = ExtractText(path);

        var doorTypesByName = db.DoorTypes.ToDictionary(d => d.Name, d => d, StringComparer.OrdinalIgnoreCase);
        var existingEntries = db.DoorPricingEntries.ToList();

        var blockPattern = new Regex(
            @"(?<height>1980|2200|2400)\s+(?<name>.+?)\s+(?<thick>35|37)mm\s+410-810.*?add Non Std to each leaf \(excludes Cav\)Jamb.*?" +
            @"19mm Flat(?<flat>(?:\$[\d.]+|POA)+)30mm Grv(?<grv>(?:\$[\d.]+|POA)+)",
            RegexOptions.Singleline);

        int blockCount = 0;
        foreach (Match block in blockPattern.Matches(text))
        {
            blockCount++;
            var height = int.Parse(block.Groups["height"].Value);
            var name = block.Groups["name"].Value.Trim();
            var thickness = int.Parse(block.Groups["thick"].Value);

            if (!doorTypesByName.TryGetValue(name, out var doorType))
            {
                doorType = new DoorType { Name = name, IsActive = true, CreatedAt = DateTime.UtcNow };
                db.DoorTypes.Add(doorType);
                doorTypesByName[name] = doorType;
                Helpers.Imported++;
            }

            ImportJambRow(db, doorType, existingEntries, height, thickness, "19mm Flat", block.Groups["flat"].Value);
            ImportJambRow(db, doorType, existingEntries, height, thickness, "30mm Grv", block.Groups["grv"].Value);
        }

        Console.WriteLine($"  Parsed {blockCount} height/range blocks.");

        ImportExtras(db);

        db.SaveChanges();
    }

    private static void ImportJambRow(AppDbContext db, DoorType doorType, List<DoorPricingEntry> existingEntries, int height, int thickness, string jamb, string tokenStream)
    {
        var tokens = Regex.Matches(tokenStream, @"\$[\d.]+|POA").Select(m => m.Value).ToList();
        if (tokens.Count != Columns.Length)
        {
            Helpers.Warn($"{doorType.Name} {height}mm {jamb}: expected {Columns.Length} price columns, found {tokens.Count} — skipped, needs manual entry.");
            return;
        }

        for (int i = 0; i < Columns.Length; i++)
        {
            var (config, isWidthVariant) = Columns[i];
            var token = tokens[i];
            var isPOA = token == "POA";
            var price = isPOA ? (float?)null : float.Parse(token.TrimStart('$'));

            if (config == "__NonStdWidth" || config == "__NonStdHeight")
            {
                continue;
            }

            var widths = isWidthVariant ? new List<int> { 860, 910 } : Helpers.ExpandWidths("410-810");
            foreach (var width in widths)
            {
                var match = existingEntries.FirstOrDefault(e =>
                    e.DoorType == doorType && e.Configuration == config && e.Jamb == jamb && e.PriceFor == "Prehung" &&
                    e.HeightMm == height && e.WidthMm == width && e.ThicknessMm == thickness);

                if (match is not null)
                {
                    match.Price = price;
                    match.IsPOA = isPOA;
                    Helpers.Updated++;
                }
                else
                {
                    var entry = new DoorPricingEntry
                    {
                        DoorType = doorType,
                        Configuration = config,
                        Jamb = jamb,
                        PriceFor = "Prehung",
                        HeightMm = height,
                        WidthMm = width,
                        ThicknessMm = thickness,
                        Price = price,
                        IsPOA = isPOA,
                    };
                    db.DoorPricingEntries.Add(entry);
                    existingEntries.Add(entry);
                    Helpers.Imported++;
                }
            }
        }
    }

    private static void ImportExtras(AppDbContext db)
    {
        UpsertExtraProduct(db, "Cavity Softstop", "Softstop on cavities (per leaf)", 168f);
        UpsertExtraProduct(db, "Wide Jamb — up to 140mm", "Wide jamb up to 140mm (per set)", 50f);
        UpsertExtraProduct(db, "Wide Jamb — up to 180mm", "Wide jamb up to 180mm (per set)", 80f);
        UpsertExtraProduct(db, "Non-Standard Width Surcharge", "Non-standard width (per leaf, excludes cavity)", 50f);
        UpsertExtraProduct(db, "Non-Standard Height Surcharge", "Non-standard height (per leaf, excludes cavity)", 50f);
    }

    private static void UpsertExtraProduct(AppDbContext db, string name, string componentName, float price)
    {
        var existing = db.Products.Include(p => p.Components).FirstOrDefault(p => p.Name == name);
        if (existing is not null)
        {
            var component = existing.Components.FirstOrDefault();
            if (component is not null) { component.CustomName = componentName; component.CustomPrice = price; }
            Helpers.Updated++;
            return;
        }

        db.Products.Add(new Product
        {
            Name = name,
            Description = "Merchant pricelist extra — from TheDoorshop Merchant Pricelist.docx",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            Components = [new ProductComponent { ComponentType = "Custom", CustomName = componentName, CustomPrice = price, Quantity = 1 }],
        });
        Helpers.Imported++;
    }

    private static string ExtractText(string docxPath)
    {
        using var archive = ZipFile.OpenRead(docxPath);
        var entry = archive.GetEntry("word/document.xml") ?? throw new InvalidOperationException("word/document.xml not found in docx");
        using var stream = entry.Open();
        using var reader = new StreamReader(stream);
        var xml = reader.ReadToEnd();
        var text = Regex.Replace(xml, "<[^>]+>", "");
        text = text.Replace("&amp;", "&");
        text = Regex.Replace(text, @"\s+", " ");
        return text;
    }
}
