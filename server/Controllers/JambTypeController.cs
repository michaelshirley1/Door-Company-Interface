using BusinessApi.Factories;
using BusinessApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("jamb-type")]
public class JambTypeController : ControllerBase
{
    private readonly IJambTypeFactory _jambTypeFactory;

    public JambTypeController(IJambTypeFactory jambTypeFactory)
    {
        _jambTypeFactory = jambTypeFactory;
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
    public IActionResult Create([FromBody] JambType jambType)
    {
        var created = _jambTypeFactory.Create(jambType);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(JambType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] JambType jambType)
    {
        var updated = _jambTypeFactory.Update(id, jambType);
        return updated is null ? NotFound($"JambType {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        return _jambTypeFactory.Delete(id) ? NoContent() : NotFound($"JambType {id} not found.");
    }
}
