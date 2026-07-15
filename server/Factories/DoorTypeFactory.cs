using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IDoorTypeFactory
    {
        IEnumerable<DoorType> GetAll(string? leafType = null, string? material = null);
        DoorType? GetById(int id);
        DoorType Create(DoorType doorType);
        DoorType? Update(int id, DoorType doorType);
        bool Delete(int id);
        IEnumerable<DoorPricingEntry> GetPrices(int doorTypeId);
        DoorPricingEntry? AddPrice(int doorTypeId, DoorPricingEntry entry);
        DoorPricingEntry? UpdatePrice(int doorTypeId, int entryId, DoorPricingEntry entry);
        bool DeletePrice(int doorTypeId, int entryId);
        IEnumerable<DoorPricingEntry>? AddPrices(int doorTypeId, IEnumerable<DoorPricingEntry> entries, bool replace);
    }

    public class DoorTypeFactory : IDoorTypeFactory
    {
        private readonly AppDbContext _db;

        public DoorTypeFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<DoorType> GetAll(string? leafType = null, string? material = null)
        {
            IQueryable<DoorType> query = _db.DoorTypes.Include(d => d.Prices).AsNoTracking();
            if (leafType is not null)
                query = query.Where(d => d.LeafType != null && d.LeafType.ToLower() == leafType.ToLower());
            if (material is not null)
                query = query.Where(d => d.Material != null && d.Material.ToLower() == material.ToLower());
            return query.ToList();
        }

        public DoorType? GetById(int id) =>
            _db.DoorTypes.Include(d => d.Prices).AsNoTracking().FirstOrDefault(d => d.Id == id);

        public DoorType Create(DoorType doorType)
        {
            doorType.CreatedAt = DateTime.UtcNow;
            _db.DoorTypes.Add(doorType);
            _db.SaveChanges();
            return doorType;
        }

        public DoorType? Update(int id, DoorType doorType)
        {
            var existing = _db.DoorTypes.FirstOrDefault(d => d.Id == id);
            if (existing is null) return null;

            existing.Name = doorType.Name;
            existing.LeafType = doorType.LeafType;
            existing.Material = doorType.Material;
            existing.ProductRange = doorType.ProductRange;
            existing.SkinThickness = doorType.SkinThickness;
            existing.Colour = doorType.Colour;
            existing.LabourCost = doorType.LabourCost;
            existing.Description = doorType.Description;
            existing.Notes = doorType.Notes;
            existing.IsCavityOnly = doorType.IsCavityOnly;
            existing.IsActive = doorType.IsActive;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.DoorTypes.FirstOrDefault(d => d.Id == id);
            if (existing is null) return false;
            _db.DoorTypes.Remove(existing);
            _db.SaveChanges();
            return true;
        }

        public IEnumerable<DoorPricingEntry> GetPrices(int doorTypeId) =>
            _db.DoorPricingEntries.AsNoTracking()
               .Where(p => p.DoorTypeId == doorTypeId)
               .OrderBy(p => p.Configuration)
               .ThenBy(p => p.Jamb)
               .ThenBy(p => p.HeightMm)
               .ThenBy(p => p.WidthMm)
               .ThenBy(p => p.ThicknessMm)
               .ToList();

        public DoorPricingEntry? AddPrice(int doorTypeId, DoorPricingEntry entry)
        {
            if (!_db.DoorTypes.Any(d => d.Id == doorTypeId)) return null;
            entry.DoorTypeId = doorTypeId;
            entry.DoorType = null!;
            _db.DoorPricingEntries.Add(entry);
            _db.SaveChanges();
            return entry;
        }

        public DoorPricingEntry? UpdatePrice(int doorTypeId, int entryId, DoorPricingEntry entry)
        {
            var existing = _db.DoorPricingEntries.FirstOrDefault(p => p.Id == entryId && p.DoorTypeId == doorTypeId);
            if (existing is null) return null;

            existing.Configuration = entry.Configuration;
            existing.Jamb = entry.Jamb;
            existing.PriceFor = entry.PriceFor;
            existing.HeightMm = entry.HeightMm;
            existing.WidthMm = entry.WidthMm;
            existing.ThicknessMm = entry.ThicknessMm;
            existing.Price = entry.Price;
            existing.IsPOA = entry.IsPOA;
            _db.SaveChanges();
            return existing;
        }

        public bool DeletePrice(int doorTypeId, int entryId)
        {
            var entry = _db.DoorPricingEntries.FirstOrDefault(p => p.Id == entryId && p.DoorTypeId == doorTypeId);
            if (entry is null) return false;
            _db.DoorPricingEntries.Remove(entry);
            _db.SaveChanges();
            return true;
        }

        public IEnumerable<DoorPricingEntry>? AddPrices(int doorTypeId, IEnumerable<DoorPricingEntry> entries, bool replace)
        {
            if (!_db.DoorTypes.Any(d => d.Id == doorTypeId)) return null;

            if (replace)
            {
                var existingEntries = _db.DoorPricingEntries.Where(p => p.DoorTypeId == doorTypeId);
                _db.DoorPricingEntries.RemoveRange(existingEntries);
            }

            var toAdd = entries.ToList();
            foreach (var entry in toAdd)
            {
                entry.Id = 0;
                entry.DoorTypeId = doorTypeId;
                entry.DoorType = null!;
            }
            _db.DoorPricingEntries.AddRange(toAdd);
            _db.SaveChanges();
            return toAdd;
        }
    }
}
