using System.Globalization;
using System.Text;
using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace DataImport;

/// <summary>
/// Dumps everything the importers loaded into an in-memory AppDbContext as plain INSERT statements,
/// so the actual DB write can happen as a one-shot .sql script (Neon SQL editor / psql) instead of
/// requiring anyone to run this tool against the real database.
///
/// Every section deletes-by-natural-key before inserting, so re-running a script (e.g. after a source
/// file changes, or after a parsing bug fix produces different rows) replaces stale rows instead of
/// duplicating or leaving old-and-wrong rows sitting alongside the corrected ones. DoorTypes/Products
/// deletes cascade to their DoorPricingEntries/ProductComponents (FK configured ON DELETE CASCADE in
/// AppDbContext), so those child tables don't need their own delete step.
/// </summary>
public static class SqlEmitter
{
    private static readonly string[] LegacyGenericDoorTypeNames =
        ["Flush Panel Doors", "Grooved Doors", "ULCD Classic", "ULCD Vogue", "Vogue Panel Doors"];

    private static void EmitLegacyDoorTypeCleanup(StringBuilder sb)
    {
        sb.AppendLine("-- One-time cleanup for the pre-fix DoorLeafListImporter bug: these 5 ranges used to collapse");
        sb.AppendLine("-- distinct cores (Hollowcore/Polycore/Solidcore) under one generic DoorType name (cascades to");
        sb.AppendLine("-- their DoorPricingEntries). Harmless no-op if that buggy version never ran here.");
        EmitDeleteByColumn(sb, "DoorTypes", "Name", LegacyGenericDoorTypeNames);
    }

    private static void EmitLegacyDoorLeafProductCleanup(StringBuilder sb)
    {
        sb.AppendLine("-- One-time cleanup for door-leaf Products built from the old generic DoorType names above —");
        sb.AppendLine("-- e.g. \"Flush Panel Doors — 2mm Leaf\" (a misread \"Steel 2 Sides\" variant). Harmless no-op");
        sb.AppendLine("-- if that buggy version never ran here.");
        foreach (var name in LegacyGenericDoorTypeNames)
            sb.AppendLine($"DELETE FROM \"Products\" WHERE \"Name\" LIKE {Literal(name + " — %")};");
        sb.AppendLine();
    }

    /// <summary>Emits only Products + ProductComponents — for standalone runs (e.g. door-leaf products) against
    /// a DB that already has everything else imported. All rows in `db` are treated as new (no baseline to exclude).</summary>
    public static void EmitProductsOnly(AppDbContext db, string outputPath)
    {
        var sb = new StringBuilder();
        var noBaseline = new BaselineIds([], [], [], [], [], [], []);

        sb.AppendLine("-- DoorStop door-leaf Products — generated from DOOR LEaf List for programme with pricing.xlsx");
        sb.AppendLine("-- Additive: just Products/ProductComponents, no dependency on DoorTypes/DoorPricingEntries already");
        sb.AppendLine("-- being on the target DB. Deletes by Name before inserting, so it's safe to re-run after the");
        sb.AppendLine("-- source file changes or a parsing fix — it replaces its own prior output rather than duplicating.");
        sb.AppendLine();

        EmitLegacyDoorLeafProductCleanup(sb);

        var products = db.Products.OrderBy(p => p.Id).ToList();
        EmitDeleteByColumn(sb, "Products", "Name", products.Select(p => p.Name));
        EmitSimpleTable(sb, "Products",
            ["Name", "Description", "LabourCost", "IsActive", "CreatedAt"],
            products.Select(p => new object?[] { p.Name, p.Description, p.LabourCost, p.IsActive, p.CreatedAt }));

        EmitProductComponents(sb, db, noBaseline);

        File.WriteAllText(outputPath, sb.ToString());
        Console.WriteLine($"\nWrote {outputPath} ({sb.Length:N0} chars)");
    }

    public static void Emit(AppDbContext db, BaselineIds baseline, string outputPath)
    {
        var sb = new StringBuilder();

        sb.AppendLine("-- DoorStop pricing data import — generated from:");
        sb.AppendLine("--   Cavity Slider list with pricing.xlsx");
        sb.AppendLine("--   jamb_hinges_labour_tracks_pricing.xlsx");
        sb.AppendLine("--   DOOR LEaf List for programme with pricing.xlsx");
        sb.AppendLine("--   TheDoorshop Merchant Pricelist.docx");
        sb.AppendLine("--");
        sb.AppendLine("-- Safe to run against a freshly-reset DB (e.g. right after server/reset-schema.sql) OR against");
        sb.AppendLine("-- a DB that already has an earlier version of this same import applied: every section deletes");
        sb.AppendLine("-- its own rows by natural key before inserting, so re-running replaces stale/wrong rows (e.g.");
        sb.AppendLine("-- from a since-fixed parsing bug) instead of duplicating them or leaving old ones behind.");
        sb.AppendLine("-- Doesn't touch the small HasData seed rows (3 demo DoorTypes/HingeTypes/etc.) — none of the");
        sb.AppendLine("-- names below collide with those.");
        sb.AppendLine();

        EmitLegacyDoorTypeCleanup(sb);
        EmitLegacyDoorLeafProductCleanup(sb);

        var jambTypes = db.JambTypes.Where(j => !baseline.JambTypeIds.Contains(j.Id)).OrderBy(j => j.Id).ToList();
        EmitDeleteByColumn(sb, "JambTypes", "Code", jambTypes.Select(j => j.Code));
        EmitSimpleTable(sb, "JambTypes",
            ["Name", "Description", "Supplier", "Colour", "LabourCost", "CostPerMetre", "ProfileSize", "RebateGroove", "Code", "Price", "IsActive", "CreatedAt"],
            jambTypes.Select(j => new object?[] { j.Name, j.Description, j.Supplier, j.Colour, j.LabourCost, j.CostPerMetre, j.ProfileSize, j.RebateGroove, j.Code, j.Price, j.IsActive, j.CreatedAt }));

        var jambRequirements = db.JambRequirements.Where(r => !baseline.JambRequirementIds.Contains(r.Id)).OrderBy(r => r.Id).ToList();
        EmitDeleteByComposite(sb, "JambRequirements", ["UnitType", "HeightMm"], jambRequirements.Select(r => new object?[] { r.UnitType, r.HeightMm }));
        EmitSimpleTable(sb, "JambRequirements",
            ["UnitType", "HeightMm", "MetresRequired"],
            jambRequirements.Select(r => new object?[] { r.UnitType, r.HeightMm, r.MetresRequired }));

        var hingeTypes = db.HingeTypes.Where(h => !baseline.HingeTypeIds.Contains(h.Id)).OrderBy(h => h.Id).ToList();
        EmitDeleteByComposite(sb, "HingeTypes", ["Name", "Finish"], hingeTypes.Select(h => new object?[] { h.Name, h.Finish }));
        EmitSimpleTable(sb, "HingeTypes",
            ["Name", "Finish", "SizeMm", "Description", "Supplier", "Colour", "LabourCost", "IsActive", "Price", "CreatedAt"],
            hingeTypes.Select(h => new object?[] { h.Name, h.Finish, h.SizeMm, h.Description, h.Supplier, h.Colour, h.LabourCost, h.IsActive, h.Price, h.CreatedAt }));

        var cavitySliders = db.CavitySliderTypes.Where(c => !baseline.CavitySliderTypeIds.Contains(c.Id)).OrderBy(c => c.Id).ToList();
        EmitDeleteByComposite(sb, "CavitySliderTypes", ["Supplier", "ProductSystem", "UnitType", "FinishDetail", "HeightMm", "WidthRange"],
            cavitySliders.Select(c => new object?[] { c.Supplier, c.ProductSystem, c.UnitType, c.FinishDetail, c.HeightMm, c.WidthRange }));
        EmitSimpleTable(sb, "CavitySliderTypes",
            ["Supplier", "ProductSystem", "UnitType", "StudPocket", "FinishDetail", "Colour", "LabourCost", "HeightMm", "WidthRange", "Price", "IsPOA", "PriceBasis", "Category", "Subcategory", "IsActive", "CreatedAt"],
            cavitySliders.Select(c => new object?[] { c.Supplier, c.ProductSystem, c.UnitType, c.StudPocket, c.FinishDetail, c.Colour, c.LabourCost, c.HeightMm, c.WidthRange, c.Price, c.IsPOA, c.PriceBasis, c.Category, c.Subcategory, c.IsActive, c.CreatedAt }));

        var trackTypes = db.TrackTypes.Where(t => !baseline.TrackTypeIds.Contains(t.Id)).OrderBy(t => t.Id).ToList();
        EmitDeleteByColumn(sb, "TrackTypes", "Code", trackTypes.Select(t => t.Code));
        EmitSimpleTable(sb, "TrackTypes",
            ["Supplier", "TrackSystem", "TrackTypeName", "WidthRangeMm", "LengthMm", "Code", "Colour", "Price", "IsActive", "CreatedAt"],
            trackTypes.Select(t => new object?[] { t.Supplier, t.TrackSystem, t.TrackTypeName, t.WidthRangeMm, t.LengthMm, t.Code, t.Colour, t.Price, t.IsActive, t.CreatedAt }));

        var doorTypes = db.DoorTypes.Where(d => !baseline.DoorTypeIds.Contains(d.Id)).OrderBy(d => d.Id).ToList();
        EmitDeleteByColumn(sb, "DoorTypes", "Name", doorTypes.Select(d => d.Name));
        EmitSimpleTable(sb, "DoorTypes",
            ["Name", "LeafType", "Material", "ProductRange", "SkinThickness", "Colour", "LabourCost", "Description", "Notes", "IsCavityOnly", "IsActive", "CreatedAt"],
            doorTypes.Select(d => new object?[] { d.Name, d.LeafType, d.Material, d.ProductRange, d.SkinThickness, d.Colour, d.LabourCost, d.Description, d.Notes, d.IsCavityOnly, d.IsActive, d.CreatedAt }));

        EmitDoorPricingEntries(sb, db, baseline);

        var products = db.Products.Where(p => !baseline.ProductIds.Contains(p.Id)).OrderBy(p => p.Id).ToList();
        EmitDeleteByColumn(sb, "Products", "Name", products.Select(p => p.Name));
        EmitSimpleTable(sb, "Products",
            ["Name", "Description", "LabourCost", "IsActive", "CreatedAt"],
            products.Select(p => new object?[] { p.Name, p.Description, p.LabourCost, p.IsActive, p.CreatedAt }));

        EmitProductComponents(sb, db, baseline);

        File.WriteAllText(outputPath, sb.ToString());
        Console.WriteLine($"\nWrote {outputPath} ({sb.Length:N0} chars)");
    }

    private static void EmitSimpleTable(StringBuilder sb, string table, string[] columns, IEnumerable<object?[]> rows)
    {
        var rowList = rows.ToList();
        if (rowList.Count == 0) return;

        sb.AppendLine($"-- {table} ({rowList.Count} rows)");
        sb.AppendLine($"INSERT INTO \"{table}\" (\"{string.Join("\", \"", columns)}\") VALUES");
        for (int i = 0; i < rowList.Count; i++)
        {
            var values = string.Join(", ", rowList[i].Select(Literal));
            sb.AppendLine($"    ({values}){(i == rowList.Count - 1 ? ";" : ",")}");
        }
        sb.AppendLine();
    }

    /// <summary>DELETE ... WHERE "column" IN (...) for a single-column natural key (e.g. Code, Name). Skips null keys.</summary>
    private static void EmitDeleteByColumn(StringBuilder sb, string table, string column, IEnumerable<string?> values)
    {
        var distinct = values.Where(v => v is not null).Distinct().ToList();
        if (distinct.Count == 0) return;
        sb.AppendLine($"DELETE FROM \"{table}\" WHERE \"{column}\" IN ({string.Join(", ", distinct.Select(v => Literal(v)))});");
        sb.AppendLine();
    }

    /// <summary>DELETE ... WHERE (col1 = v1 AND col2 = v2) OR (...) for a composite natural key. Uses `IS NOT DISTINCT FROM` so NULLs match too.</summary>
    private static void EmitDeleteByComposite(StringBuilder sb, string table, string[] columns, IEnumerable<object?[]> rows)
    {
        var rowList = rows.Distinct(new ObjectArrayComparer()).ToList();
        if (rowList.Count == 0) return;
        var conditions = rowList.Select(r => "(" + string.Join(" AND ", columns.Zip(r, (c, v) => $"\"{c}\" IS NOT DISTINCT FROM {Literal(v)}")) + ")");
        sb.AppendLine($"DELETE FROM \"{table}\" WHERE {string.Join(" OR ", conditions)};");
        sb.AppendLine();
    }

    private class ObjectArrayComparer : IEqualityComparer<object?[]>
    {
        public bool Equals(object?[]? x, object?[]? y) => x is not null && y is not null && x.SequenceEqual(y);
        public int GetHashCode(object?[] obj) => obj.Aggregate(0, (h, v) => HashCode.Combine(h, v));
    }

    private static void EmitDoorPricingEntries(StringBuilder sb, AppDbContext db, BaselineIds baseline)
    {
        var byDoorType = db.DoorPricingEntries.Include(e => e.DoorType).Where(e => !baseline.DoorTypeIds.Contains(e.DoorTypeId))
            .OrderBy(e => e.Id).AsEnumerable().GroupBy(e => e.DoorType.Name).ToList();
        if (byDoorType.Count == 0) return;

        string[] doorPricingColumnTypes = ["text", "text", "text", "integer", "integer", "integer", "real", "boolean"];

        var total = byDoorType.Sum(g => g.Count());
        sb.AppendLine($"-- DoorPricingEntries ({total} rows across {byDoorType.Count} door types — the DELETE FROM \"DoorTypes\" above already cleared any stale entries for these via cascade)");
        foreach (var group in byDoorType)
        {
            sb.AppendLine($"INSERT INTO \"DoorPricingEntries\" (\"DoorTypeId\", \"Configuration\", \"Jamb\", \"PriceFor\", \"HeightMm\", \"WidthMm\", \"ThicknessMm\", \"Price\", \"IsPOA\")");
            sb.AppendLine($"SELECT dt.\"Id\", v.* FROM (VALUES");
            var rows = group.ToList();
            for (int i = 0; i < rows.Count; i++)
            {
                var e = rows[i];
                var values = ZipTyped(new object?[] { e.Configuration, e.Jamb, e.PriceFor, e.HeightMm, e.WidthMm, e.ThicknessMm, e.Price, e.IsPOA }, doorPricingColumnTypes);
                sb.AppendLine($"    ({values}){(i == rows.Count - 1 ? "" : ",")}");
            }
            sb.AppendLine(") AS v(\"Configuration\", \"Jamb\", \"PriceFor\", \"HeightMm\", \"WidthMm\", \"ThicknessMm\", \"Price\", \"IsPOA\")");
            sb.AppendLine($"CROSS JOIN (SELECT \"Id\" FROM \"DoorTypes\" WHERE \"Name\" = {Literal(group.Key)}) dt;");
            sb.AppendLine();
        }
    }

    private static void EmitProductComponents(StringBuilder sb, AppDbContext db, BaselineIds baseline)
    {
        var byProduct = db.ProductComponents.Include(c => c.Product).Where(c => !baseline.ProductIds.Contains(c.ProductId))
            .OrderBy(c => c.Id).AsEnumerable().GroupBy(c => c.Product.Name).ToList();
        if (byProduct.Count == 0) return;

        string[] componentColumnTypes = ["text", "integer", "text", "real", "integer", "text", "integer", "integer", "integer"];

        var total = byProduct.Sum(g => g.Count());
        sb.AppendLine($"-- ProductComponents ({total} rows across {byProduct.Count} products — the DELETE FROM \"Products\" above already cleared any stale components for these via cascade)");
        foreach (var group in byProduct)
        {
            sb.AppendLine($"INSERT INTO \"ProductComponents\" (\"ProductId\", \"ComponentType\", \"ComponentId\", \"CustomName\", \"CustomPrice\", \"Quantity\", \"Configuration\", \"HeightMm\", \"WidthMm\", \"ThicknessMm\")");
            sb.AppendLine($"SELECT p.\"Id\", v.* FROM (VALUES");
            var rows = group.ToList();
            for (int i = 0; i < rows.Count; i++)
            {
                var c = rows[i];
                var values = ZipTyped(new object?[] { c.ComponentType, c.ComponentId, c.CustomName, c.CustomPrice, c.Quantity, c.Configuration, c.HeightMm, c.WidthMm, c.ThicknessMm }, componentColumnTypes);
                sb.AppendLine($"    ({values}){(i == rows.Count - 1 ? "" : ",")}");
            }
            sb.AppendLine(") AS v(\"ComponentType\", \"ComponentId\", \"CustomName\", \"CustomPrice\", \"Quantity\", \"Configuration\", \"HeightMm\", \"WidthMm\", \"ThicknessMm\")");
            sb.AppendLine($"CROSS JOIN (SELECT \"Id\" FROM \"Products\" WHERE \"Name\" = {Literal(group.Key)}) p;");
            sb.AppendLine();
        }
    }

    private static string Literal(object? value) => value switch
    {
        null => "NULL",
        bool b => b ? "TRUE" : "FALSE",
        string s => $"'{s.Replace("'", "''")}'",
        DateTime dt => $"TIMESTAMPTZ '{dt:yyyy-MM-ddTHH:mm:ssZ}'",
        float f => f.ToString(CultureInfo.InvariantCulture),
        double d => d.ToString(CultureInfo.InvariantCulture),
        _ => value.ToString() ?? "NULL",
    };
    
    private static string ZipTyped(object?[] values, string[] pgTypes) =>
        string.Join(", ", values.Zip(pgTypes, (v, t) => v is null ? $"NULL::{t}" : Literal(v)));
}
