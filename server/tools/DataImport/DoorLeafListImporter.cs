using System.Text.RegularExpressions;
using BusinessApi.Data;
using BusinessApi.Models;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;

namespace DataImport;

/// <summary>
/// Imports "DOOR LEaf List for programme with pricing.xlsx" — sheet-per-height, columns:
/// Main Category / Product / Range / Door Label List / Core / Construction / Height / Range /
/// Width / Size / Price Option / Price ex GST / Price Status / Unit / Notes.
/// Produces DoorType (by Product/Range name, disambiguated by Core when needed) + DoorPricingEntry
/// rows with PriceFor = "Leaf" (this file prices the bare leaf, not a jamb-inclusive prehung unit).
///
/// Most ranges use "Price Option" for thickness ("35mm 3mm Skins") and a single width or "410-810mm"
/// range for Width/Size. A handful of ranges (Flush Panel Doors, Grooved Doors, ULCD Classic/Vogue,
/// Vogue Panel Doors) use a different layout instead: Width/Size is a literal comma-separated list of
/// exact widths, Price Option is a reinforcement variant ("Standard"/"Steel 1 Side"/"Steel 2 Sides")
/// rather than a thickness, and the same generic Product/Range name (e.g. "Flush Panel Doors") is
/// reused across genuinely different cores (Hollowcore/Polycore/Solidcore) — both need handling below
/// or DoorType names collapse different products together and thickness gets misparsed from "Steel 2
/// Sides" as "2mm".
/// </summary>
public static class DoorLeafListImporter
{
    public static void Run(AppDbContext db, string path)
    {
        Console.WriteLine($"\n== Door Leaf List: {Path.GetFileName(path)} ==");
        using var workbook = new XLWorkbook(path);

        var doorTypesByName = db.DoorTypes.ToDictionary(d => d.Name, d => d, StringComparer.OrdinalIgnoreCase);
        var existingEntries = db.DoorPricingEntries.ToList();

        foreach (var sheet in workbook.Worksheets)
        {
            var headers = Helpers.FindHeaderRow(sheet, out int headerRow, "Height / Range", "Price ex GST");
            if (headers is null) { Console.WriteLine($"  (skipping sheet '{sheet.Name}' — reference sheet, not a price table)"); continue; }

            var sheetHeight = int.TryParse(sheet.Name, out var sh) ? (int?)sh : null;

            var lastRow = sheet.LastRowUsed()!.RowNumber();
            for (int r = headerRow + 1; r <= lastRow; r++)
            {
                string Get(string col) => headers.TryGetValue(col, out var c) ? Helpers.CellText(sheet.Cell(r, c)) : "";

                var productRange = Get("Product / Range");
                var heightRaw = Get("Height / Range");
                if (string.IsNullOrWhiteSpace(productRange) || string.IsNullOrWhiteSpace(heightRaw)) continue;

                var height = sheetHeight ?? (int?)Helpers.FirstNumber(heightRaw);
                if (height is null) continue;

                var status = Get("Price Status").Trim();
                if (status.Equals("Not listed", StringComparison.OrdinalIgnoreCase))
                {
                    Helpers.Skipped++;
                    continue;
                }
                var isPOA = status.Equals("POA", StringComparison.OrdinalIgnoreCase);
                var price = isPOA ? null : (float?)Helpers.FirstNumber(Get("Price ex GST"));
                if (!isPOA && price is null) { Helpers.Skipped++; continue; }

                var priceOption = Get("Price Option");
                var thicknessMatch = Regex.Match(priceOption, @"^\s*(\d+)\s*mm");
                int thickness;
                string? variant = null;
                if (thicknessMatch.Success)
                {
                    thickness = int.Parse(thicknessMatch.Groups[1].Value);
                }
                else
                {
                    thickness = 35;
                    if (!string.IsNullOrWhiteSpace(priceOption) && !priceOption.Equals("Standard", StringComparison.OrdinalIgnoreCase))
                        variant = priceOption;
                }

                var widths = Helpers.ExpandWidths(Get("Width / Size"));
                if (widths.Count == 0) continue;

                var core = Get("Core / Construction");
                var needsCoreSuffix = !string.IsNullOrWhiteSpace(core) && !productRange.Contains(core, StringComparison.OrdinalIgnoreCase);
                var doorTypeName = needsCoreSuffix ? $"{productRange} ({core})" : productRange;
                if (variant is not null) doorTypeName = $"{doorTypeName} — {variant}";

                if (!doorTypesByName.TryGetValue(doorTypeName, out var doorType))
                {
                    doorType = new DoorType
                    {
                        Name = doorTypeName,
                        Material = NullIfEmpty(core),
                        LeafType = NullIfEmpty(Get("Main Category")),
                        ProductRange = NullIfEmpty(Get("Door Label List")),
                        IsCavityOnly = IsCavityName(doorTypeName),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                    };
                    db.DoorTypes.Add(doorType);
                    doorTypesByName[doorTypeName] = doorType;
                    Helpers.Imported++;
                }
                else
                {
                    doorType.IsCavityOnly = IsCavityName(doorTypeName);
                }

                foreach (var width in widths)
                {
                    var match = existingEntries.FirstOrDefault(e =>
                        e.DoorType == doorType &&
                        e.Configuration is null && e.Jamb is null && e.PriceFor == "Leaf" &&
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
                            Configuration = null,
                            Jamb = null,
                            PriceFor = "Leaf",
                            HeightMm = height.Value,
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

        db.SaveChanges();
        Console.WriteLine("  (Door Label Lists / Core Lists sheets are reference documentation, not price rows — skipped.)");
    }

    private static string? NullIfEmpty(string s) => string.IsNullOrWhiteSpace(s) ? null : s;

    private static bool IsCavityName(string name) =>
        name.Contains("cavity", StringComparison.OrdinalIgnoreCase) || name.Contains("ulcd", StringComparison.OrdinalIgnoreCase);
}
