using BusinessApi.Factories;
using BusinessApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerFactory _customerFactory;

    public CustomerController(ICustomerFactory customerFactory)
    {
        _customerFactory = customerFactory;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Customer>), StatusCodes.Status200OK)]
    public IActionResult GetAll()
    {
        return Ok(_customerFactory.GetAll());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Customer), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var customer = _customerFactory.GetById(id);
        return customer is null ? NotFound($"Customer {id} not found.") : Ok(customer);
    }

    [HttpPost]
    [ProducesResponseType(typeof(Customer), StatusCodes.Status201Created)]
    public IActionResult Create([FromBody] Customer customer)
    {
        var created = _customerFactory.Create(customer);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Customer), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] Customer customer)
    {
        var updated = _customerFactory.Update(id, customer);
        return updated is null ? NotFound($"Customer {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        return _customerFactory.Delete(id) ? NoContent() : NotFound($"Customer {id} not found.");
    }
}
