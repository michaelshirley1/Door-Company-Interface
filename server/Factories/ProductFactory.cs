using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IProductFactory
    {
        IEnumerable<Product> GetAll();
        Product? GetById(int id);
        Product Create(Product product);
        Product? Update(int id, Product product);
        bool Delete(int id);
    }

    public class ProductFactory : IProductFactory
    {
        private readonly AppDbContext _db;

        public ProductFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<Product> GetAll() =>
            _db.Products.AsNoTracking().Include(p => p.Components).ToList();

        public Product? GetById(int id) =>
            _db.Products.Include(p => p.Components).FirstOrDefault(p => p.Id == id);

        public Product Create(Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            foreach (var component in product.Components)
                component.Id = 0;
            _db.Products.Add(product);
            _db.SaveChanges();
            return product;
        }

        public Product? Update(int id, Product product)
        {
            var existing = _db.Products.Include(p => p.Components).FirstOrDefault(p => p.Id == id);
            if (existing is null) return null;

            existing.Name = product.Name;
            existing.Description = product.Description;
            existing.LabourCost = product.LabourCost;
            existing.IsActive = product.IsActive;

            foreach (var old in existing.Components.ToList())
                _db.Remove(old);

            foreach (var component in product.Components ?? [])
            {
                component.Id = 0;
                component.ProductId = id;
                _db.ProductComponents.Add(component);
            }

            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.Products.FirstOrDefault(p => p.Id == id);
            if (existing is null) return false;
            _db.Products.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
