using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IOrderFactory
    {
        IEnumerable<PurchaseOrder> GetAll();
        PurchaseOrder? GetById(int id);
        PurchaseOrder Create(PurchaseOrder order);
        PurchaseOrder? Update(int id, PurchaseOrder order);
        bool Delete(int id);
    }

    public class OrderFactory : IOrderFactory
    {
        private readonly AppDbContext _db;

        public OrderFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<PurchaseOrder> GetAll() =>
            _db.PurchaseOrders
               .AsNoTracking()
               .Include(o => o.Quote).ThenInclude(q => q!.Items)
               .ToList();

        public PurchaseOrder? GetById(int id) =>
            _db.PurchaseOrders
               .Include(o => o.Quote).ThenInclude(q => q!.Items)
               .FirstOrDefault(o => o.Id == id);

        public PurchaseOrder Create(PurchaseOrder order)
        {
            order.CreatedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;
            _db.PurchaseOrders.Add(order);
            _db.SaveChanges();
            return order;
        }

        public PurchaseOrder? Update(int id, PurchaseOrder order)
        {
            var existing = _db.PurchaseOrders.FirstOrDefault(o => o.Id == id);
            if (existing is null) return null;

            existing.PoNumber = order.PoNumber;
            existing.CustomerName = order.CustomerName;
            existing.Status = order.Status;
            existing.JobId = order.JobId;
            existing.JobNumber = order.JobNumber;
            existing.SiteAddress = order.SiteAddress;
            existing.SiteDescription = order.SiteDescription;
            existing.ExpectedDelivery = order.ExpectedDelivery;
            existing.TotalAmount = order.TotalAmount;
            existing.Notes = order.Notes;
            existing.UpdatedAt = DateTime.UtcNow;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.PurchaseOrders.FirstOrDefault(o => o.Id == id);
            if (existing is null) return false;
            _db.PurchaseOrders.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
