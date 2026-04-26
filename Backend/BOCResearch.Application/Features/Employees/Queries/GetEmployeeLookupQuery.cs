using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Features.Employees.Queries;

public record GetEmployeeLookupQuery(string EmployeeId) : IRequest<EmployeeLookupResponse>;

/// <param name="Found">Employee row exists for this id.</param>
/// <param name="HasAccount">A user is already linked to this employee.</param>
/// <param name="Employee">Populated when Found and not HasAccount.</param>
public record EmployeeLookupResponse(bool Found, bool HasAccount, EmployeeLookupDto? Employee);

public record EmployeeLookupDto(
    string EmployeeId,
    string FullName,
    string Department,
    string Section,
    string JobTitle,
    int JobGrade,
    int Qualification,
    string QualificationName
);

public class GetEmployeeLookupHandler : IRequestHandler<GetEmployeeLookupQuery, EmployeeLookupResponse>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetEmployeeLookupHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<EmployeeLookupResponse> Handle(GetEmployeeLookupQuery request, CancellationToken cancellationToken)
    {
        var emp = await _unitOfWork.Repository<Employee>().Entities
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.EmployeeId == request.EmployeeId, cancellationToken);

        if (emp == null) return new EmployeeLookupResponse(false, false, null);

        var accountExists = await _unitOfWork.Repository<User>().Entities
            .AnyAsync(u => u.EmployeeId == request.EmployeeId, cancellationToken);

        if (accountExists)
            return new EmployeeLookupResponse(true, true, null);

        return new EmployeeLookupResponse(true, false, new EmployeeLookupDto(
            emp.EmployeeId,
            emp.FullName,
            emp.Department,
            emp.Section,
            emp.JobTitle,
            emp.JobGrade,
            emp.Qualification,
            emp.QualificationName
        ));
    }
}
