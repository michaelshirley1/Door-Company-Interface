namespace BusinessApi.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int? JobId { get; set; }
        public int? QuoteId { get; set; }

        public string ItemType { get; set; } = "Prehung";

        public string? DoorConfiguration { get; set; }

        public int? DoorTypeId { get; set; }
        public int? HingeTypeId { get; set; }
        public int? HandleTypeId { get; set; }
        public int? CavitySliderTypeId { get; set; }
        public int? TrackTypeId { get; set; }
        public int? ProductId { get; set; }

        public string? Room { get; set; }

        public string? Assembly { get; set; }
        public decimal? HeightMm { get; set; }
        public decimal? WidthMm { get; set; }
        public decimal? ThicknessMm { get; set; }
        public string? HandSide { get; set; }
        public bool Drilling { get; set; } = false;
        public string? DrillSize { get; set; }
        public string? Jam { get; set; }
        public string? ColourFinish { get; set; }
        public string? Glazing { get; set; }
        public string? FireRating { get; set; }

        public int? HingeCount { get; set; }
        public string? TrackSystem { get; set; }
        public string? TrackType { get; set; }
        public string? Reveal { get; set; }

        public int Quantity { get; set; } = 1;
        public decimal? UnitPrice { get; set; }
        public float? MarginPercent { get; set; }
        public bool IsDispatched { get; set; } = false;

        public string? Notes { get; set; }
        public int SortOrder { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Job? Job { get; set; }
        public Quote? Quote { get; set; }
        public DoorType? DoorType { get; set; }
        public HingeType? HingeType { get; set; }
        public HandleType? HandleType { get; set; }
        public CavitySliderType? CavitySliderType { get; set; }
        public TrackType? TrackTypeRef { get; set; }
        public Product? Product { get; set; }
    }

    public class PurchaseOrder
    {
        public int Id { get; set; }
        public int? QuoteId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? PoNumber { get; set; }
        public string Status { get; set; } = "Received";

        public int? JobId { get; set; }
        public string? JobNumber { get; set; }
        public string? SiteAddress { get; set; }
        public string? SiteDescription { get; set; }

        public DateOnly OrderDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
        public DateOnly? ExpectedDelivery { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Customer Customer { get; set; } = null!;
        public Quote? Quote { get; set; }
    }
}
