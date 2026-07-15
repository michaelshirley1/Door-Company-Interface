using BusinessApi.Factories;
using BusinessApi.Models;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceFactory _invoiceFactory;
    private readonly IOrderFactory _orderFactory;
    private readonly ICurrentUserService _currentUser;

    public InvoiceController(IInvoiceFactory invoiceFactory, IOrderFactory orderFactory, ICurrentUserService currentUser)
    {
        _invoiceFactory = invoiceFactory;
        _orderFactory = orderFactory;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Invoice>), StatusCodes.Status200OK)]
    public IActionResult GetAll()
    {
        return Ok(_invoiceFactory.GetAll());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Invoice), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var invoice = _invoiceFactory.GetById(id);
        return invoice is null ? NotFound($"Invoice {id} not found.") : Ok(invoice);
    }

    [HttpPost]
    [ProducesResponseType(typeof(Invoice), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult Create([FromBody] Invoice invoice)
    {
        if (invoice.QuoteId.HasValue && !_orderFactory.AreAllItemsDispatched(invoice.QuoteId.Value))
            return BadRequest("All items must be marked as dispatched before an invoice can be created.");

        var created = _invoiceFactory.Create(invoice);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Invoice), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] Invoice invoice)
    {
        var updated = _invoiceFactory.Update(id, invoice);
        return updated is null ? NotFound($"Invoice {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        return _invoiceFactory.Delete(id) ? NoContent() : NotFound($"Invoice {id} not found.");
    }
}
