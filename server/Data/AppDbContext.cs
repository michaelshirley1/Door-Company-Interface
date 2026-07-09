using BusinessApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Job> Jobs => Set<Job>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<Quote> Quotes => Set<Quote>();
        public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<DoorType> DoorTypes => Set<DoorType>();
        public DbSet<DoorPricingEntry> DoorPricingEntries => Set<DoorPricingEntry>();
        public DbSet<JambType> JambTypes => Set<JambType>();
        public DbSet<HingeType> HingeTypes => Set<HingeType>();
        public DbSet<HandleType> HandleTypes => Set<HandleType>();
        public DbSet<CavitySliderType> CavitySliderTypes => Set<CavitySliderType>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Job → Customer: many-to-one required, OnDelete Restrict
            modelBuilder.Entity<Job>()
                .HasOne(j => j.Customer)
                .WithMany(c => c.Jobs)
                .HasForeignKey(j => j.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Job → PurchaseOrder: one-to-one optional, FK on Job (PurchaseOrderId), no inverse nav
            modelBuilder.Entity<Job>()
                .HasOne(j => j.PurchaseOrder)
                .WithOne()
                .HasForeignKey<Job>(j => j.PurchaseOrderId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // PurchaseOrder → Job: many-to-one optional via PurchaseOrder.JobId (no nav property)
            modelBuilder.Entity<PurchaseOrder>()
                .HasOne<Job>()
                .WithMany()
                .HasForeignKey(po => po.JobId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // Quote → Customer: many-to-one required, OnDelete Restrict
            modelBuilder.Entity<Quote>()
                .HasOne(q => q.Customer)
                .WithMany(c => c.Quotes)
                .HasForeignKey(q => q.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // PurchaseOrder → Customer: many-to-one required, OnDelete Restrict
            modelBuilder.Entity<PurchaseOrder>()
                .HasOne(po => po.Customer)
                .WithMany(c => c.PurchaseOrders)
                .HasForeignKey(po => po.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // PurchaseOrder → Quote: many-to-one optional, FK on PurchaseOrder (QuoteId)
            modelBuilder.Entity<PurchaseOrder>()
                .HasOne(po => po.Quote)
                .WithMany()
                .HasForeignKey(po => po.QuoteId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // Invoice → Job: many-to-one optional, FK on Invoice (JobId)
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Job)
                .WithMany()
                .HasForeignKey(i => i.JobId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // Invoice → Quote: many-to-one optional, FK on Invoice (QuoteId)
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Quote)
                .WithMany()
                .HasForeignKey(i => i.QuoteId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // OrderItem → Job: many-to-one optional
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Job)
                .WithMany(j => j.Items)
                .HasForeignKey(oi => oi.JobId)
                .OnDelete(DeleteBehavior.SetNull);

            // OrderItem → Quote: many-to-one optional
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Quote)
                .WithMany(q => q.Items)
                .HasForeignKey(oi => oi.QuoteId)
                .OnDelete(DeleteBehavior.SetNull);

            // OrderItem → DoorType: many-to-one optional
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.DoorType)
                .WithMany()
                .HasForeignKey(oi => oi.DoorTypeId)
                .OnDelete(DeleteBehavior.SetNull);

            // OrderItem → HingeType: many-to-one optional
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.HingeType)
                .WithMany()
                .HasForeignKey(oi => oi.HingeTypeId)
                .OnDelete(DeleteBehavior.SetNull);

            // OrderItem → HandleType: many-to-one optional
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.HandleType)
                .WithMany()
                .HasForeignKey(oi => oi.HandleTypeId)
                .OnDelete(DeleteBehavior.SetNull);

            // DoorPricingEntry → DoorType: many-to-one, cascade delete
            modelBuilder.Entity<DoorPricingEntry>()
                .HasOne(p => p.DoorType)
                .WithMany(d => d.Prices)
                .HasForeignKey(p => p.DoorTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            // ── Seed Data ──────────────────────────────────────────────────────────

            modelBuilder.Entity<Customer>().HasData(
                new Customer
                {
                    Id = 1,
                    Name = "John Smith",
                    CompanyName = "Smith Building Co",
                    Email = "john@smithbuilding.com",
                    Phone = "021 123 4567",
                    Address = "15 Industry Rd, Auckland",
                    Notes = "Preferred customer — always pays on time.",
                    CreatedAt = new DateTime(2025, 1, 10, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 1, 10, 0, 0, 0, DateTimeKind.Utc),
                },
                new Customer
                {
                    Id = 2,
                    Name = "Sarah Johnson",
                    CompanyName = "Johnson Renovations",
                    Email = "sarah@johnsonreno.com",
                    Phone = "021 987 6543",
                    Address = "42 Commerce St, Wellington",
                    Notes = "Residential renovation specialist.",
                    CreatedAt = new DateTime(2025, 3, 5, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 3, 5, 0, 0, 0, DateTimeKind.Utc),
                },
                new Customer
                {
                    Id = 3,
                    Name = "Mike Williams",
                    CompanyName = "Williams Construction",
                    Email = "mike@williamsconstruction.com",
                    Phone = "027 456 7890",
                    Address = "88 Builder Ave, Christchurch",
                    Notes = "Large commercial builds.",
                    CreatedAt = new DateTime(2025, 6, 20, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 6, 20, 0, 0, 0, DateTimeKind.Utc),
                }
            );

            modelBuilder.Entity<DoorType>().HasData(
                new DoorType
                {
                    Id = 1,
                    Name = "Solid Core Timber",
                    LeafType = "Single",
                    Material = "Timber",
                    Description = "Standard solid core timber door, suitable for interior and exterior use.",
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new DoorType
                {
                    Id = 2,
                    Name = "Hollow Core",
                    LeafType = "Single",
                    Material = "Composite",
                    Description = "Lightweight hollow core door for interior use.",
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new DoorType
                {
                    Id = 3,
                    Name = "Fire Door",
                    LeafType = "Single",
                    Material = "Steel",
                    Description = "FRR 60/60/60 rated fire door for commercial buildings.",
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                }
            );

            modelBuilder.Entity<HingeType>().HasData(
                new HingeType
                {
                    Id = 1,
                    Name = "Butt Hinge",
                    Finish = "Stainless Steel",
                    SizeMm = "100mm",
                    Description = "Standard butt hinge for timber doors.",
                    IsActive = true,
                    Price = 56.23f,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new HingeType
                {
                    Id = 2,
                    Name = "Continuous Hinge",
                    Finish = "Aluminium",
                    SizeMm = "Full Length",
                    Description = "Piano hinge for heavy-duty commercial doors.",
                    IsActive = true,
                    Price = 56.23f,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new HingeType
                {
                    Id = 3,
                    Name = "Spring Hinge",
                    Finish = "Chrome",
                    SizeMm = "75mm",
                    Description = "Self-closing spring hinge for fire doors.",
                    IsActive = true,
                    Price = 56.23f,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                }
            );

            modelBuilder.Entity<HandleType>().HasData(
                new HandleType
                {
                    Id = 1,
                    Name = "Lever Handle",
                    Finish = "Brushed Nickel",
                    Mechanism = "Latch",
                    Description = "Standard lever handle with latch mechanism.",
                    IsActive = true,
                    Price = 56.23f,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new HandleType
                {
                    Id = 2,
                    Name = "Pull Handle",
                    Finish = "Stainless Steel",
                    Mechanism = "Pull",
                    Description = "Straight pull handle for commercial doors.",
                    IsActive = true,
                    Price = 56.23f,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new HandleType
                {
                    Id = 3,
                    Name = "Door Knob",
                    Finish = "Chrome",
                    Mechanism = "Knob",
                    Description = "Classic round door knob with privacy lock.",
                    IsActive = true,
                    Price = 56.23f,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                }
            );

            modelBuilder.Entity<JambType>().HasData(
                new JambType { Id = 1, Name = "112 19 Flat",    Price = 0f, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new JambType { Id = 2, Name = "136 30 Grooved", Price = 0f, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new JambType { Id = 3, Name = "112 30 Flat",    Price = 0f, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new JambType { Id = 4, Name = "92 19 Flat",     Price = 0f, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new JambType { Id = 5, Name = "116 30 Grooved", Price = 0f, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new JambType { Id = 6, Name = "136 18 Grooved", Price = 0f, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );

            modelBuilder.Entity<CavitySliderType>().HasData(
                new CavitySliderType
                {
                    Id = 1,
                    Supplier = "Hallmark",
                    ProductSystem = "Assembled Unit",
                    UnitType = "Single 90mm stud Architrave",
                    StudPocket = "90mm",
                    FinishDetail = "Architrave",
                    HeightMm = 2040,
                    WidthRange = "610-910",
                    Price = 320.00f,
                    IsPOA = false,
                    PriceBasis = "per unit",
                    Category = "Cavity Slider",
                    Subcategory = "Assembled",
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new CavitySliderType
                {
                    Id = 2,
                    Supplier = "CS For Doors",
                    ProductSystem = "SpaceMaker",
                    UnitType = "Single 140mm stud D/G",
                    StudPocket = "140mm",
                    FinishDetail = "Double Grooved",
                    HeightMm = 2040,
                    WidthRange = "610-910",
                    Price = 410.00f,
                    IsPOA = false,
                    PriceBasis = "per unit",
                    Category = "Cavity Slider",
                    Subcategory = "SpaceMaker",
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new CavitySliderType
                {
                    Id = 3,
                    Supplier = "CS For Doors",
                    ProductSystem = "MidWay",
                    UnitType = "Cavity Slider",
                    StudPocket = "90mm stud / 10mm or 13mm linings",
                    FinishDetail = "Grooved",
                    HeightMm = 2400,
                    WidthRange = "Up to 910",
                    IsPOA = true,
                    PriceBasis = "kit",
                    Category = "Cavity Slider",
                    Subcategory = "MidWay",
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                }
            );

            modelBuilder.Entity<Quote>().HasData(
                new Quote
                {
                    Id = 1,
                    QuoteNumber = "QTE-JOB-001",
                    CustomerId = 1,
                    CustomerName = "Smith Building Co",
                    Status = "Sent",
                    JobId = 1,
                    JobNumber = "JOB-001",
                    SiteAddress = "15 Industry Rd, Auckland",
                    SiteDescription = "Interior door replacement — levels 1 and 2.",
                    TotalAmount = 1385.00m,
                    ValidUntil = new DateOnly(2026, 8, 31),
                    CreatedBy = "Tom Baker",
                    Notes = "Price includes supply and install.",
                    CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                },
                new Quote
                {
                    Id = 2,
                    QuoteNumber = "QTE-JOB-002",
                    CustomerId = 2,
                    CustomerName = "Johnson Renovations",
                    Status = "Draft",
                    JobId = 2,
                    JobNumber = "JOB-002",
                    SiteAddress = "42 Commerce St, Wellington",
                    SiteDescription = "Fire door installation — stairwells.",
                    TotalAmount = 3600.00m,
                    ValidUntil = new DateOnly(2026, 9, 15),
                    CreatedBy = "Dave Wilson",
                    CreatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new Quote
                {
                    Id = 3,
                    QuoteNumber = "QTE-JOB-003",
                    CustomerId = 3,
                    CustomerName = "Williams Construction",
                    Status = "Accepted",
                    JobId = 3,
                    JobNumber = "JOB-003",
                    SiteAddress = "88 Builder Ave, Christchurch",
                    SiteDescription = "Full door package for new commercial build.",
                    TotalAmount = 2150.00m,
                    ValidUntil = new DateOnly(2026, 9, 30),
                    CreatedBy = "Tom Baker",
                    Notes = "Accepted by client on 2026-06-10.",
                    CreatedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc),
                }
            );

            modelBuilder.Entity<PurchaseOrder>().HasData(
                new PurchaseOrder
                {
                    Id = 1,
                    CustomerId = 1,
                    CustomerName = "Smith Building Co",
                    QuoteId = 1,
                    PoNumber = "PO-2026-001",
                    Status = "Confirmed",
                    JobId = 1,
                    JobNumber = "JOB-001",
                    SiteAddress = "15 Industry Rd, Auckland",
                    OrderDate = new DateOnly(2026, 6, 20),
                    ExpectedDelivery = new DateOnly(2026, 7, 28),
                    TotalAmount = 1385.00m,
                    Notes = "Deliver to site office.",
                    CreatedAt = new DateTime(2026, 6, 20, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 6, 20, 0, 0, 0, DateTimeKind.Utc),
                },
                new PurchaseOrder
                {
                    Id = 2,
                    CustomerId = 2,
                    CustomerName = "Johnson Renovations",
                    QuoteId = 2,
                    PoNumber = "PO-2026-002",
                    Status = "InProduction",
                    JobId = 2,
                    JobNumber = "JOB-002",
                    SiteAddress = "42 Commerce St, Wellington",
                    OrderDate = new DateOnly(2026, 7, 1),
                    ExpectedDelivery = new DateOnly(2026, 8, 10),
                    TotalAmount = 3600.00m,
                    CreatedAt = new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new PurchaseOrder
                {
                    Id = 3,
                    CustomerId = 3,
                    CustomerName = "Williams Construction",
                    QuoteId = 3,
                    PoNumber = "PO-2026-003",
                    Status = "Delivered",
                    JobId = 3,
                    JobNumber = "JOB-003",
                    SiteAddress = "88 Builder Ave, Christchurch",
                    OrderDate = new DateOnly(2026, 6, 10),
                    ExpectedDelivery = new DateOnly(2026, 6, 25),
                    TotalAmount = 2150.00m,
                    Notes = "All items delivered and signed off.",
                    CreatedAt = new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 6, 25, 0, 0, 0, DateTimeKind.Utc),
                }
            );

            modelBuilder.Entity<Job>().HasData(
                new Job
                {
                    Id = 1,
                    JobNumber = "JOB-001",
                    CustomerId = 1,
                    CustomerName = "Smith Building Co",
                    Status = "InProgress",
                    SiteAddress = "15 Industry Rd, Auckland",
                    SiteDescription = "Replace all interior doors on levels 1 and 2.",
                    AssignedTo = "Tom Baker",
                    ScheduledDate = new DateOnly(2026, 7, 28),
                    Notes = "Client wants all hardware matched — brushed nickel throughout.",
                    CreatedAt = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new Job
                {
                    Id = 2,
                    JobNumber = "JOB-002",
                    CustomerId = 2,
                    CustomerName = "Johnson Renovations",
                    Status = "Scheduled",
                    SiteAddress = "42 Commerce St, Wellington",
                    SiteDescription = "Install new fire doors in stairwells.",
                    AssignedTo = "Dave Wilson",
                    ScheduledDate = new DateOnly(2026, 8, 10),
                    Notes = "Confirm with building inspector before install.",
                    CreatedAt = new DateTime(2026, 6, 15, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 6, 15, 0, 0, 0, DateTimeKind.Utc),
                },
                new Job
                {
                    Id = 3,
                    JobNumber = "JOB-003",
                    CustomerId = 3,
                    CustomerName = "Williams Construction",
                    Status = "Completed",
                    SiteAddress = "88 Builder Ave, Christchurch",
                    SiteDescription = "Full door package for new commercial build.",
                    AssignedTo = "Tom Baker",
                    ScheduledDate = new DateOnly(2026, 6, 1),
                    CompletedDate = new DateOnly(2026, 6, 30),
                    Notes = "All items installed and signed off by site manager.",
                    CreatedAt = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                }
            );

            modelBuilder.Entity<Invoice>().HasData(
                new Invoice
                {
                    Id = 1,
                    JobId = 1,
                    JobNumber = "JOB-001",
                    QuoteId = 1,
                    QuoteNumber = "QTE-JOB-001",
                    CustomerName = "Smith Building Co",
                    InvoiceNumber = "INV-001",
                    Status = "Sent",
                    Subtotal = 1204.35m,
                    TaxRate = 0.15m,
                    TaxAmount = 180.65m,
                    Total = 1385.00m,
                    AmountPaid = 0m,
                    DueDate = "2026-08-28",
                    IssuedAt = "2026-07-28",
                    Notes = "Payment due within 30 days.",
                    CreatedAt = new DateTime(2026, 7, 28, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 7, 28, 0, 0, 0, DateTimeKind.Utc),
                },
                new Invoice
                {
                    Id = 2,
                    JobId = 2,
                    JobNumber = "JOB-002",
                    QuoteId = 2,
                    QuoteNumber = "QTE-JOB-002",
                    CustomerName = "Johnson Renovations",
                    InvoiceNumber = "INV-002",
                    Status = "Draft",
                    Subtotal = 3130.43m,
                    TaxRate = 0.15m,
                    TaxAmount = 469.57m,
                    Total = 3600.00m,
                    AmountPaid = 0m,
                    DueDate = "2026-09-10",
                    CreatedAt = new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new Invoice
                {
                    Id = 3,
                    JobId = 3,
                    JobNumber = "JOB-003",
                    QuoteId = 3,
                    QuoteNumber = "QTE-JOB-003",
                    CustomerName = "Williams Construction",
                    InvoiceNumber = "INV-003",
                    Status = "Paid",
                    Subtotal = 1869.57m,
                    TaxRate = 0.15m,
                    TaxAmount = 280.43m,
                    Total = 2150.00m,
                    AmountPaid = 2150.00m,
                    DueDate = "2026-07-20",
                    IssuedAt = "2026-07-01",
                    PaidAt = "2026-07-05",
                    Notes = "Paid in full.",
                    CreatedAt = new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 7, 5, 0, 0, 0, DateTimeKind.Utc),
                }
            );

            modelBuilder.Entity<OrderItem>().HasData(
                new OrderItem
                {
                    Id = 1,
                    QuoteId = 1,
                    ItemType = "Prehung",
                    DoorTypeId = 1,
                    DoorConfiguration = "Single",
                    Room = "Office 1",
                    HeightMm = 2040,
                    WidthMm = 820,
                    ThicknessMm = 40,
                    HandSide = "Left",
                    Drilling = true,
                    DrillSize = "54mm",
                    Quantity = 2,
                    UnitPrice = 650.00m,
                    Notes = "Frame to be painted before install.",
                    SortOrder = 1,
                    CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                },
                new OrderItem
                {
                    Id = 2,
                    QuoteId = 1,
                    ItemType = "Hardware",
                    Room = "Office 1",
                    Quantity = 2,
                    UnitPrice = 42.50m,
                    Notes = "Lever Handle — Brushed Nickel",
                    SortOrder = 2,
                    CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                },
                new OrderItem
                {
                    Id = 3,
                    QuoteId = 2,
                    ItemType = "Prehung",
                    DoorTypeId = 3,
                    DoorConfiguration = "Single",
                    Room = "Stairwell A",
                    HeightMm = 2100,
                    WidthMm = 900,
                    ThicknessMm = 45,
                    HandSide = "Right",
                    Drilling = false,
                    FireRating = "FRR 60/60/60",
                    Quantity = 3,
                    UnitPrice = 1200.00m,
                    Notes = "Confirm FRR certification with building inspector prior to install.",
                    SortOrder = 1,
                    CreatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                },
                new OrderItem
                {
                    Id = 4,
                    QuoteId = 3,
                    ItemType = "Prehung",
                    DoorTypeId = 2,
                    DoorConfiguration = "Single",
                    Room = "Reception",
                    HeightMm = 2400,
                    WidthMm = 1200,
                    ThicknessMm = 40,
                    HandSide = "Right",
                    Drilling = true,
                    Glazing = "Clear 6mm",
                    Quantity = 1,
                    UnitPrice = 1800.00m,
                    Notes = "Glazing panel to be installed by glazier separately.",
                    SortOrder = 1,
                    CreatedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                },
                new OrderItem
                {
                    Id = 5,
                    QuoteId = 3,
                    ItemType = "Misc",
                    Quantity = 1,
                    UnitPrice = 350.00m,
                    Notes = "Delivery to site — call ahead 24 hours.",
                    SortOrder = 2,
                    CreatedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                }
            );
        }
    }
}
