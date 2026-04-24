using System.Collections.Generic;
using System.Threading.Tasks;
using BOCResearch.Api.Models;
using BOCResearch.Application.Features.Sessions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BOCResearch.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SessionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSessions()
    {
        var result = await _mediator.Send(new GetSessionsQuery());
        return Ok(new ApiResponse<List<SessionDTO>>(result));
    }
}
