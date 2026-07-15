using BusinessApi.Data;
using BusinessApi.Models;
using BusinessApi.Services;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IJobFactory
    {
        IEnumerable<Job> GetAll();
        Job? GetById(int id);
        Job Create(Job job);
        Job? Update(int id, Job job);
        bool Delete(int id);
    }

    public class JobFactory : IJobFactory
    {
        private readonly AppDbContext _db;
        private readonly IDocumentNumberService _numberService;

        public JobFactory(AppDbContext db, IDocumentNumberService numberService)
        {
            _db = db;
            _numberService = numberService;
        }

        public IEnumerable<Job> GetAll() =>
            _db.Jobs.AsNoTracking().Include(j => j.Items).ToList();

        public Job? GetById(int id) =>
            _db.Jobs
                .Include(j => j.Items)
                .Include(j => j.Customer)
                .Include(j => j.PurchaseOrder)
                .FirstOrDefault(j => j.Id == id);

        public Job Create(Job job)
        {
            job.JobNumber = _numberService.Next("Job", "JOB-", 4);
            job.CreatedAt = DateTime.UtcNow;
            job.UpdatedAt = DateTime.UtcNow;
            foreach (var item in job.Items)
                item.CreatedAt = DateTime.UtcNow;
            _db.Jobs.Add(job);
            _db.SaveChanges();
            return job;
        }

        public Job? Update(int id, Job job)
        {
            var existing = _db.Jobs
                .Include(j => j.Items)
                .FirstOrDefault(j => j.Id == id);
            if (existing is null) return null;

            existing.CustomerId = job.CustomerId;
            existing.CustomerName = job.CustomerName;
            existing.PurchaseOrderId = job.PurchaseOrderId;
            existing.Status = job.Status;
            existing.SiteAddress = job.SiteAddress;
            existing.SiteDescription = job.SiteDescription;
            existing.AssignedTo = job.AssignedTo;
            existing.ScheduledDate = job.ScheduledDate;
            existing.CompletedDate = job.CompletedDate;
            existing.Notes = job.Notes;
            existing.UpdatedAt = DateTime.UtcNow;

            foreach (var old in existing.Items.ToList())
                _db.Remove(old);

            foreach (var item in job.Items ?? [])
            {
                item.Id = 0;
                item.JobId = id;
                item.QuoteId = null;
                item.CreatedAt = DateTime.UtcNow;
                _db.OrderItems.Add(item);
            }

            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.Jobs.FirstOrDefault(j => j.Id == id);
            if (existing is null) return false;
            _db.Jobs.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
