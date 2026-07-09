namespace BusinessApi.Models
{
    public class Job
    {
        public int Id { get; set; }
        public int? PurchaseOrderId { get; set; }
        public int CustomerId { get; set; }
        public string? JobNumber { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Status { get; set; } = "Scheduled";
        // Scheduled | InProgress | OnHold | Completed | Cancelled

        public string? SiteAddress { get; set; }
        public string? SiteDescription { get; set; }

        public DateOnly? ScheduledDate { get; set; }
        public DateOnly? CompletedDate { get; set; }
        public string? AssignedTo { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Customer Customer { get; set; } = null!;
        public PurchaseOrder? PurchaseOrder { get; set; }
        public ICollection<OrderItem> Items { get; set; } = [];
    }
}
