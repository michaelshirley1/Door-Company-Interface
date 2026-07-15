namespace BusinessApi.Models
{
    /// <summary>
    /// A sellable bundle of catalog items (e.g. a door leaf + jamb + hinges) with a rolled-up cost,
    /// usable directly as a quote line item. Rolled-up cost is computed from Components, not stored.
    /// </summary>
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public float? LabourCost { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<ProductComponent> Components { get; set; } = [];
    }

    public class ProductComponent
    {
        public int Id { get; set; }
        public int ProductId { get; set; }

        public string ComponentType { get; set; } = string.Empty;
        public int? ComponentId { get; set; }
        public string? CustomName { get; set; }
        public float? CustomPrice { get; set; }
        public int Quantity { get; set; } = 1;

        public string? Configuration { get; set; }
        public int? HeightMm { get; set; }
        public int? WidthMm { get; set; }
        public int? ThicknessMm { get; set; }

        public Product Product { get; set; } = null!;
    }
}
