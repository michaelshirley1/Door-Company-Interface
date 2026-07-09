using BusinessApi.Factories;
using BusinessApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessApi.Controllers;

[ApiController]
[Authorize]
[Route("[controller]")]
public class JobController : ControllerBase
{
    private readonly IJobFactory _jobFactory;

    public JobController(IJobFactory jobFactory)
    {
        _jobFactory = jobFactory;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Job>), StatusCodes.Status200OK)]
    public IActionResult GetAll()
    {
        return Ok(_jobFactory.GetAll());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Job), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var job = _jobFactory.GetById(id);
        return job is null ? NotFound($"Job {id} not found.") : Ok(job);
    }

    [HttpPost]
    [ProducesResponseType(typeof(Job), StatusCodes.Status201Created)]
    public IActionResult Create([FromBody] Job job)
    {
        var created = _jobFactory.Create(job);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Job), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] Job job)
    {
        var updated = _jobFactory.Update(id, job);
        return updated is null ? NotFound($"Job {id} not found.") : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        return _jobFactory.Delete(id) ? NoContent() : NotFound($"Job {id} not found.");
    }
}
