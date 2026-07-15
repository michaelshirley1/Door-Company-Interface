using BusinessApi.Factories;
using BusinessApi.Models;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("handle-type")]
public class HandleTypeController : ControllerBase
{
    private readonly IHandleTypeFactory _handleTypeFactory;
    private readonly ICurrentUserService _currentUser;

    public HandleTypeController(IHandleTypeFactory handleTypeFactory, ICurrentUserService currentUser)
    {
        _handleTypeFactory = handleTypeFactory;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<HandleType>), StatusCodes.Status200OK)]
    public IActionResult GetAll(
        [FromQuery] string? finish = null,
        [FromQuery] string? mechanism = null)
    {
        return Ok(_handleTypeFactory.GetAll(finish, mechanism));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(HandleType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var handleType = _handleTypeFactory.GetById(id);
        return handleType is null ? NotFound($"HandleType {id} not found.") : Ok(handleType);
    }

    [HttpPost]
    [ProducesResponseType(typeof(HandleType), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult Create([FromBody] HandleType handleType)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var created = _handleTypeFactory.Create(handleType);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(HandleType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] HandleType handleType)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var updated = _handleTypeFactory.Update(id, handleType);
        return updated is null ? NotFound($"HandleType {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        return _handleTypeFactory.Delete(id) ? NoContent() : NotFound($"HandleType {id} not found.");
    }
}
