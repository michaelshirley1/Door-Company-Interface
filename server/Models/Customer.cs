namespace BusinessApi.Models
{
    public class Customer
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Notes { get; set; }
        public float? MarginPercent { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Quote> Quotes { get; set; } = [];
        public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = [];
        public ICollection<Job> Jobs { get; set; } = [];
    }
}
