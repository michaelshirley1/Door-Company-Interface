using BusinessApi.Factories;
using BusinessApi.Models;
using BusinessApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("product")]
public class ProductController : ControllerBase
{
    private readonly IProductFactory _productFactory;
    private readonly ICurrentUserService _currentUser;

    public ProductController(IProductFactory productFactory, ICurrentUserService currentUser)
    {
        _productFactory = productFactory;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Product>), StatusCodes.Status200OK)]
    public IActionResult GetAll() => Ok(_productFactory.GetAll());

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var product = _productFactory.GetById(id);
        return product is null ? NotFound($"Product {id} not found.") : Ok(product);
    }

    [HttpPost]
    [ProducesResponseType(typeof(Product), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult Create([FromBody] Product product)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var created = _productFactory.Create(product);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] Product product)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        var updated = _productFactory.Update(id, product);
        return updated is null ? NotFound($"Product {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        if (!_currentUser.IsAdmin(User)) return Forbid();
        return _productFactory.Delete(id) ? NoContent() : NotFound($"Product {id} not found.");
    }
}
