using BusinessApi.Factories;
using BusinessApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("hinge-type")]
public class HingeTypeController : ControllerBase
{
    private readonly IHingeTypeFactory _hingeTypeFactory;

    public HingeTypeController(IHingeTypeFactory hingeTypeFactory)
    {
        _hingeTypeFactory = hingeTypeFactory;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<HingeType>), StatusCodes.Status200OK)]
    public IActionResult GetAll()
    {
        return Ok(_hingeTypeFactory.GetAll());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(HingeType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var hingeType = _hingeTypeFactory.GetById(id);
        return hingeType is null ? NotFound($"HingeType {id} not found.") : Ok(hingeType);
    }

    [HttpPost]
    [ProducesResponseType(typeof(HingeType), StatusCodes.Status201Created)]
    public IActionResult Create([FromBody] HingeType hingeType)
    {
        var created = _hingeTypeFactory.Create(hingeType);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(HingeType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] HingeType hingeType)
    {
        var updated = _hingeTypeFactory.Update(id, hingeType);
        return updated is null ? NotFound($"HingeType {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        return _hingeTypeFactory.Delete(id) ? NoContent() : NotFound($"HingeType {id} not found.");
    }
}
