using BusinessApi.Factories;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("xero")]
public class XeroController : ControllerBase
{
    private readonly IXeroService _xeroService;
    private readonly IQuoteFactory _quoteFactory;
    private readonly IConfiguration _config;
    private readonly ICurrentUserService _currentUser;

    public XeroController(IXeroService xeroService, IQuoteFactory quoteFactory, IConfiguration config, ICurrentUserService currentUser)
    {
        _xeroService = xeroService;
        _quoteFactory = quoteFactory;
        _config = config;
        _currentUser = currentUser;
    }

    /// <summary>Redirects the browser to Xero's OAuth2 authorization page.</summary>
    [HttpGet("connect")]
    [AllowAnonymous]
    public IActionResult Connect()
    {
        var url = _xeroService.GetAuthorizationUrl();
        return Redirect(url);
    }

    /// <summary>Xero OAuth2 callback — exchanges the code for a token then redirects back to the frontend.</summary>
    [HttpGet("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback([FromQuery] string? code, [FromQuery] string? error)
    {
        var frontendUrl = _config["Xero:FrontendUrl"] ?? "http://localhost:5173";

        if (error is not null || code is null)
            return Redirect($"{frontendUrl}?xero=error&reason={Uri.EscapeDataString(error ?? "no_code")}");

        var success = await _xeroService.ExchangeCodeAsync(code);
        return Redirect(success ? $"{frontendUrl}?xero=connected" : $"{frontendUrl}?xero=error&reason=token_exchange_failed");
    }

    /// <summary>Returns whether the app is currently connected to Xero and which organisation.</summary>
    [HttpGet("status")]
    public IActionResult Status()
    {
        return Ok(_xeroService.GetStatus());
    }

    /// <summary>Clears stored Xero tokens.</summary>
    [HttpPost("disconnect")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult Disconnect()
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        _xeroService.Disconnect();
        return NoContent();
    }

    /// <summary>Pushes any saved quote to Xero as an ACCREC invoice.</summary>
    [HttpPost("push-invoice/{quoteId:int}")]
    public async Task<IActionResult> PushInvoice(int quoteId)
    {
        var quote = _quoteFactory.GetById(quoteId);
        if (quote is null) return NotFound($"Quote {quoteId} not found.");

        var result = await _xeroService.PushInvoiceAsync(quote);
        return result.Success ? Ok(result) : BadRequest(new { result.Error });
    }
}
