using BusinessApi.Factories;
using BusinessApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("[controller]")]
public class OrderController : ControllerBase
{
    private readonly IOrderFactory _orderFactory;

    public OrderController(IOrderFactory orderFactory)
    {
        _orderFactory = orderFactory;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PurchaseOrder>), StatusCodes.Status200OK)]
    public IActionResult GetAll()
    {
        return Ok(_orderFactory.GetAll());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PurchaseOrder), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var order = _orderFactory.GetById(id);
        return order is null ? NotFound($"Order {id} not found.") : Ok(order);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PurchaseOrder), StatusCodes.Status201Created)]
    public IActionResult Create([FromBody] PurchaseOrder order)
    {
        var created = _orderFactory.Create(order);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PurchaseOrder), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] PurchaseOrder order)
    {
        var updated = _orderFactory.Update(id, order);
        return updated is null ? NotFound($"Order {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        return _orderFactory.Delete(id) ? NoContent() : NotFound($"Order {id} not found.");
    }
}
