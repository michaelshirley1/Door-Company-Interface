using BusinessApi.Data;
using BusinessApi.Models;
using ClosedXML.Excel;

namespace DataImport;

public static class CavitySliderImporter
{
    public static void Run(AppDbContext db, string path)
    {
        Console.WriteLine($"\n== Cavity Sliders: {Path.GetFileName(path)} ==");
        using var workbook = new XLWorkbook(path);

        var existing = db.CavitySliderTypes.ToList();
        Dictionary<string, CavitySliderType> Key(IEnumerable<CavitySliderType> items) =>
            items.ToDictionary(c => $"{c.Supplier}|{c.ProductSystem}|{c.UnitType}|{c.FinishDetail}|{c.HeightMm}|{c.WidthRange}", c => c);
        var byKey = Key(existing);

        foreach (var sheet in workbook.Worksheets)
        {
            var headers = Helpers.FindHeaderRow(sheet, out int headerRow, "Supplier", "Product", "Price");
            if (headers is null) { Console.WriteLine($"  (skipping sheet '{sheet.Name}' — no matching header row)"); continue; }

            var lastRow = sheet.LastRowUsed()!.RowNumber();
            for (int r = headerRow + 1; r <= lastRow; r++)
            {
                string Get(string col) => headers.TryGetValue(col, out var c) ? Helpers.CellText(sheet.Cell(r, c)) : "";
                var supplier = Get("Supplier");
                if (string.IsNullOrWhiteSpace(supplier)) continue;

                var priceRaw = Get("Price Ex GST");
                var isPOA = priceRaw.Equals("POA", StringComparison.OrdinalIgnoreCase);
                var price = isPOA ? null : (float?)Helpers.FirstNumber(priceRaw);

                var entity = new CavitySliderType
                {
                    Supplier = supplier,
                    ProductSystem = Get("Product / System"),
                    UnitType = NullIfEmpty(Get("Unit Type")),
                    StudPocket = NullIfEmpty(Get("Stud / Pocket")),
                    FinishDetail = NullIfEmpty(Get("Finish / Detail")),
                    HeightMm = (int?)Helpers.FirstNumber(Get("Height (mm)")),
                    WidthRange = NullIfEmpty(Get("Width Range (mm)")),
                    Price = price,
                    IsPOA = isPOA,
                    PriceBasis = string.IsNullOrWhiteSpace(Get("Price Basis")) ? "per unit" : Get("Price Basis"),
                    Category = NullIfEmpty(Get("SQL Category")),
                    Subcategory = NullIfEmpty(Get("SQL Subcategory")),
                    IsActive = true,
                };

                var key = $"{entity.Supplier}|{entity.ProductSystem}|{entity.UnitType}|{entity.FinishDetail}|{entity.HeightMm}|{entity.WidthRange}";
                if (byKey.TryGetValue(key, out var existingRow))
                {
                    existingRow.Price = entity.Price;
                    existingRow.IsPOA = entity.IsPOA;
                    existingRow.PriceBasis = entity.PriceBasis;
                    existingRow.Category = entity.Category;
                    existingRow.Subcategory = entity.Subcategory;
                    Helpers.Updated++;
                }
                else
                {
                    entity.CreatedAt = DateTime.UtcNow;
                    db.CavitySliderTypes.Add(entity);
                    byKey[key] = entity;
                    Helpers.Imported++;
                }
            }
        }

        db.SaveChanges();
    }

    private static string? NullIfEmpty(string s) => string.IsNullOrWhiteSpace(s) ? null : s;
}
