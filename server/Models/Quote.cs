namespace BusinessApi.Models
{
    public class Quote
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string QuoteNumber { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft";
        // Draft | Sent | Accepted | Declined | Expired

        public int? JobId { get; set; }
        public string? JobNumber { get; set; }

        public string? SiteAddress { get; set; }
        public string? SiteDescription { get; set; }

        public decimal? TotalAmount { get; set; }
        public DateOnly? ValidUntil { get; set; }
        public string? Notes { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Customer Customer { get; set; } = null!;
        public ICollection<OrderItem> Items { get; set; } = [];
    }
}
