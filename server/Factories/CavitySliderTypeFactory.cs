using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface ICavitySliderTypeFactory
    {
        IEnumerable<CavitySliderType> GetAll(string? supplier = null, int? heightMm = null, string? category = null, bool? isPOA = null);
        CavitySliderType? GetById(int id);
        CavitySliderType Create(CavitySliderType cavitySliderType);
        CavitySliderType? Update(int id, CavitySliderType cavitySliderType);
        bool Delete(int id);
    }

    public class CavitySliderTypeFactory : ICavitySliderTypeFactory
    {
        private readonly AppDbContext _db;

        public CavitySliderTypeFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<CavitySliderType> GetAll(string? supplier = null, int? heightMm = null, string? category = null, bool? isPOA = null)
        {
            IQueryable<CavitySliderType> query = _db.CavitySliderTypes.AsNoTracking();
            if (supplier is not null)
                query = query.Where(c => c.Supplier.ToLower() == supplier.ToLower());
            if (heightMm is not null)
                query = query.Where(c => c.HeightMm == heightMm);
            if (category is not null)
                query = query.Where(c => c.Category != null && c.Category.ToLower() == category.ToLower());
            if (isPOA is not null)
                query = query.Where(c => c.IsPOA == isPOA);
            return query.ToList();
        }

        public CavitySliderType? GetById(int id) =>
            _db.CavitySliderTypes.AsNoTracking().FirstOrDefault(c => c.Id == id);

        public CavitySliderType Create(CavitySliderType cavitySliderType)
        {
            cavitySliderType.CreatedAt = DateTime.UtcNow;
            _db.CavitySliderTypes.Add(cavitySliderType);
            _db.SaveChanges();
            return cavitySliderType;
        }

        public CavitySliderType? Update(int id, CavitySliderType cavitySliderType)
        {
            var existing = _db.CavitySliderTypes.FirstOrDefault(c => c.Id == id);
            if (existing is null) return null;

            existing.Supplier = cavitySliderType.Supplier;
            existing.ProductSystem = cavitySliderType.ProductSystem;
            existing.UnitType = cavitySliderType.UnitType;
            existing.StudPocket = cavitySliderType.StudPocket;
            existing.FinishDetail = cavitySliderType.FinishDetail;
            existing.Colour = cavitySliderType.Colour;
            existing.LabourCost = cavitySliderType.LabourCost;
            existing.HeightMm = cavitySliderType.HeightMm;
            existing.WidthRange = cavitySliderType.WidthRange;
            existing.IsPOA = cavitySliderType.IsPOA;
            existing.Price = cavitySliderType.IsPOA ? null : cavitySliderType.Price;
            existing.PriceBasis = cavitySliderType.PriceBasis;
            existing.Category = cavitySliderType.Category;
            existing.Subcategory = cavitySliderType.Subcategory;
            existing.IsActive = cavitySliderType.IsActive;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.CavitySliderTypes.FirstOrDefault(c => c.Id == id);
            if (existing is null) return false;
            _db.CavitySliderTypes.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
