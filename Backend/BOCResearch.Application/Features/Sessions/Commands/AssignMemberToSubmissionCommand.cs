using System;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Application.Common.Services;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Features.Sessions.Commands;

public record AssignMemberToSubmissionCommand(
    int SessionAssignmentId,
    int MemberId
) : IRequest<bool>;

public class AssignMemberToSubmissionHandler : IRequestHandler<AssignMemberToSubmissionCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ConflictOfInterestService _conflictService;

    public AssignMemberToSubmissionHandler(
        IUnitOfWork unitOfWork,
        ConflictOfInterestService conflictService)
    {
        _unitOfWork = unitOfWork;
        _conflictService = conflictService;
    }

    public async Task<bool> Handle(AssignMemberToSubmissionCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _unitOfWork.Repository<SessionSubmissionAssignment>().Entities
            .Include(a => a.Submission)
            .FirstOrDefaultAsync(a => a.AssignmentId == request.SessionAssignmentId);

        if (assignment == null) return false;

        var member = await _unitOfWork.Repository<CommitteeMember>().Entities
            .Include(m => m.User)
            .ThenInclude(u => u.Employee)
            .FirstOrDefaultAsync(m => m.MemberId == request.MemberId);

        if (member?.User?.Employee == null) throw new Exception("عضو اللجنة غير موجود أو غير مرتبط بموظف");

        // Conflict of Interest Check
        if (await _conflictService.HasConflictAsync(member.User.EmployeeId, assignment.Submission.EmployeeId))
        {
            throw new Exception("يوجد تضارب مصالح بين العضو وصاحب البحث");
        }

        assignment.AssignedToMemberId = request.MemberId;
        await _unitOfWork.Repository<SessionSubmissionAssignment>().UpdateAsync(assignment);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}
