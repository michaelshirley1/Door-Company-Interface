using BusinessApi.Data;
using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Factories
{
    public interface ICustomerFactory
    {
        IEnumerable<Customer> GetAll();
        Customer? GetById(int id);
        Customer Create(Customer customer);
        Customer? Update(int id, Customer customer);
        bool Delete(int id);
    }

    public class CustomerFactory : ICustomerFactory
    {
        private readonly AppDbContext _db;

        public CustomerFactory(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<Customer> GetAll() =>
            _db.Customers.AsNoTracking().ToList();

        public Customer? GetById(int id) =>
            _db.Customers.AsNoTracking().FirstOrDefault(c => c.Id == id);

        public Customer Create(Customer customer)
        {
            customer.CreatedAt = DateTime.UtcNow;
            customer.UpdatedAt = DateTime.UtcNow;
            _db.Customers.Add(customer);
            _db.SaveChanges();
            return customer;
        }

        public Customer? Update(int id, Customer customer)
        {
            var existing = _db.Customers.FirstOrDefault(c => c.Id == id);
            if (existing is null) return null;

            existing.Name = customer.Name;
            existing.CompanyName = customer.CompanyName;
            existing.Email = customer.Email;
            existing.Phone = customer.Phone;
            existing.Address = customer.Address;
            existing.Notes = customer.Notes;
            existing.UpdatedAt = DateTime.UtcNow;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _db.Customers.FirstOrDefault(c => c.Id == id);
            if (existing is null) return false;
            _db.Customers.Remove(existing);
            _db.SaveChanges();
            return true;
        }
    }
}
