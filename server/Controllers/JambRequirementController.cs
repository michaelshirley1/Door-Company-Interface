using BusinessApi.Factories;
using BusinessApi.Models;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("jamb-requirement")]
public class JambRequirementController : ControllerBase
{
    private readonly IJambRequirementFactory _jambRequirementFactory;
    private readonly ICurrentUserService _currentUser;

    public JambRequirementController(IJambRequirementFactory jambRequirementFactory, ICurrentUserService currentUser)
    {
        _jambRequirementFactory = jambRequirementFactory;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<JambRequirement>), StatusCodes.Status200OK)]
    public IActionResult GetAll() => Ok(_jambRequirementFactory.GetAll());

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(JambRequirement), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var requirement = _jambRequirementFactory.GetById(id);
        return requirement is null ? NotFound($"JambRequirement {id} not found.") : Ok(requirement);
    }

    [HttpPost]
    [ProducesResponseType(typeof(JambRequirement), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult Create([FromBody] JambRequirement requirement)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var created = _jambRequirementFactory.Create(requirement);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(JambRequirement), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] JambRequirement requirement)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var updated = _jambRequirementFactory.Update(id, requirement);
        return updated is null ? NotFound($"JambRequirement {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        return _jambRequirementFactory.Delete(id) ? NoContent() : NotFound($"JambRequirement {id} not found.");
    }
}
