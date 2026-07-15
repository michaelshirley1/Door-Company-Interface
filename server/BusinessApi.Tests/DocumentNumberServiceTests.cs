using BusinessApi.Data;
using BusinessApi.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BusinessApi.Tests
{
    public class DocumentNumberServiceTests
    {
        private static AppDbContext NewContext(string dbName) =>
            new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(dbName).Options);

        [Fact]
        public void Next_ReturnsSequentialFormattedValues_ForTheSameKey()
        {
            using var db = NewContext(Guid.NewGuid().ToString());
            var service = new DocumentNumberService(db);

            Assert.Equal("JOB-0001", service.Next("Job", "JOB-", 4));
            Assert.Equal("JOB-0002", service.Next("Job", "JOB-", 4));
            Assert.Equal("JOB-0003", service.Next("Job", "JOB-", 4));
        }

        [Fact]
        public void Next_TracksSeparateSequences_PerKey()
        {
            using var db = NewContext(Guid.NewGuid().ToString());
            var service = new DocumentNumberService(db);

            Assert.Equal("JOB-0001", service.Next("Job", "JOB-", 4));
            Assert.Equal("QTE-0001", service.Next("Quote", "QTE-", 4));
            Assert.Equal("JOB-0002", service.Next("Job", "JOB-", 4));
        }

        [Fact]
        public void Next_PersistsAcrossSeparateDbContexts_LikeSeparateRequestsWould()
        {
            var dbName = Guid.NewGuid().ToString();

            using (var db1 = NewContext(dbName))
                Assert.Equal("PO-0001", new DocumentNumberService(db1).Next("PurchaseOrder", "PO-", 4));

            using (var db2 = NewContext(dbName))
                Assert.Equal("PO-0002", new DocumentNumberService(db2).Next("PurchaseOrder", "PO-", 4));
        }
    }
}
