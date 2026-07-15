using BusinessApi.Data;
using BusinessApi.Models;
using BusinessApi.Services;
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
        OrderItem? SetItemDispatched(int orderId, int itemId, bool isDispatched);
        bool AreAllItemsDispatched(int quoteId);
    }

    public class OrderFactory : IOrderFactory
    {
        private readonly AppDbContext _db;
        private readonly IDocumentNumberService _numberService;

        public OrderFactory(AppDbContext db, IDocumentNumberService numberService)
        {
            _db = db;
            _numberService = numberService;
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
            order.PoNumber = _numberService.Next("PurchaseOrder", "PO-", 4);
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

        public OrderItem? SetItemDispatched(int orderId, int itemId, bool isDispatched)
        {
            var order = _db.PurchaseOrders.AsNoTracking().FirstOrDefault(o => o.Id == orderId);
            if (order is null || order.QuoteId is null) return null;

            var item = _db.OrderItems.FirstOrDefault(i => i.Id == itemId && i.QuoteId == order.QuoteId);
            if (item is null) return null;

            item.IsDispatched = isDispatched;
            _db.SaveChanges();
            return item;
        }

        public bool AreAllItemsDispatched(int quoteId)
        {
            var items = _db.OrderItems.AsNoTracking().Where(i => i.QuoteId == quoteId).ToList();
            return items.Count == 0 || items.All(i => i.IsDispatched);
        }
    }
}
