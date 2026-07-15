using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BusinessApi.Services;

public record SupabaseUserSummary(string Id, string? Email, string Role, bool InviteAccepted, DateTime? CreatedAt);

public interface ISupabaseAdminService
{
    Task<List<SupabaseUserSummary>> ListUsersAsync();
    Task<SupabaseUserSummary> InviteUserAsync(string email, string role);
    Task<SupabaseUserSummary> SetRoleAsync(string userId, string role);
}

/// <summary>
/// Talks to Supabase's GoTrue Admin REST API (not the JS admin SDK — this backend is .NET) using the
/// project's service_role secret key. That key bypasses all RLS/row ownership and can manage every
/// auth user, so it must only ever live server-side (SUPABASE_SERVICE_ROLE_KEY / Supabase:ServiceRoleKey)
/// — never send it to the frontend, never log it.
/// </summary>
public class SupabaseAdminService : ISupabaseAdminService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    private string SupabaseUrl =>
        Environment.GetEnvironmentVariable("SUPABASE_URL")
        ?? _config["Supabase:Url"]
        ?? throw new InvalidOperationException("Supabase:Url is not configured.");

    private string ServiceRoleKey =>
        Environment.GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY")
        ?? _config["Supabase:ServiceRoleKey"]
        ?? throw new InvalidOperationException("Supabase:ServiceRoleKey is not configured — get it from the Supabase dashboard under Project Settings > API > service_role secret.");

    public SupabaseAdminService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    private HttpClient Client()
    {
        var client = _httpClientFactory.CreateClient("supabase-admin");
        client.BaseAddress = new Uri($"{SupabaseUrl.TrimEnd('/')}/auth/v1/");
        client.DefaultRequestHeaders.Add("apikey", ServiceRoleKey);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ServiceRoleKey);
        return client;
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, string action)
    {
        if (response.IsSuccessStatusCode) return;
        var body = await response.Content.ReadAsStringAsync();
        throw new InvalidOperationException($"Supabase {action} failed ({(int)response.StatusCode}): {body}");
    }

    public async Task<List<SupabaseUserSummary>> ListUsersAsync()
    {
        var client = Client();
        var response = await client.GetAsync("admin/users?per_page=200");
        await EnsureSuccessAsync(response, "list users");

        var body = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync());
        return body.GetProperty("users").EnumerateArray().Select(ParseUser).ToList();
    }

    public async Task<SupabaseUserSummary> InviteUserAsync(string email, string role)
    {
        var client = Client();
        var invitePayload = JsonSerializer.Serialize(new { email });
        var inviteResponse = await client.PostAsync("invite", new StringContent(invitePayload, Encoding.UTF8, "application/json"));
        await EnsureSuccessAsync(inviteResponse, "invite user");

        var invited = JsonSerializer.Deserialize<JsonElement>(await inviteResponse.Content.ReadAsStringAsync());
        var userId = invited.GetProperty("id").GetString()!;

        return await SetRoleAsync(userId, role);
    }

    public async Task<SupabaseUserSummary> SetRoleAsync(string userId, string role)
    {
        var client = Client();
        var payload = JsonSerializer.Serialize(new { app_metadata = new { role } });
        var response = await client.PutAsync($"admin/users/{userId}", new StringContent(payload, Encoding.UTF8, "application/json"));
        await EnsureSuccessAsync(response, "update user role");

        var updated = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync());
        return ParseUser(updated);
    }

    private static SupabaseUserSummary ParseUser(JsonElement u)
    {
        var id = u.GetProperty("id").GetString()!;
        var email = u.TryGetProperty("email", out var e) && e.ValueKind == JsonValueKind.String ? e.GetString() : null;

        var role = "staff";
        if (u.TryGetProperty("app_metadata", out var meta) &&
            meta.TryGetProperty("role", out var r) &&
            r.ValueKind == JsonValueKind.String &&
            r.GetString() is { Length: > 0 } roleValue)
        {
            role = roleValue;
        }

        var inviteAccepted = u.TryGetProperty("email_confirmed_at", out var c) && c.ValueKind == JsonValueKind.String;
        DateTime? createdAt = u.TryGetProperty("created_at", out var ca) && ca.ValueKind == JsonValueKind.String
            ? DateTime.Parse(ca.GetString()!).ToUniversalTime()
            : null;

        return new SupabaseUserSummary(id, email, role, inviteAccepted, createdAt);
    }
}
