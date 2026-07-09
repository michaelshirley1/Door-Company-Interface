using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using BusinessApi.Models;

namespace BusinessApi.Services;

public class XeroConnectionStatus
{
    public bool Connected { get; set; }
    public string? TenantName { get; set; }
}

public class XeroPushResult
{
    public bool Success { get; set; }
    public string? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? Error { get; set; }
}

public interface IXeroService
{
    string GetAuthorizationUrl();
    Task<bool> ExchangeCodeAsync(string code);
    XeroConnectionStatus GetStatus();
    void Disconnect();
    Task<XeroPushResult> PushInvoiceAsync(Quote quote);
}

public class XeroService : IXeroService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<XeroService> _logger;

    // In-memory token storage (single tenant)
    private string? _accessToken;
    private string? _refreshToken;
    private DateTime _tokenExpiry = DateTime.MinValue;
    private string? _tenantId;
    private string? _tenantName;

    private string ClientId     => _config["Xero:ClientId"]     ?? throw new InvalidOperationException("Xero:ClientId is not configured.");
    private string ClientSecret => _config["Xero:ClientSecret"] ?? throw new InvalidOperationException("Xero:ClientSecret is not configured.");
    private string RedirectUri  => _config["Xero:RedirectUri"]  ?? throw new InvalidOperationException("Xero:RedirectUri is not configured.");

    public XeroService(IConfiguration config, IHttpClientFactory httpClientFactory, ILogger<XeroService> logger)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public string GetAuthorizationUrl()
    {
        const string scopes = "openid profile email offline_access accounting.invoices accounting.contacts";
        var state = Guid.NewGuid().ToString("N");
        return "https://login.xero.com/identity/connect/authorize" +
               $"?response_type=code" +
               $"&client_id={Uri.EscapeDataString(ClientId)}" +
               $"&redirect_uri={Uri.EscapeDataString(RedirectUri)}" +
               $"&scope={Uri.EscapeDataString(scopes)}" +
               $"&state={state}";
    }

    public async Task<bool> ExchangeCodeAsync(string code)
    {
        var client = _httpClientFactory.CreateClient("xero");
        SetBasicAuth(client);

        var body = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"]   = "authorization_code",
            ["code"]         = code,
            ["redirect_uri"] = RedirectUri,
        });

        var response = await client.PostAsync("https://identity.xero.com/connect/token", body);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Xero token exchange failed: {status}", response.StatusCode);
            return false;
        }

        await StoreTokenAsync(await response.Content.ReadAsStringAsync());
        await FetchTenantAsync();
        return true;
    }

    private async Task<bool> RefreshAsync()
    {
        if (_refreshToken is null) return false;

        var client = _httpClientFactory.CreateClient("xero");
        SetBasicAuth(client);

        var body = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"]    = "refresh_token",
            ["refresh_token"] = _refreshToken,
        });

        var response = await client.PostAsync("https://identity.xero.com/connect/token", body);
        if (!response.IsSuccessStatusCode) return false;

        await StoreTokenAsync(await response.Content.ReadAsStringAsync());
        return true;
    }

    private Task StoreTokenAsync(string json)
    {
        var token = JsonSerializer.Deserialize<JsonElement>(json);
        _accessToken  = token.GetProperty("access_token").GetString();
        _refreshToken = token.GetProperty("refresh_token").GetString();
        _tokenExpiry  = DateTime.UtcNow.AddSeconds(token.GetProperty("expires_in").GetInt32() - 60);
        return Task.CompletedTask;
    }

    private async Task FetchTenantAsync()
    {
        var client = _httpClientFactory.CreateClient("xero");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
        var response = await client.GetAsync("https://api.xero.com/connections");
        if (!response.IsSuccessStatusCode) return;

        var connections = JsonSerializer.Deserialize<JsonElement[]>(await response.Content.ReadAsStringAsync());
        if (connections is { Length: > 0 })
        {
            _tenantId   = connections[0].GetProperty("tenantId").GetString();
            _tenantName = connections[0].GetProperty("tenantName").GetString();
        }
    }

    private async Task<string?> GetValidTokenAsync()
    {
        if (_accessToken is null) return null;
        if (DateTime.UtcNow >= _tokenExpiry && !await RefreshAsync()) return null;
        return _accessToken;
    }

    public XeroConnectionStatus GetStatus() => new()
    {
        Connected  = _accessToken is not null,
        TenantName = _tenantName,
    };

    public void Disconnect()
    {
        _accessToken  = null;
        _refreshToken = null;
        _tenantId     = null;
        _tenantName   = null;
        _tokenExpiry  = DateTime.MinValue;
    }

    public async Task<XeroPushResult> PushInvoiceAsync(Quote quote)
    {
        var token = await GetValidTokenAsync();
        if (token is null || _tenantId is null)
            return new XeroPushResult { Error = "Not connected to Xero. Please connect first." };

        var client = _httpClientFactory.CreateClient("xero");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        client.DefaultRequestHeaders.Add("Xero-tenant-id", _tenantId);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var lineItems = (quote.Items ?? []).Select(item => (object)new
        {
            Description = BuildLineDescription(item),
            Quantity    = item.Quantity > 0 ? (int)item.Quantity : 1,
            UnitAmount  = item.UnitPrice ?? 0m,
            TaxType     = "OUTPUT2",  // NZ 15% GST
            AccountCode = "200",      // Sales
        }).ToArray();

        var payload = new
        {
            Invoices = new[]
            {
                new
                {
                    Type            = "ACCREC",
                    Contact         = new { Name = quote.CustomerName },
                    LineItems       = lineItems,
                    Date            = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    DueDate         = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd"),
                    Reference       = quote.CreatedBy ?? quote.QuoteNumber,
                    InvoiceNumber   = quote.QuoteNumber,
                    Status          = "AUTHORISED",
                    LineAmountTypes = "EXCLUSIVE",
                }
            }
        };

        var json     = JsonSerializer.Serialize(payload);
        var content  = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("https://api.xero.com/api.xro/2.0/Invoices", content);

        var responseBody = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Xero push failed: {status} {body}", response.StatusCode, responseBody);
            return new XeroPushResult { Error = $"Xero returned {(int)response.StatusCode}: {responseBody}" };
        }

        var result  = JsonSerializer.Deserialize<JsonElement>(responseBody);
        var created = result.GetProperty("Invoices")[0];
        return new XeroPushResult
        {
            Success       = true,
            InvoiceId     = created.TryGetProperty("InvoiceID",     out var xid)  ? xid.GetString()  : null,
            InvoiceNumber = created.TryGetProperty("InvoiceNumber",  out var xnum) ? xnum.GetString() : null,
        };
    }

    private static string BuildLineDescription(OrderItem item)
    {
        if (item.ItemType is "Hardware" or "DoorLeaf" or "Misc")
            return item.Notes ?? item.ItemType;

        var parts = new List<string>();
        if (item.Assembly          is not null) parts.Add($"Assembly: {item.Assembly}");
        if (item.DoorConfiguration is not null) parts.Add(item.DoorConfiguration);
        if (item.HeightMm is not null && item.WidthMm is not null)
            parts.Add($"{item.HeightMm}x{item.WidthMm}mm");
        if (item.Jam         is not null) parts.Add($"Jamb: {item.Jam}");
        if (item.HandSide    is not null) parts.Add($"{item.HandSide} Hand");
        if (item.ColourFinish is not null) parts.Add(item.ColourFinish);
        if (item.Notes       is not null) parts.Add(item.Notes);
        return parts.Count > 0 ? string.Join(", ", parts) : "Prehung Door";
    }

    private void SetBasicAuth(HttpClient client)
    {
        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{ClientId}:{ClientSecret}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);
    }
}
