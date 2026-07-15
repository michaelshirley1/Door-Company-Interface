using BusinessApi.Factories;
using BusinessApi.Models;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("cavity-slider")]
public class CavitySliderTypeController : ControllerBase
{
    private readonly ICavitySliderTypeFactory _cavitySliderTypeFactory;
    private readonly ICurrentUserService _currentUser;

    public CavitySliderTypeController(ICavitySliderTypeFactory cavitySliderTypeFactory, ICurrentUserService currentUser)
    {
        _cavitySliderTypeFactory = cavitySliderTypeFactory;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CavitySliderType>), StatusCodes.Status200OK)]
    public IActionResult GetAll(
        [FromQuery] string? supplier = null,
        [FromQuery] int? heightMm = null,
        [FromQuery] string? category = null,
        [FromQuery] bool? isPOA = null)
    {
        return Ok(_cavitySliderTypeFactory.GetAll(supplier, heightMm, category, isPOA));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CavitySliderType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var cavitySliderType = _cavitySliderTypeFactory.GetById(id);
        return cavitySliderType is null ? NotFound($"CavitySliderType {id} not found.") : Ok(cavitySliderType);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CavitySliderType), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult Create([FromBody] CavitySliderType cavitySliderType)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var created = _cavitySliderTypeFactory.Create(cavitySliderType);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(CavitySliderType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] CavitySliderType cavitySliderType)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var updated = _cavitySliderTypeFactory.Update(id, cavitySliderType);
        return updated is null ? NotFound($"CavitySliderType {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        return _cavitySliderTypeFactory.Delete(id) ? NoContent() : NotFound($"CavitySliderType {id} not found.");
    }
}
