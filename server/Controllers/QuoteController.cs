using BusinessApi.Factories;
using BusinessApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("[controller]")]
public class QuoteController : ControllerBase
{
    private readonly IQuoteFactory _quoteFactory;

    public QuoteController(IQuoteFactory quoteFactory)
    {
        _quoteFactory = quoteFactory;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Quote>), StatusCodes.Status200OK)]
    public IActionResult GetAll()
    {
        return Ok(_quoteFactory.GetAll());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Quote), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var quote = _quoteFactory.GetById(id);
        return quote is null ? NotFound($"Quote {id} not found.") : Ok(quote);
    }

    [HttpPost]
    [ProducesResponseType(typeof(Quote), StatusCodes.Status201Created)]
    public IActionResult Create([FromBody] Quote quote)
    {
        var created = _quoteFactory.Create(quote);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Quote), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] Quote quote)
    {
        var updated = _quoteFactory.Update(id, quote);
        return updated is null ? NotFound($"Quote {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        return _quoteFactory.Delete(id) ? NoContent() : NotFound($"Quote {id} not found.");
    }
}
