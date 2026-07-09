using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IHandleTypeFactory
    {
        IEnumerable<HandleType> GetAll(string? finish = null, string? mechanism = null);
        HandleType? GetById(int id);
        HandleType Create(HandleType handleType);
        HandleType? Update(int id, HandleType handleType);
        bool Delete(int id);
    }

    public class HandleTypeFactory : IHandleTypeFactory
    {
        private readonly AppDbContext _db;

        public HandleTypeFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<HandleType> GetAll(string? finish = null, string? mechanism = null)
        {
            IQueryable<HandleType> query = _db.HandleTypes.AsNoTracking();
            if (finish is not null)
                query = query.Where(h => h.Finish != null && h.Finish.ToLower() == finish.ToLower());
            if (mechanism is not null)
                query = query.Where(h => h.Mechanism != null && h.Mechanism.ToLower() == mechanism.ToLower());
            return query.ToList();
        }

        public HandleType? GetById(int id) =>
            _db.HandleTypes.AsNoTracking().FirstOrDefault(h => h.Id == id);

        public HandleType Create(HandleType handleType)
        {
            handleType.CreatedAt = DateTime.UtcNow;
            _db.HandleTypes.Add(handleType);
            _db.SaveChanges();
            return handleType;
        }

        public HandleType? Update(int id, HandleType handleType)
        {
            var existing = _db.HandleTypes.FirstOrDefault(h => h.Id == id);
            if (existing is null) return null;

            existing.Name = handleType.Name;
            existing.Finish = handleType.Finish;
            existing.Mechanism = handleType.Mechanism;
            existing.Description = handleType.Description;
            existing.IsActive = handleType.IsActive;
            existing.Price = handleType.Price;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.HandleTypes.FirstOrDefault(h => h.Id == id);
            if (existing is null) return false;
            _db.HandleTypes.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
