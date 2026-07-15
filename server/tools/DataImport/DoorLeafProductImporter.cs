using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace DataImport;

/// <summary>
/// Wraps each door leaf (DoorType) x thickness option priced by DoorLeafListImporter into a Product,
/// so it's directly pickable as a quote line item without re-entering height/width/thickness by hand.
/// Each Product carries a real DoorType component (with Configuration/Height/Width/Thickness pinned to
/// the standard 1980 x 810mm size for that thickness) rather than a baked-in price — the quote item
/// modal prices it live from the door pricing matrix, and picking the Product prefills the door form
/// fields so they're still fully visible and editable, not locked behind a flat total. That also means
/// POA/not-yet-priced combinations still get a Product — it'll just price at whatever the matrix says
/// (including $0 until someone fills the POA cell in), no separate regeneration needed once it's priced.
/// </summary>
public static class DoorLeafProductImporter
{
    public static void Run(AppDbContext db)
    {
        Console.WriteLine("\n== Door Leaf Products ==");

        var leafEntries = db.DoorPricingEntries.Include(e => e.DoorType)
            .Where(e => e.PriceFor == "Leaf" && e.Configuration == null && e.Jamb == null)
            .AsEnumerable()
            .GroupBy(e => (e.DoorTypeId, e.ThicknessMm))
            .ToList();

        if (leafEntries.Count == 0) { Console.WriteLine("  (no Leaf-priced DoorPricingEntries found — run the Door Leaf List importer first)"); return; }

        var existingByName = db.Products.Include(p => p.Components).ToDictionary(p => p.Name, p => p);
        int created = 0, updated = 0;

        foreach (var group in leafEntries)
        {
            var doorType = group.First().DoorType;
            var thickness = group.Key.ThicknessMm;

            var chosen = group.FirstOrDefault(e => e.HeightMm == 1980 && e.WidthMm == 810)
                ?? group.OrderBy(e => e.HeightMm).ThenBy(e => e.WidthMm).First();

            var thicknessLabel = thickness switch { 35 => "Standard 35mm", 37 => "Deluxe 37mm", _ => $"{thickness}mm" };
            var name = $"{doorType.Name} — {thicknessLabel} Leaf";

            if (existingByName.TryGetValue(name, out var product))
            {
                var component = product.Components.FirstOrDefault();
                if (component is not null) { component.HeightMm = chosen.HeightMm; component.WidthMm = chosen.WidthMm; component.ThicknessMm = thickness; }
                updated++;
            }
            else
            {
                var entity = new Product
                {
                    Name = name,
                    Description = $"Bare leaf only — priced at the {chosen.HeightMm}x{chosen.WidthMm}mm size, live-priced from the door pricing matrix. Add a jamb/hinges/handle separately, or via a bigger bundle Product, for a full prehung unit.",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Components = [new ProductComponent { ComponentType = "DoorType", ComponentId = doorType.Id, HeightMm = chosen.HeightMm, WidthMm = chosen.WidthMm, ThicknessMm = thickness, Quantity = 1 }],
                };
                db.Products.Add(entity);
                existingByName[name] = entity;
                created++;
            }
        }

        db.SaveChanges();
        Helpers.Imported += created;
        Helpers.Updated += updated;
        Console.WriteLine($"  Created {created}, updated {updated} door-leaf Products across {leafEntries.Count} leaf/thickness combinations (live-priced, none skipped).");
    }

    /// <summary>
    /// Wraps each (DoorType x Configuration x Thickness) priced by MerchantPricelistImporter into a
    /// Product — the "everything that will apply" counterpart to Run() above, for the jamb-inclusive
    /// whole-unit side of the pricing data rather than the bare-leaf side. Priced at the standard
    /// 1980mm height, 19mm Flat jamb (falls back to the smallest height/width actually priced for that
    /// door/config/thickness if that combination isn't one of them). Thickness is part of the grouping
    /// key — the same DoorType can carry both a Standard (35mm) and Deluxe (37mm) price for the same
    /// configuration (that's exactly how "MDF (Flush Panel) HC" is priced), and grouping without it
    /// picks one arbitrarily and silently drops the other.
    ///
    /// Unlike Run() above, this DOES bake in a CustomPrice snapshot alongside the structured DoorType
    /// component: the underlying DoorPricingEntry rows here always have Jamb set (that's the whole
    /// point of the merchant pricelist — jamb-inclusive pricing), and the app's live quote pricing
    /// deliberately ignores jamb-set entries (jamb is always priced loose — see jamb-utils.ts), so a
    /// live re-lookup for these would always come back $0. The component still carries the real
    /// DoorTypeId/Configuration/dimensions so picking the Product prefills the visible form fields —
    /// it just won't recompute to the same number if you then re-select the same jamb, because the app
    /// no longer prices a jamb-inclusive unit that way. The snapshot is what's actually correct here.
    /// </summary>
    public static void RunForPrehungDoorTypes(AppDbContext db)
    {
        Console.WriteLine("\n== Prehung Door Products ==");

        var byDoorConfig = db.DoorPricingEntries.Include(e => e.DoorType)
            .Where(e => e.PriceFor == "Prehung" && e.Configuration != null)
            .AsEnumerable()
            .GroupBy(e => (e.DoorTypeId, e.Configuration, e.ThicknessMm))
            .ToList();

        if (byDoorConfig.Count == 0) { Console.WriteLine("  (no Prehung-priced DoorPricingEntries found — run the Merchant Pricelist importer first)"); return; }

        var existingByName = db.Products.Include(p => p.Components).ToDictionary(p => p.Name, p => p);
        int created = 0, updated = 0, skippedPOA = 0;

        foreach (var group in byDoorConfig)
        {
            var doorType = group.First().DoorType;
            var config = group.Key.Configuration!;
            var thickness = group.Key.ThicknessMm;
            var thicknessLabel = thickness switch { 35 => "Standard 35mm", 37 => "Deluxe 37mm", _ => $"{thickness}mm" };

            var sorted = group.OrderBy(e => e.HeightMm).ThenBy(e => e.WidthMm).ToList();
            var chosen = sorted.FirstOrDefault(e => e.HeightMm == 1980 && e.Jamb == "19mm Flat") ?? sorted.First();

            if (chosen.IsPOA || chosen.Price is null)
            {
                skippedPOA++;
                continue;
            }

            var name = $"{doorType.Name} — {config}, {thicknessLabel} ({chosen.Jamb})";

            if (existingByName.TryGetValue(name, out var product))
            {
                var component = product.Components.FirstOrDefault();
                if (component is not null)
                {
                    component.HeightMm = chosen.HeightMm;
                    component.WidthMm = chosen.WidthMm;
                    component.ThicknessMm = thickness;
                    component.Configuration = config;
                    component.CustomPrice = chosen.Price;
                }
                updated++;
            }
            else
            {
                var entity = new Product
                {
                    Name = name,
                    Description = $"Whole prehung unit (leaf + {chosen.Jamb} jamb, factory-hung) — priced at the {chosen.HeightMm}x{chosen.WidthMm}mm size. This is a snapshot from the merchant pricelist, not live-priced: jamb is always loose in this app's own pricing model, so this whole-unit number can't be reproduced by re-selecting a jamb here.",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Components = [new ProductComponent { ComponentType = "DoorType", ComponentId = doorType.Id, Configuration = config, HeightMm = chosen.HeightMm, WidthMm = chosen.WidthMm, ThicknessMm = thickness, CustomPrice = chosen.Price, Quantity = 1 }],
                };
                db.Products.Add(entity);
                existingByName[name] = entity;
                created++;
            }
        }

        db.SaveChanges();
        Helpers.Imported += created;
        Helpers.Updated += updated;
        Helpers.Skipped += skippedPOA;
        Console.WriteLine($"  Created {created}, updated {updated} prehung-door Products across {byDoorConfig.Count} door/configuration combinations ({skippedPOA} skipped — POA, no price to bake in).");
    }
}
