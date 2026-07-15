using BusinessApi.Data;
using BusinessApi.Models;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;

namespace DataImport;

public static class JambHingeTrackImporter
{
    public static void Run(AppDbContext db, string path)
    {
        Console.WriteLine($"\n== Jamb / Hinges / Tracks: {Path.GetFileName(path)} ==");
        using var workbook = new XLWorkbook(path);

        ImportJambRawPrices(db, workbook);
        ImportJambRequirements(db, workbook);
        ImportDoorstopProducts(db, workbook);
        ImportHinges(db, workbook);
        ImportTracks(db, workbook);

        Console.WriteLine("  (Labour sheet not imported — labour cost is a flat per-catalog-item field in this schema; the source data varies by door height, which has no matching column. Set LabourCost manually per item on the Products hub if wanted.)");
        Console.WriteLine("  (Quote_Lookups sheet is business-rule documentation, not tabular data — the hinge-count and track-mapping rules it documents are already encoded in src/shared/constants.ts.)");
    }

    private static void ImportJambRawPrices(AppDbContext db, XLWorkbook workbook)
    {
        if (!workbook.TryGetWorksheet("Jamb_Raw_Prices", out var sheet)) { Console.WriteLine("  (no Jamb_Raw_Prices sheet)"); return; }
        var headers = Helpers.FindHeaderRow(sheet, out int headerRow, "Product Group", "Cost per metre");
        if (headers is null) { Console.WriteLine("  (Jamb_Raw_Prices: header row not found)"); return; }

        var existingByCode = db.JambTypes.Where(j => j.Code != null).ToDictionary(j => j.Code!, j => j);
        var lastRow = sheet.LastRowUsed()!.RowNumber();

        for (int r = headerRow + 1; r <= lastRow; r++)
        {
            string Get(string col) => headers.TryGetValue(col, out var c) ? Helpers.CellText(sheet.Cell(r, c)) : "";
            var code = Get("Code");
            var group = Get("Product Group");
            if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(group)) continue;

            var costPerMetre = (float?)Helpers.FirstNumber(Get("Cost per metre ex GST"));
            var profileSize = Get("Profile / Size");
            var rebateGroove = Get("Rebate / Groove");
            var name = string.IsNullOrWhiteSpace(rebateGroove) ? $"{group} {profileSize}" : $"{group} {profileSize} ({rebateGroove})";

            if (existingByCode.TryGetValue(code, out var existing))
            {
                existing.Name = name;
                existing.ProfileSize = profileSize;
                existing.RebateGroove = string.IsNullOrWhiteSpace(rebateGroove) ? null : rebateGroove;
                existing.CostPerMetre = costPerMetre;
                Helpers.Updated++;
            }
            else
            {
                var entity = new JambType
                {
                    Name = name,
                    Code = code,
                    ProfileSize = profileSize,
                    RebateGroove = string.IsNullOrWhiteSpace(rebateGroove) ? null : rebateGroove,
                    CostPerMetre = costPerMetre,
                    Price = 0f,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                };
                db.JambTypes.Add(entity);
                existingByCode[code] = entity;
                Helpers.Imported++;
            }
        }
        db.SaveChanges();
    }

    private static void ImportJambRequirements(AppDbContext db, XLWorkbook workbook)
    {
        if (!workbook.TryGetWorksheet("Jamb_Requirements", out var sheet)) { Console.WriteLine("  (no Jamb_Requirements sheet)"); return; }
        var headers = Helpers.FindHeaderRow(sheet, out int headerRow, "Unit Type", "Jamb Required");
        if (headers is null) { Console.WriteLine("  (Jamb_Requirements: header row not found)"); return; }

        var existing = db.JambRequirements.ToDictionary(r => $"{r.UnitType}|{r.HeightMm}", r => r);
        var lastRow = sheet.LastRowUsed()!.RowNumber();

        for (int r = headerRow + 1; r <= lastRow; r++)
        {
            string Get(string col) => headers.TryGetValue(col, out var c) ? Helpers.CellText(sheet.Cell(r, c)) : "";
            var unitType = Get("Unit Type");
            var heightRaw = Get("Door Height");
            if (string.IsNullOrWhiteSpace(unitType) || string.IsNullOrWhiteSpace(heightRaw)) continue;

            var height = (int)(Helpers.FirstNumber(heightRaw) ?? 0);
            var metres = (float)(Helpers.FirstNumber(Get("Jamb Required (m)")) ?? 0);
            if (height == 0 || metres == 0) continue;

            var key = $"{unitType}|{height}";
            if (existing.TryGetValue(key, out var row))
            {
                row.MetresRequired = metres;
                Helpers.Updated++;
            }
            else
            {
                var entity = new JambRequirement { UnitType = unitType, HeightMm = height, MetresRequired = metres };
                db.JambRequirements.Add(entity);
                existing[key] = entity;
                Helpers.Imported++;
            }
        }
        db.SaveChanges();
    }

    private static void ImportDoorstopProducts(AppDbContext db, XLWorkbook workbook)
    {
        if (!workbook.TryGetWorksheet("Doorstop_Requirements", out var sheet)) { Console.WriteLine("  (no Doorstop_Requirements sheet)"); return; }
        var headers = Helpers.FindHeaderRow(sheet, out int headerRow, "Unit Type", "Doorstop");
        if (headers is null) { Console.WriteLine("  (Doorstop_Requirements: header row not found)"); return; }

        var existing = db.Products.Where(p => p.Name.StartsWith("Doorstop —")).Include(p => p.Components)
            .ToDictionary(p => p.Name, p => p);
        var lastRow = sheet.LastRowUsed()!.RowNumber();

        for (int r = headerRow + 1; r <= lastRow; r++)
        {
            string Get(string col) => headers.TryGetValue(col, out var c) ? Helpers.CellText(sheet.Cell(r, c)) : "";
            var unitType = Get("Unit Type");
            var heightRaw = Get("Door Height");
            if (string.IsNullOrWhiteSpace(unitType) || string.IsNullOrWhiteSpace(heightRaw)) continue;

            var height = (int)(Helpers.FirstNumber(heightRaw) ?? 0);
            var quantity = Helpers.FirstNumber(Get("Quantity Needed (m)")) ?? 0;
            var costPerMetre = Helpers.FirstNumber(Get("Cost per metre ex GST")) ?? 0;
            var code = Get("Default Doorstop Code");
            if (height == 0 || quantity == 0) continue;

            var name = $"Doorstop — {unitType} {height}mm";
            var price = (float)(quantity * costPerMetre);
            var componentName = $"{code} doorstop ({quantity}m @ ${costPerMetre:0.00}/m)";

            if (existing.TryGetValue(name, out var product))
            {
                var component = product.Components.FirstOrDefault();
                if (component is not null) { component.CustomName = componentName; component.CustomPrice = price; }
                Helpers.Updated++;
            }
            else
            {
                var entity = new Product
                {
                    Name = name,
                    Description = $"Default doorstop for a {unitType} unit at {height}mm.",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Components = [new ProductComponent { ComponentType = "Custom", CustomName = componentName, CustomPrice = price, Quantity = 1 }],
                };
                db.Products.Add(entity);
                existing[name] = entity;
                Helpers.Imported++;
            }
        }
        db.SaveChanges();
    }

    private static void ImportHinges(AppDbContext db, XLWorkbook workbook)
    {
        if (!workbook.TryGetWorksheet("Hinges", out var sheet)) { Console.WriteLine("  (no Hinges sheet)"); return; }
        var headers = Helpers.FindHeaderRow(sheet, out int headerRow, "Hinge Product", "Finish");
        if (headers is null) { Console.WriteLine("  (Hinges: header row not found)"); return; }

        var existing = db.HingeTypes.ToDictionary(h => $"{h.Name}|{h.Finish}", h => h);
        var lastRow = sheet.LastRowUsed()!.RowNumber();
        var seen = new HashSet<string>();

        for (int r = headerRow + 1; r <= lastRow; r++)
        {
            string Get(string col) => headers.TryGetValue(col, out var c) ? Helpers.CellText(sheet.Cell(r, c)) : "";
            var name = Get("Hinge Product");
            var finish = Get("Finish");
            if (string.IsNullOrWhiteSpace(name)) continue;

            var key = $"{name}|{finish}";
            if (!seen.Add(key)) continue;

            var price = (float)(Helpers.FirstNumber(Get("Cost each ex GST")) ?? 0);

            if (existing.TryGetValue(key, out var row))
            {
                row.Price = price;
                Helpers.Updated++;
            }
            else
            {
                var entity = new HingeType { Name = name, Finish = string.IsNullOrWhiteSpace(finish) ? null : finish, Price = price, IsActive = true, CreatedAt = DateTime.UtcNow };
                db.HingeTypes.Add(entity);
                existing[key] = entity;
                Helpers.Imported++;
            }
        }
        db.SaveChanges();
        Console.WriteLine("  (Hinge counts per height from this sheet: 1980->3, 2200/2400->4, 2700->5 — matches hingeCountForHeight() already in src/shared/constants.ts, no change needed.)");
    }

    private static void ImportTracks(AppDbContext db, XLWorkbook workbook)
    {
        if (!workbook.TryGetWorksheet("Tracks", out var sheet)) { Console.WriteLine("  (no Tracks sheet)"); return; }
        var headers = Helpers.FindHeaderRow(sheet, out int headerRow, "Track System", "Track Type");
        if (headers is null) { Console.WriteLine("  (Tracks: header row not found)"); return; }

        var existing = db.TrackTypes.Where(t => t.Code != null).ToDictionary(t => t.Code!, t => t);
        var lastRow = sheet.LastRowUsed()!.RowNumber();

        for (int r = headerRow + 1; r <= lastRow; r++)
        {
            string Get(string col) => headers.TryGetValue(col, out var c) ? Helpers.CellText(sheet.Cell(r, c)) : "";
            var code = Get("Code");
            var supplier = Get("Supplier");
            if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(supplier)) continue;

            var lengthText = Get("Track Length / Metres");
            var price = (float?)Helpers.FirstNumber(Get("Cost ex GST"));

            if (existing.TryGetValue(code, out var row))
            {
                row.Supplier = supplier;
                row.TrackSystem = Get("Track System");
                row.TrackTypeName = Get("Track Type");
                row.WidthRangeMm = Get("Door Width Range");
                row.LengthMm = (int?)Helpers.FirstNumber(lengthText);
                row.Price = price;
                Helpers.Updated++;
            }
            else
            {
                var entity = new TrackType
                {
                    Supplier = supplier,
                    TrackSystem = Get("Track System"),
                    TrackTypeName = Get("Track Type"),
                    WidthRangeMm = Get("Door Width Range"),
                    LengthMm = (int?)Helpers.FirstNumber(lengthText),
                    Code = code,
                    Price = price,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                };
                db.TrackTypes.Add(entity);
                existing[code] = entity;
                Helpers.Imported++;
            }
        }
        db.SaveChanges();
    }
}
