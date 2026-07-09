using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IInvoiceFactory
    {
        IEnumerable<Invoice> GetAll();
        Invoice? GetById(int id);
        Invoice Create(Invoice invoice);
        Invoice? Update(int id, Invoice invoice);
        bool Delete(int id);
    }

    public class InvoiceFactory : IInvoiceFactory
    {
        private readonly AppDbContext _db;

        public InvoiceFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<Invoice> GetAll() =>
            _db.Invoices.AsNoTracking().ToList();

        public Invoice? GetById(int id) =>
            _db.Invoices.AsNoTracking().FirstOrDefault(i => i.Id == id);

        public Invoice Create(Invoice invoice)
        {
            invoice.CreatedAt = DateTime.UtcNow;
            invoice.UpdatedAt = DateTime.UtcNow;
            _db.Invoices.Add(invoice);
            _db.SaveChanges();
            return invoice;
        }

        public Invoice? Update(int id, Invoice invoice)
        {
            var existing = _db.Invoices.FirstOrDefault(i => i.Id == id);
            if (existing is null) return null;

            existing.JobId = invoice.JobId;
            existing.JobNumber = invoice.JobNumber;
            existing.QuoteId = invoice.QuoteId;
            existing.QuoteNumber = invoice.QuoteNumber;
            existing.CustomerName = invoice.CustomerName;
            existing.InvoiceNumber = invoice.InvoiceNumber;
            existing.Status = invoice.Status;
            existing.Subtotal = invoice.Subtotal;
            existing.TaxRate = invoice.TaxRate;
            existing.TaxAmount = invoice.TaxAmount;
            existing.Total = invoice.Total;
            existing.AmountPaid = invoice.AmountPaid;
            existing.DueDate = invoice.DueDate;
            existing.IssuedAt = invoice.IssuedAt;
            existing.PaidAt = invoice.PaidAt;
            existing.Notes = invoice.Notes;
            existing.UpdatedAt = DateTime.UtcNow;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.Invoices.FirstOrDefault(i => i.Id == id);
            if (existing is null) return false;
            _db.Invoices.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
