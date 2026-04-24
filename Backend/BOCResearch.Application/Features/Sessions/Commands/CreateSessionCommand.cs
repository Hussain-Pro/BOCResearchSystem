using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;

namespace BOCResearch.Application.Features.Sessions.Commands;

public record CreateSessionCommand(
    int CommitteeId,
    string SessionNumber,
    string Location,
    DateTime SessionDate,
    TimeSpan SessionTime,
    int CreatedByUserId,
    List<int> SubmissionIds
) : IRequest<int>;

public class CreateSessionHandler : IRequestHandler<CreateSessionCommand, int>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateSessionHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(CreateSessionCommand request, CancellationToken cancellationToken)
    {
        var session = new Session
        {
            CommitteeId = request.CommitteeId,
            SessionNumber = request.SessionNumber,
            Location = request.Location,
            SessionDate = request.SessionDate,
            SessionTime = request.SessionTime,
            Status = 1, // جديد
            CreatedByUserId = request.CreatedByUserId
        };

        await _unitOfWork.Repository<Session>().AddAsync(session);
        await _unitOfWork.SaveChangesAsync();

        foreach (var subId in request.SubmissionIds)
        {
            var assignment = new SessionSubmissionAssignment
            {
                SessionId = session.SessionId,
                SubmissionId = subId,
                SessionResult = 1 // معلق
            };
            await _unitOfWork.Repository<SessionSubmissionAssignment>().AddAsync(assignment);
        }

        await _unitOfWork.SaveChangesAsync();

        return session.SessionId;
    }
}
