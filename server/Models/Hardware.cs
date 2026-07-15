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
        public string? Colour { get; set; }
        public float? LabourCost { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public bool IsCavityOnly { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<DoorPricingEntry> Prices { get; set; } = [];
    }

    public class DoorPricingEntry
    {
        public int Id { get; set; }
        public int DoorTypeId { get; set; }
        public string? Configuration { get; set; }
        public string? Jamb { get; set; }
        public string? PriceFor { get; set; }
        public int HeightMm { get; set; }
        public int WidthMm { get; set; }
        public int ThicknessMm { get; set; } = 35;
        public float? Price { get; set; }
        public bool IsPOA { get; set; } = false;
        public DoorType DoorType { get; set; } = null!;
    }

    public class JambType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Supplier { get; set; }
        public string? Colour { get; set; }
        public float? LabourCost { get; set; }

        public float? CostPerMetre { get; set; }
        public string? ProfileSize { get; set; }
        public string? RebateGroove { get; set; }
        public string? Code { get; set; }

        public float Price { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Metres of jamb required for a given unit type (configuration bucket) at a given door height.
    /// Standalone reference table — not tied to a specific JambType profile.
    /// </summary>
    public class JambRequirement
    {
        public int Id { get; set; }
        public string UnitType { get; set; } = string.Empty;
        public int HeightMm { get; set; }
        public float MetresRequired { get; set; }
    }

    public class HingeType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Finish { get; set; }
        public string? SizeMm { get; set; }
        public string? Description { get; set; }
        public string? Supplier { get; set; }
        public string? Colour { get; set; }
        public float? LabourCost { get; set; }
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
        public string? Supplier { get; set; }
        public string? Colour { get; set; }
        public float? LabourCost { get; set; }
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
        public string? Colour { get; set; }
        public float? LabourCost { get; set; }
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

    /// <summary>
    /// Slider track catalog — mirrors the supplier Tracks price sheet
    /// (Supplier / Track System / Track Type [Double/Triple/Panel Kit] / Width Range / Length / Code / Price).
    /// </summary>
    public class TrackType
    {
        public int Id { get; set; }
        public string Supplier { get; set; } = string.Empty;
        public string TrackSystem { get; set; } = string.Empty;
        public string TrackTypeName { get; set; } = string.Empty;
        public string? WidthRangeMm { get; set; }
        public int? LengthMm { get; set; }
        public string? Code { get; set; }
        public string? Colour { get; set; }
        public float? Price { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
