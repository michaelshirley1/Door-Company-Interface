namespace BusinessApi.Models
{
    public class DoorType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? LeafType { get; set; }
        public string? Material { get; set; }
        public string? ProductRange { get; set; }
        public string? SkinThickness { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<DoorPricingEntry> Prices { get; set; } = [];
    }

    public class DoorPricingEntry
    {
        public int Id { get; set; }
        public int DoorTypeId { get; set; }
        public string? Configuration { get; set; } // null = applies to all configs
        public string? PriceFor { get; set; }       // null = both, "Prehung", "Leaf"
        public int HeightMm { get; set; }
        public int WidthMm { get; set; }
        public int ThicknessMm { get; set; } = 35;   // 35 = Standard, 37 = Deluxe, other = manual
        public float Price { get; set; }
        public DoorType DoorType { get; set; } = null!;
    }

    public class JambType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public float Price { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class HingeType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Finish { get; set; }
        public string? SizeMm { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public float Price { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class HandleType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Finish { get; set; }
        public string? Mechanism { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public float Price { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CavitySliderType
    {
        public int Id { get; set; }
        public string Supplier { get; set; } = string.Empty;
        public string ProductSystem { get; set; } = string.Empty;
        public string? UnitType { get; set; }
        public string? StudPocket { get; set; }
        public string? FinishDetail { get; set; }
        public int? HeightMm { get; set; }
        public string? WidthRange { get; set; }
        public float? Price { get; set; }
        public bool IsPOA { get; set; } = false;
        public string PriceBasis { get; set; } = "per unit";
        public string? Category { get; set; }
        public string? Subcategory { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
