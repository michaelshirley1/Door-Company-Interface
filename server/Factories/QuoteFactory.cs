using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IQuoteFactory
    {
        IEnumerable<Quote> GetAll();
        Quote? GetById(int id);
        Quote Create(Quote quote);
        Quote? Update(int id, Quote quote);
        bool Delete(int id);
    }

    public class QuoteFactory : IQuoteFactory
    {
        private readonly AppDbContext _db;

        public QuoteFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<Quote> GetAll() =>
            _db.Quotes.AsNoTracking().Include(q => q.Items).ToList();

        public Quote? GetById(int id) =>
            _db.Quotes.Include(q => q.Items).FirstOrDefault(q => q.Id == id);

        public Quote Create(Quote quote)
        {
            quote.CreatedAt = DateTime.UtcNow;
            quote.UpdatedAt = DateTime.UtcNow;
            foreach (var item in quote.Items)
            {
                item.Id = 0;
                item.JobId = null;
                item.CreatedAt = DateTime.UtcNow;
            }
            _db.Quotes.Add(quote);
            _db.SaveChanges();
            return quote;
        }

        public Quote? Update(int id, Quote quote)
        {
            var existing = _db.Quotes.Include(q => q.Items).FirstOrDefault(q => q.Id == id);
            if (existing is null) return null;

            existing.QuoteNumber = quote.QuoteNumber;
            existing.CustomerId = quote.CustomerId;
            existing.CustomerName = quote.CustomerName;
            existing.Status = quote.Status;
            existing.JobId = quote.JobId;
            existing.JobNumber = quote.JobNumber;
            existing.SiteAddress = quote.SiteAddress;
            existing.SiteDescription = quote.SiteDescription;
            existing.TotalAmount = quote.TotalAmount;
            existing.ValidUntil = quote.ValidUntil;
            existing.CreatedBy = quote.CreatedBy;
            existing.Notes = quote.Notes;
            existing.UpdatedAt = DateTime.UtcNow;

            foreach (var old in existing.Items.ToList())
                _db.Remove(old);

            foreach (var item in quote.Items ?? [])
            {
                item.Id = 0;
                item.QuoteId = id;
                item.JobId = null;
                item.CreatedAt = DateTime.UtcNow;
                _db.OrderItems.Add(item);
            }

            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.Quotes.FirstOrDefault(q => q.Id == id);
            if (existing is null) return false;
            _db.Quotes.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
