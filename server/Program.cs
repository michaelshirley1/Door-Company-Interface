using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BusinessApi.Data;
using BusinessApi.Factories;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var corsOrigins = (Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? "http://localhost:5173,https://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string? connectionString;
if (databaseUrl is not null)
{
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':', 2);
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
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = context =>
                {
                    var appMetadata = context.Principal?.FindFirst("app_metadata")?.Value;
                    if (appMetadata is not null && context.Principal?.Identity is ClaimsIdentity identity)
                    {
                        using var doc = JsonDocument.Parse(appMetadata);
                        if (doc.RootElement.TryGetProperty("role", out var roleEl) && roleEl.ValueKind == JsonValueKind.String)
                            identity.AddClaim(new Claim(ClaimTypes.Role, roleEl.GetString()!));
                    }
                    return Task.CompletedTask;
                },
            };
        });
}
else
{
    builder.Services.AddAuthorizationBuilder()
        .SetFallbackPolicy(null)
        .SetDefaultPolicy(new AuthorizationPolicyBuilder().RequireAssertion(_ => true).Build());
}

builder.Services.AddSingleton<ICurrentUserService>(new CurrentUserService(supabaseUrl is not null));
builder.Services.AddScoped<IDocumentNumberService, DocumentNumberService>();

builder.Services.AddHttpClient("xero");
builder.Services.AddSingleton<IXeroService, XeroService>();

builder.Services.AddHttpClient("supabase-admin");
builder.Services.AddScoped<ISupabaseAdminService, SupabaseAdminService>();

builder.Services.AddScoped<ICustomerFactory,    CustomerFactory>();
builder.Services.AddScoped<IJobFactory,         JobFactory>();
builder.Services.AddScoped<IInvoiceFactory,     InvoiceFactory>();
builder.Services.AddScoped<IOrderFactory,       OrderFactory>();
builder.Services.AddScoped<IQuoteFactory,       QuoteFactory>();
builder.Services.AddScoped<IDoorTypeFactory,         DoorTypeFactory>();
builder.Services.AddScoped<IJambTypeFactory,         JambTypeFactory>();
builder.Services.AddScoped<IJambRequirementFactory,  JambRequirementFactory>();
builder.Services.AddScoped<IHandleTypeFactory,       HandleTypeFactory>();
builder.Services.AddScoped<IHingeTypeFactory,        HingeTypeFactory>();
builder.Services.AddScoped<ICavitySliderTypeFactory, CavitySliderTypeFactory>();
builder.Services.AddScoped<ITrackTypeFactory,        TrackTypeFactory>();
builder.Services.AddScoped<IProductFactory,          ProductFactory>();

var app = builder.Build();

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

if (app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

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
