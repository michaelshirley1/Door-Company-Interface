using System.Security.Claims;
using BusinessApi.Services;
using Xunit;

namespace BusinessApi.Tests
{
    public class CurrentUserServiceTests
    {
        private static ClaimsPrincipal PrincipalWithRole(string? role)
        {
            var claims = role is null ? [] : new[] { new Claim(ClaimTypes.Role, role) };
            return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        }

        [Fact]
        public void IsAdmin_IsPermissive_WhenSupabaseNotConfigured()
        {
            var service = new CurrentUserService(authEnabled: false);
            var anonymous = PrincipalWithRole(null);

            Assert.True(service.IsAdmin(anonymous));
        }

        [Fact]
        public void IsAdmin_ReturnsTrue_ForAdminRoleClaim_WhenAuthEnabled()
        {
            var service = new CurrentUserService(authEnabled: true);
            var admin = PrincipalWithRole("admin");

            Assert.True(service.IsAdmin(admin));
        }

        [Fact]
        public void IsAdmin_ReturnsFalse_ForNoRoleClaim_WhenAuthEnabled()
        {
            var service = new CurrentUserService(authEnabled: true);
            var staff = PrincipalWithRole(null);

            Assert.False(service.IsAdmin(staff));
        }

        [Fact]
        public void IsAdmin_ReturnsFalse_ForNonAdminRole_WhenAuthEnabled()
        {
            var service = new CurrentUserService(authEnabled: true);
            var staff = PrincipalWithRole("staff");

            Assert.False(service.IsAdmin(staff));
        }

        [Fact]
        public void IsAdmin_ReturnsTrue_ForOwnerRoleClaim_WhenAuthEnabled()
        {
            var service = new CurrentUserService(authEnabled: true);
            var owner = PrincipalWithRole("owner");

            Assert.True(service.IsAdmin(owner));
        }

        [Fact]
        public void IsOwner_IsPermissive_WhenSupabaseNotConfigured()
        {
            var service = new CurrentUserService(authEnabled: false);
            var anonymous = PrincipalWithRole(null);

            Assert.True(service.IsOwner(anonymous));
        }

        [Fact]
        public void IsOwner_ReturnsTrue_OnlyForOwnerRoleClaim_WhenAuthEnabled()
        {
            var service = new CurrentUserService(authEnabled: true);

            Assert.True(service.IsOwner(PrincipalWithRole("owner")));
            Assert.False(service.IsOwner(PrincipalWithRole("admin")));
            Assert.False(service.IsOwner(PrincipalWithRole(null)));
        }
    }
}
