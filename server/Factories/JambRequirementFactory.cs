using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface IJambRequirementFactory
    {
        IEnumerable<JambRequirement> GetAll();
        JambRequirement? GetById(int id);
        JambRequirement Create(JambRequirement requirement);
        JambRequirement? Update(int id, JambRequirement requirement);
        bool Delete(int id);
    }

    public class JambRequirementFactory : IJambRequirementFactory
    {
        private readonly AppDbContext _db;

        public JambRequirementFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<JambRequirement> GetAll() =>
            _db.JambRequirements.AsNoTracking().OrderBy(r => r.UnitType).ThenBy(r => r.HeightMm).ToList();

        public JambRequirement? GetById(int id) =>
            _db.JambRequirements.AsNoTracking().FirstOrDefault(r => r.Id == id);

        public JambRequirement Create(JambRequirement requirement)
        {
            _db.JambRequirements.Add(requirement);
            _db.SaveChanges();
            return requirement;
        }

        public JambRequirement? Update(int id, JambRequirement requirement)
        {
            var existing = _db.JambRequirements.FirstOrDefault(r => r.Id == id);
            if (existing is null) return null;

            existing.UnitType = requirement.UnitType;
            existing.HeightMm = requirement.HeightMm;
            existing.MetresRequired = requirement.MetresRequired;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.JambRequirements.FirstOrDefault(r => r.Id == id);
            if (existing is null) return false;
            _db.JambRequirements.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
