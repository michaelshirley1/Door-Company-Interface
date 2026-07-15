using BusinessApi.Factories;
using BusinessApi.Models;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("track-type")]
public class TrackTypeController : ControllerBase
{
    private readonly ITrackTypeFactory _trackTypeFactory;
    private readonly ICurrentUserService _currentUser;

    public TrackTypeController(ITrackTypeFactory trackTypeFactory, ICurrentUserService currentUser)
    {
        _trackTypeFactory = trackTypeFactory;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TrackType>), StatusCodes.Status200OK)]
    public IActionResult GetAll(
        [FromQuery] string? supplier = null,
        [FromQuery] string? trackTypeName = null)
    {
        return Ok(_trackTypeFactory.GetAll(supplier, trackTypeName));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TrackType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var trackType = _trackTypeFactory.GetById(id);
        return trackType is null ? NotFound($"TrackType {id} not found.") : Ok(trackType);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TrackType), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult Create([FromBody] TrackType trackType)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var created = _trackTypeFactory.Create(trackType);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TrackType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] TrackType trackType)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var updated = _trackTypeFactory.Update(id, trackType);
        return updated is null ? NotFound($"TrackType {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        return _trackTypeFactory.Delete(id) ? NoContent() : NotFound($"TrackType {id} not found.");
    }
}
