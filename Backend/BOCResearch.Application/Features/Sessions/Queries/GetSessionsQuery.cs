using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Features.Sessions.Queries;

public record GetSessionsQuery() : IRequest<List<SessionDTO>>;

public record SessionDTO(
    int Id,
    string Number,
    string Location,
    DateTime Date,
    TimeSpan Time,
    int Status,
    int SubmissionsCount
);

public class GetSessionsHandler : IRequestHandler<GetSessionsQuery, List<SessionDTO>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetSessionsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<SessionDTO>> Handle(GetSessionsQuery request, CancellationToken cancellationToken)
    {
        return await _unitOfWork.Repository<Session>().Entities
            .AsNoTracking()
            .OrderByDescending(s => s.SessionDate)
            .Select(s => new SessionDTO(
                s.SessionId,
                s.SessionNumber ?? "N/A",
                s.Location ?? "N/A",
                s.SessionDate,
                s.SessionTime,
                s.Status,
                s.Assignments.Count
            ))
            .ToListAsync(cancellationToken);
    }
}
