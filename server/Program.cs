using System.Text;
using System.Text.Json.Serialization;
using BusinessApi.Data;
using BusinessApi.Factories;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// CORS — reads CORS_ORIGINS env var (comma-separated), falls back to localhost
var corsOrigins = (Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? "http://localhost:5173,https://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Database — reads DATABASE_URL env var (postgresql://user:pass@host:port/db), falls back to config
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string? connectionString;
if (databaseUrl is not null)
{
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':', 2); // limit to 2 — passwords can contain ':'
    var username = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var port = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');
    connectionString = $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers(options =>
{
    // Prevent ASP.NET Core from treating non-nullable EF navigation properties as [Required]
    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
})
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title   = "Door API",
        Version = "v1",
        Description = "REST API exposing Job, Invoice, Order, Quote, Customer and hardware type resources."
    });
});

// Auth — validates Supabase JWTs via JWKS (supports ES256/RS256 asymmetric keys)
var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL")
    ?? builder.Configuration["Supabase:Url"];

if (supabaseUrl is not null)
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = $"{supabaseUrl}/auth/v1";
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5),
            };
        });
}
else
{
    builder.Services.AddAuthorizationBuilder().SetFallbackPolicy(null);
}

// Xero integration — reads config from Xero:ClientId/ClientSecret/RedirectUri/FrontendUrl
// or env vars XERO_CLIENT_ID / XERO_CLIENT_SECRET / XERO_REDIRECT_URI / XERO_FRONTEND_URL
builder.Services.AddHttpClient("xero");
builder.Services.AddSingleton<IXeroService, XeroService>();

builder.Services.AddScoped<ICustomerFactory,    CustomerFactory>();
builder.Services.AddScoped<IJobFactory,         JobFactory>();
builder.Services.AddScoped<IInvoiceFactory,     InvoiceFactory>();
builder.Services.AddScoped<IOrderFactory,       OrderFactory>();
builder.Services.AddScoped<IQuoteFactory,       QuoteFactory>();
builder.Services.AddScoped<IDoorTypeFactory,         DoorTypeFactory>();
builder.Services.AddScoped<IJambTypeFactory,         JambTypeFactory>();
builder.Services.AddScoped<IHandleTypeFactory,       HandleTypeFactory>();
builder.Services.AddScoped<IHingeTypeFactory,        HingeTypeFactory>();
builder.Services.AddScoped<ICavitySliderTypeFactory, CavitySliderTypeFactory>();

var app = builder.Build();

// Run EnsureCreated on startup to create schema + seed data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Business API v1"));
}

// Only redirect to HTTPS locally — Render handles HTTPS at the load balancer
if (app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

// Ensure CORS headers are present even when the server returns a 500.
// Without this, browsers show a CORS error that masks the real problem.
app.UseExceptionHandler(err => err.Run(async ctx =>
{
    var origin = ctx.Request.Headers.Origin.FirstOrDefault();
    if (origin is not null && corsOrigins.Contains(origin))
        ctx.Response.Headers.Append("Access-Control-Allow-Origin", origin);
    ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await ctx.Response.WriteAsync("Internal server error");
}));

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
