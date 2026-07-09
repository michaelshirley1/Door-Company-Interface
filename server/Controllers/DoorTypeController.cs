using BusinessApi.Factories;
using BusinessApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("door-type")]
public class DoorTypeController : ControllerBase
{
    private readonly IDoorTypeFactory _doorTypeFactory;

    public DoorTypeController(IDoorTypeFactory doorTypeFactory)
    {
        _doorTypeFactory = doorTypeFactory;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DoorType>), StatusCodes.Status200OK)]
    public IActionResult GetAll(
        [FromQuery] string? leafType = null,
        [FromQuery] string? material = null)
    {
        return Ok(_doorTypeFactory.GetAll(leafType, material));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(DoorType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var doorType = _doorTypeFactory.GetById(id);
        return doorType is null ? NotFound($"DoorType {id} not found.") : Ok(doorType);
    }

    [HttpPost]
    [ProducesResponseType(typeof(DoorType), StatusCodes.Status201Created)]
    public IActionResult Create([FromBody] DoorType doorType)
    {
        var created = _doorTypeFactory.Create(doorType);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(DoorType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] DoorType doorType)
    {
        var updated = _doorTypeFactory.Update(id, doorType);
        return updated is null ? NotFound($"DoorType {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        return _doorTypeFactory.Delete(id) ? NoContent() : NotFound($"DoorType {id} not found.");
    }

    // ── Pricing Endpoints ──────────────────────────────────────────────────────

    [HttpGet("{id:int}/prices")]
    [ProducesResponseType(typeof(IEnumerable<DoorPricingEntry>), StatusCodes.Status200OK)]
    public IActionResult GetPrices(int id)
    {
        return Ok(_doorTypeFactory.GetPrices(id));
    }

    [HttpPost("{id:int}/prices")]
    [ProducesResponseType(typeof(DoorPricingEntry), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult AddPrice(int id, [FromBody] DoorPricingEntry entry)
    {
        var created = _doorTypeFactory.AddPrice(id, entry);
        return created is null ? NotFound($"DoorType {id} not found.") : Ok(created);
    }

    [HttpDelete("{id:int}/prices/{entryId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeletePrice(int id, int entryId)
    {
        return _doorTypeFactory.DeletePrice(id, entryId) ? NoContent() : NotFound();
    }
}
