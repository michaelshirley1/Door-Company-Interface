using BusinessApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("users")]
public class UsersController : ControllerBase
{
    private static readonly string[] ValidRoles = ["staff", "admin", "owner"];

    private readonly ISupabaseAdminService _supabaseAdmin;
    private readonly ICurrentUserService _currentUser;

    public UsersController(ISupabaseAdminService supabaseAdmin, ICurrentUserService currentUser)
    {
        _supabaseAdmin = supabaseAdmin;
        _currentUser = currentUser;
    }

    public record InviteUserRequest(string Email, string Role);
    public record SetRoleRequest(string Role);

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SupabaseUserSummary>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll()
    {
        if (!_currentUser.IsOwner(User)) return Forbid();

        try
        {
            return Ok(await _supabaseAdmin.ListUsersAsync());
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { error = ex.Message });
        }
    }

    [HttpPost("invite")]
    [ProducesResponseType(typeof(SupabaseUserSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Invite([FromBody] InviteUserRequest request)
    {
        if (!_currentUser.IsOwner(User)) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest("Email is required.");
        if (!ValidRoles.Contains(request.Role)) return BadRequest($"Role must be one of: {string.Join(", ", ValidRoles)}.");

        try
        {
            return Ok(await _supabaseAdmin.InviteUserAsync(request.Email, request.Role));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { error = ex.Message });
        }
    }

    [HttpPut("{id}/role")]
    [ProducesResponseType(typeof(SupabaseUserSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SetRole(string id, [FromBody] SetRoleRequest request)
    {
        if (!_currentUser.IsOwner(User)) return Forbid();
        if (!ValidRoles.Contains(request.Role)) return BadRequest($"Role must be one of: {string.Join(", ", ValidRoles)}.");

        try
        {
            return Ok(await _supabaseAdmin.SetRoleAsync(id, request.Role));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { error = ex.Message });
        }
    }
}
