using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IHingeTypeFactory
    {
        IEnumerable<HingeType> GetAll();
        HingeType? GetById(int id);
        HingeType Create(HingeType hingeType);
        HingeType? Update(int id, HingeType hingeType);
        bool Delete(int id);
    }

    public class HingeTypeFactory : IHingeTypeFactory
    {
        private readonly AppDbContext _db;

        public HingeTypeFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<HingeType> GetAll() =>
            _db.HingeTypes.AsNoTracking().ToList();

        public HingeType? GetById(int id) =>
            _db.HingeTypes.AsNoTracking().FirstOrDefault(h => h.Id == id);

        public HingeType Create(HingeType hingeType)
        {
            hingeType.CreatedAt = DateTime.UtcNow;
            _db.HingeTypes.Add(hingeType);
            _db.SaveChanges();
            return hingeType;
        }

        public HingeType? Update(int id, HingeType hingeType)
        {
            var existing = _db.HingeTypes.FirstOrDefault(h => h.Id == id);
            if (existing is null) return null;

            existing.Name = hingeType.Name;
            existing.Finish = hingeType.Finish;
            existing.SizeMm = hingeType.SizeMm;
            existing.Description = hingeType.Description;
            existing.Supplier = hingeType.Supplier;
            existing.Colour = hingeType.Colour;
            existing.LabourCost = hingeType.LabourCost;
            existing.Price = hingeType.Price;
            existing.IsActive = hingeType.IsActive;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.HingeTypes.FirstOrDefault(h => h.Id == id);
            if (existing is null) return false;
            _db.HingeTypes.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
