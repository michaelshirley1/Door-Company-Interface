using System.Security.Claims;

namespace BusinessApi.Services
{
    public interface ICurrentUserService
    {
        bool IsAdmin(ClaimsPrincipal user);
        bool IsOwner(ClaimsPrincipal user);
    }

    /// <summary>
    /// Role source is the Supabase JWT's app_metadata.role claim (mapped to ClaimTypes.Role in
    /// Program.cs's OnTokenValidated handler), managed via the Settings > Users page (see
    /// SupabaseAdminService) rather than an in-app role table. Three roles: "staff" (default —
    /// no claim at all), "admin", "owner". Owner is a superset of admin — it can do everything
    /// admin can, plus invite/manage users.
    /// </summary>
    public class CurrentUserService : ICurrentUserService
    {
        private readonly bool _authEnabled;

        public CurrentUserService(bool authEnabled)
        {
            _authEnabled = authEnabled;
        }

        private static bool HasRole(ClaimsPrincipal user, string role) =>
            user.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == role);

        public bool IsOwner(ClaimsPrincipal user) =>
            !_authEnabled || HasRole(user, "owner");

        public bool IsAdmin(ClaimsPrincipal user) =>
            !_authEnabled || IsOwner(user) || HasRole(user, "admin");
    }
}
