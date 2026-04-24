using System.Threading.Tasks;
using BOCResearch.Api.Models;
using BOCResearch.Application.Features.Submissions.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BOCResearch.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubmissionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SubmissionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateSubmissionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new ApiResponse<int>(result, "Submission created successfully"));
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMySubmissions()
    {
        var employeeId = User.FindFirst("EmployeeId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var result = await _mediator.Send(new BOCResearch.Application.Features.Submissions.Queries.GetSubmissionsQuery(employeeId));
        return Ok(new ApiResponse<List<BOCResearch.Application.Features.Submissions.Queries.SubmissionDTO>>(result));
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSubmissions()
    {
        var result = await _mediator.Send(new BOCResearch.Application.Features.Submissions.Queries.GetSubmissionsQuery());
        return Ok(new ApiResponse<List<BOCResearch.Application.Features.Submissions.Queries.SubmissionDTO>>(result));
    }

    [HttpPost("review")]
    public async Task<IActionResult> Review(ReviewSubmissionCommand command)
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        int.TryParse(userIdStr, out int userId);
        var result = await _mediator.Send(command with { ReviewedByUserId = userId });
        return Ok(new ApiResponse<bool>(result, "Review submitted successfully"));
    }
}
