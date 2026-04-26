using System.Threading.Tasks;
using BOCResearch.Api.Models;
using BOCResearch.Application.Features.Employees.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BOCResearch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmployeesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Lookup employee by staff id for self-registration (no account yet).</summary>
    [AllowAnonymous]
    [HttpGet("lookup/{employeeId}")]
    public async Task<IActionResult> Lookup(string employeeId)
    {
        if (string.IsNullOrWhiteSpace(employeeId))
            return BadRequest(new ApiResponse<string>("الرقم الوظيفي مطلوب"));

        var result = await _mediator.Send(new GetEmployeeLookupQuery(employeeId.Trim()));

        if (!result.Found)
            return NotFound(new ApiResponse<string>("الرقم الوظيفي غير موجود في سجلات الموارد البشرية"));

        if (result.HasAccount)
            return Conflict(new ApiResponse<string>("يوجد حساب مسجّل مرتبط بهذا الرقم الوظيفي"));

        return Ok(new ApiResponse<EmployeeLookupDto>(result.Employee!, "تم التحقق من بيانات الموظف"));
    }
}
