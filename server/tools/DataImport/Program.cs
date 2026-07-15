using BusinessApi.Data;
using DataImport;
using Microsoft.EntityFrameworkCore;

string? connectionString = null;
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
if (databaseUrl is not null)
{
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':', 2);
    var username = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var port = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');
    connectionString = $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}

string DefaultPath(string name) => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads", name);

var cavitySliderPath = DefaultPath("Cavity Slider list with pricing(1).xlsx");
var jambHingeTrackPath = DefaultPath("jamb_hinges_labour_tracks_pricing.xlsx");
var doorLeafListPath = DefaultPath("DOOR LEaf List for programme with pricing(2).xlsx");
var merchantPricelistPath = DefaultPath("TheDoorshop Merchant Pricelist.docx");

bool dryRun = false;
string? emitSqlPath = null;
string? doorLeafProductsSqlPath = null;
for (int i = 0; i < args.Length; i++)
{
    switch (args[i])
    {
        case "--connection" when i + 1 < args.Length: connectionString = args[++i]; break;
        case "--cavity-sliders" when i + 1 < args.Length: cavitySliderPath = args[++i]; break;
        case "--jamb-hinge-track" when i + 1 < args.Length: jambHingeTrackPath = args[++i]; break;
        case "--door-leaf-list" when i + 1 < args.Length: doorLeafListPath = args[++i]; break;
        case "--merchant-pricelist" when i + 1 < args.Length: merchantPricelistPath = args[++i]; break;
        case "--dry-run": dryRun = true; break;
        case "--emit-sql": emitSqlPath = i + 1 < args.Length && !args[i + 1].StartsWith("--") ? args[++i] : "../../import-data.sql"; break;
        case "--doorleaf-products-sql": doorLeafProductsSqlPath = i + 1 < args.Length && !args[i + 1].StartsWith("--") ? args[++i] : "../../import-doorleaf-products.sql"; break;
    }
}

connectionString ??= "Host=localhost;Database=doorstop;Username=postgres;Password=postgres";

var useInMemory = dryRun || emitSqlPath is not null || doorLeafProductsSqlPath is not null;

Console.WriteLine("DoorStop data importer");
Console.WriteLine(useInMemory ? "Mode: IN-MEMORY (nothing written to a real database)" : $"Connection: {connectionString}");

var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
if (useInMemory) optionsBuilder.UseInMemoryDatabase("import-run");
else optionsBuilder.UseNpgsql(connectionString);
using var db = new AppDbContext(optionsBuilder.Options);

db.Database.EnsureCreated();

var baseline = new BaselineIds(
    db.DoorTypes.Select(d => d.Id).ToHashSet(),
    db.JambTypes.Select(j => j.Id).ToHashSet(),
    db.HingeTypes.Select(h => h.Id).ToHashSet(),
    db.CavitySliderTypes.Select(c => c.Id).ToHashSet(),
    db.TrackTypes.Select(t => t.Id).ToHashSet(),
    db.JambRequirements.Select(r => r.Id).ToHashSet(),
    db.Products.Select(p => p.Id).ToHashSet());

void RunIfExists(string path, Action<AppDbContext, string> importer)
{
    if (!File.Exists(path)) { Console.WriteLine($"\n(skipping — file not found: {path})"); return; }
    importer(db, path);
}

if (doorLeafProductsSqlPath is not null)
{
    RunIfExists(doorLeafListPath, DoorLeafListImporter.Run);
    DoorLeafProductImporter.Run(db);
}
else
{
    RunIfExists(cavitySliderPath, CavitySliderImporter.Run);
    RunIfExists(jambHingeTrackPath, JambHingeTrackImporter.Run);
    RunIfExists(doorLeafListPath, DoorLeafListImporter.Run);
    RunIfExists(merchantPricelistPath, MerchantPricelistImporter.Run);

    DoorLeafProductImporter.Run(db);
    DoorLeafProductImporter.RunForPrehungDoorTypes(db);
}

Console.WriteLine("\n== Summary ==");
Console.WriteLine($"Imported (new rows): {Helpers.Imported}");
Console.WriteLine($"Updated (existing rows refreshed): {Helpers.Updated}");
Console.WriteLine($"Skipped: {Helpers.Skipped}");
Console.WriteLine("\n== Current row counts ==");
Console.WriteLine($"DoorTypes: {db.DoorTypes.Count()}");
Console.WriteLine($"DoorPricingEntries: {db.DoorPricingEntries.Count()}");
Console.WriteLine($"JambTypes: {db.JambTypes.Count()}");
Console.WriteLine($"JambRequirements: {db.JambRequirements.Count()}");
Console.WriteLine($"HingeTypes: {db.HingeTypes.Count()}");
Console.WriteLine($"HandleTypes: {db.HandleTypes.Count()}");
Console.WriteLine($"CavitySliderTypes: {db.CavitySliderTypes.Count()}");
Console.WriteLine($"TrackTypes: {db.TrackTypes.Count()}");
Console.WriteLine($"Products: {db.Products.Count()}");

if (dryRun)
{
    Console.WriteLine("\n== Spot checks ==");
    var cs = db.CavitySliderTypes.FirstOrDefault(c => c.Supplier == "Hallmark" && c.UnitType != null && c.UnitType.Contains("Architrave") && c.HeightMm == 1980 && c.WidthRange == "410-910");
    Console.WriteLine($"Hallmark Architrave 1980/410-910: expected $225, got {(cs?.Price?.ToString() ?? "MISSING")}");

    var jt = db.JambTypes.FirstOrDefault(j => j.Code == "DS3010-21");
    Console.WriteLine($"JambType DS3010-21 cost/metre: expected 0.7, got {(jt?.CostPerMetre?.ToString() ?? "MISSING")}");

    var track = db.TrackTypes.FirstOrDefault(t => t.Code == "SMRED1800AW");
    Console.WriteLine($"TrackType SMRED1800AW price: expected 71.05, got {(track?.Price?.ToString() ?? "MISSING")}");

    var mdf = db.DoorTypes.FirstOrDefault(d => d.Name == "MDF (Flush Panel) HC");
    var single1980 = mdf is null ? null : db.DoorPricingEntries.FirstOrDefault(e => e.DoorTypeId == mdf.Id && e.Configuration == "Single" && e.Jamb == "19mm Flat" && e.HeightMm == 1980 && e.ThicknessMm == 35 && e.WidthMm == 610);
    Console.WriteLine($"MDF (Flush Panel) HC Single/19mm Flat/1980/35mm/610w: expected 98.47, got {(single1980?.Price?.ToString() ?? "MISSING")}");

    var leaf = db.DoorPricingEntries.FirstOrDefault(e => e.PriceFor == "Leaf" && e.HeightMm == 1980 && e.WidthMm == 610 && e.ThicknessMm == 35 &&
        e.DoorType.Name.Contains("PCM Hollowcore Flush"));
    Console.WriteLine($"PCM Hollowcore Flush Leaf/1980/35mm/610w: expected 41.3, got {(leaf?.Price?.ToString() ?? "MISSING")}");

    var doorstop = db.Products.Include(p => p.Components).FirstOrDefault(p => p.Name == "Doorstop — Single 1980mm");
    Console.WriteLine($"Doorstop — Single 1980mm price: expected 4.025, got {(doorstop?.Components.FirstOrDefault()?.CustomPrice?.ToString() ?? "MISSING")}");

    var flushHc = db.DoorTypes.FirstOrDefault(d => d.Name == "Flush Panel Doors (Hollowcore)");
    var flushStd = flushHc is null ? null : db.DoorPricingEntries.FirstOrDefault(e => e.DoorTypeId == flushHc.Id && e.HeightMm == 1980 && e.WidthMm == 610 && e.ThicknessMm == 35);
    Console.WriteLine($"Flush Panel Doors (Hollowcore) 1980/610w/35mm: expected 72, got {(flushStd?.Price?.ToString() ?? "MISSING")}");

    var flushSteel = db.DoorTypes.FirstOrDefault(d => d.Name == "Flush Panel Doors (Hollowcore) — Steel 2 Sides");
    var flushSteelEntry = flushSteel is null ? null : db.DoorPricingEntries.FirstOrDefault(e => e.DoorTypeId == flushSteel.Id && e.HeightMm == 1980 && e.WidthMm == 610 && e.ThicknessMm == 35);
    Console.WriteLine($"Flush Panel Doors (Hollowcore) — Steel 2 Sides 1980/610w: expected 170.04 (was wrongly 2mm thickness before the fix), got {(flushSteelEntry?.Price?.ToString() ?? "MISSING")}");

    var flushHc860 = flushHc is null ? null : db.DoorPricingEntries.FirstOrDefault(e => e.DoorTypeId == flushHc.Id && e.HeightMm == 1980 && e.WidthMm == 510 && e.ThicknessMm == 35);
    Console.WriteLine($"Flush Panel Doors (Hollowcore) 1980/510w (non-standard width from comma-list): expected 72, got {(flushHc860?.Price?.ToString() ?? "MISSING")}");

    var ulcd = db.DoorTypes.FirstOrDefault(d => d.Name.Contains("ULCD"));
    Console.WriteLine($"ULCD DoorType IsCavityOnly: expected True, got {(ulcd is null ? "MISSING" : ulcd.IsCavityOnly.ToString())}");

    var pcmLeafProduct = db.Products.Include(p => p.Components).FirstOrDefault(p => p.Name == "PCM Hollowcore Flush — Standard 35mm Leaf");
    var pcmLeafComponent = pcmLeafProduct?.Components.FirstOrDefault();
    Console.WriteLine($"PCM Hollowcore Flush leaf Product component: expected DoorType/no CustomPrice/1980x810x35, got " +
        $"{pcmLeafComponent?.ComponentType}/{(pcmLeafComponent?.CustomPrice is null ? "no CustomPrice (live-priced)" : "HAS CustomPrice — unexpected")}/{pcmLeafComponent?.HeightMm}x{pcmLeafComponent?.WidthMm}x{pcmLeafComponent?.ThicknessMm}");

    var mdfPairComponent = db.Products.Include(p => p.Components).FirstOrDefault(p => p.Name == "MDF (Flush Panel) HC — Pair, Standard 35mm (19mm Flat)")?.Components.FirstOrDefault();
    Console.WriteLine($"MDF Pair Product component: expected DoorType/CustomPrice=176.27/Pair/1980x810x35, got " +
        $"{mdfPairComponent?.ComponentType}/CustomPrice={mdfPairComponent?.CustomPrice}/{mdfPairComponent?.Configuration}/{mdfPairComponent?.HeightMm}x{mdfPairComponent?.WidthMm}x{mdfPairComponent?.ThicknessMm}");

    var mdfSingle = db.Products.Include(p => p.Components).FirstOrDefault(p => p.Name == "MDF (Flush Panel) HC — Single, Standard 35mm (19mm Flat)");
    Console.WriteLine($"MDF (Flush Panel) HC — Single, Standard 35mm (19mm Flat) Product price: expected 98.47, got {(mdfSingle?.Components.FirstOrDefault()?.CustomPrice?.ToString() ?? "MISSING")}");

    var mdfSingleDeluxe = db.Products.Include(p => p.Components).FirstOrDefault(p => p.Name == "MDF (Flush Panel) HC — Single, Deluxe 37mm (19mm Flat)");
    Console.WriteLine($"MDF (Flush Panel) HC — Single, Deluxe 37mm (19mm Flat) Product price: expected 128.51, got {(mdfSingleDeluxe?.Components.FirstOrDefault()?.CustomPrice?.ToString() ?? "MISSING")}");

    var mdfPair = db.Products.Include(p => p.Components).FirstOrDefault(p => p.Name == "MDF (Flush Panel) HC — Pair, Standard 35mm (19mm Flat)");
    Console.WriteLine($"MDF (Flush Panel) HC — Pair, Standard 35mm (19mm Flat) Product price: expected 176.27, got {(mdfPair?.Components.FirstOrDefault()?.CustomPrice?.ToString() ?? "MISSING")}");
}
if (Helpers.Warnings.Count > 0)
{
    Console.WriteLine("\nWarnings:");
    foreach (var w in Helpers.Warnings) Console.WriteLine($"  - {w}");
}

if (emitSqlPath is not null)
    SqlEmitter.Emit(db, baseline, emitSqlPath);

if (doorLeafProductsSqlPath is not null)
    SqlEmitter.EmitProductsOnly(db, doorLeafProductsSqlPath);

public record BaselineIds(
    HashSet<int> DoorTypeIds,
    HashSet<int> JambTypeIds,
    HashSet<int> HingeTypeIds,
    HashSet<int> CavitySliderTypeIds,
    HashSet<int> TrackTypeIds,
    HashSet<int> JambRequirementIds,
    HashSet<int> ProductIds);
