using BusinessApi.Factories;
using BusinessApi.Models;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("jamb-type")]
public class JambTypeController : ControllerBase
{
    private readonly IJambTypeFactory _jambTypeFactory;
    private readonly ICurrentUserService _currentUser;

    public JambTypeController(IJambTypeFactory jambTypeFactory, ICurrentUserService currentUser)
    {
        _jambTypeFactory = jambTypeFactory;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<JambType>), StatusCodes.Status200OK)]
    public IActionResult GetAll() => Ok(_jambTypeFactory.GetAll());

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(JambType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var jambType = _jambTypeFactory.GetById(id);
        return jambType is null ? NotFound($"JambType {id} not found.") : Ok(jambType);
    }

    [HttpPost]
    [ProducesResponseType(typeof(JambType), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult Create([FromBody] JambType jambType)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var created = _jambTypeFactory.Create(jambType);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(JambType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] JambType jambType)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var updated = _jambTypeFactory.Update(id, jambType);
        return updated is null ? NotFound($"JambType {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        return _jambTypeFactory.Delete(id) ? NoContent() : NotFound($"JambType {id} not found.");
    }
}
