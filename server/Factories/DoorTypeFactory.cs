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
        bool DeletePrice(int doorTypeId, int entryId);
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
            existing.Description = doorType.Description;
            existing.Notes = doorType.Notes;
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

        public bool DeletePrice(int doorTypeId, int entryId)
        {
            var entry = _db.DoorPricingEntries.FirstOrDefault(p => p.Id == entryId && p.DoorTypeId == doorTypeId);
            if (entry is null) return false;
            _db.DoorPricingEntries.Remove(entry);
            _db.SaveChanges();
            return true;
        }
    }
}
