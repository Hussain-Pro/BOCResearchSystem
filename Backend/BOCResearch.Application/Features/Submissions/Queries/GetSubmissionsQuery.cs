using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Features.Submissions.Queries;

public record GetSubmissionsQuery(string? EmployeeId = null) : IRequest<List<SubmissionDTO>>;

public record SubmissionDTO(
    int Id,
    string Title,
    int Status,
    int Type,
    DateTime SubmittedAt,
    string? EmployeeName = null,
    decimal? FinalScore = null
);

public class GetSubmissionsHandler : IRequestHandler<GetSubmissionsQuery, List<SubmissionDTO>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetSubmissionsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<SubmissionDTO>> Handle(GetSubmissionsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<Submission>().Entities
            .Include(s => s.Employee)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(request.EmployeeId))
        {
            query = query.Where(s => s.EmployeeId == request.EmployeeId);
        }

        return await query
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new SubmissionDTO(
                s.SubmissionId,
                s.Title,
                s.Status,
                s.SubmissionType,
                s.SubmittedAt,
                s.Employee.FullName,
                null // Will be updated when scores are implemented
            ))
            .ToListAsync(cancellationToken);
    }
}
