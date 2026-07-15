using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Services
{
    public interface IDocumentNumberService
    {
        string Next(string key, string prefix, int padWidth);
    }

    public class DocumentNumberService : IDocumentNumberService
    {
        private readonly AppDbContext _db;

        public DocumentNumberService(AppDbContext db)
        {
            _db = db;
        }

        public string Next(string key, string prefix, int padWidth)
        {
            for (var attempt = 0; attempt < 10; attempt++)
            {
                var seq = _db.DocumentSequences.Find(key);
                if (seq is null)
                {
                    seq = new DocumentSequence { Key = key, NextValue = 1 };
                    _db.DocumentSequences.Add(seq);
                }

                var value = seq.NextValue;
                seq.NextValue = value + 1;

                try
                {
                    _db.SaveChanges();
                    return $"{prefix}{value.ToString().PadLeft(padWidth, '0')}";
                }
                catch (DbUpdateConcurrencyException)
                {
                    _db.Entry(seq).State = EntityState.Detached;
                }
            }

            throw new InvalidOperationException($"Could not allocate a document number for key '{key}' after multiple attempts.");
        }
    }
}
