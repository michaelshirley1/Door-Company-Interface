using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface ITrackTypeFactory
    {
        IEnumerable<TrackType> GetAll(string? supplier = null, string? trackTypeName = null);
        TrackType? GetById(int id);
        TrackType Create(TrackType trackType);
        TrackType? Update(int id, TrackType trackType);
        bool Delete(int id);
    }

    public class TrackTypeFactory : ITrackTypeFactory
    {
        private readonly AppDbContext _db;

        public TrackTypeFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<TrackType> GetAll(string? supplier = null, string? trackTypeName = null)
        {
            IQueryable<TrackType> query = _db.TrackTypes.AsNoTracking();
            if (supplier is not null)
                query = query.Where(t => t.Supplier.ToLower() == supplier.ToLower());
            if (trackTypeName is not null)
                query = query.Where(t => t.TrackTypeName.ToLower() == trackTypeName.ToLower());
            return query.ToList();
        }

        public TrackType? GetById(int id) =>
            _db.TrackTypes.AsNoTracking().FirstOrDefault(t => t.Id == id);

        public TrackType Create(TrackType trackType)
        {
            trackType.CreatedAt = DateTime.UtcNow;
            _db.TrackTypes.Add(trackType);
            _db.SaveChanges();
            return trackType;
        }

        public TrackType? Update(int id, TrackType trackType)
        {
            var existing = _db.TrackTypes.FirstOrDefault(t => t.Id == id);
            if (existing is null) return null;

            existing.Supplier = trackType.Supplier;
            existing.TrackSystem = trackType.TrackSystem;
            existing.TrackTypeName = trackType.TrackTypeName;
            existing.WidthRangeMm = trackType.WidthRangeMm;
            existing.LengthMm = trackType.LengthMm;
            existing.Code = trackType.Code;
            existing.Colour = trackType.Colour;
            existing.Price = trackType.Price;
            existing.IsActive = trackType.IsActive;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.TrackTypes.FirstOrDefault(t => t.Id == id);
            if (existing is null) return false;
            _db.TrackTypes.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
