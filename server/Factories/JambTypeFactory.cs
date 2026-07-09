using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IJambTypeFactory
    {
        IEnumerable<JambType> GetAll();
        JambType? GetById(int id);
        JambType Create(JambType jambType);
        JambType? Update(int id, JambType jambType);
        bool Delete(int id);
    }

    public class JambTypeFactory : IJambTypeFactory
    {
        private readonly AppDbContext _db;

        public JambTypeFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<JambType> GetAll() =>
            _db.JambTypes.AsNoTracking().OrderBy(j => j.Name).ToList();

        public JambType? GetById(int id) =>
            _db.JambTypes.AsNoTracking().FirstOrDefault(j => j.Id == id);

        public JambType Create(JambType jambType)
        {
            jambType.CreatedAt = DateTime.UtcNow;
            _db.JambTypes.Add(jambType);
            _db.SaveChanges();
            return jambType;
        }

        public JambType? Update(int id, JambType jambType)
        {
            var existing = _db.JambTypes.FirstOrDefault(j => j.Id == id);
            if (existing is null) return null;

            existing.Name = jambType.Name;
            existing.Description = jambType.Description;
            existing.Price = jambType.Price;
            existing.IsActive = jambType.IsActive;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.JambTypes.FirstOrDefault(j => j.Id == id);
            if (existing is null) return false;
            _db.JambTypes.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
