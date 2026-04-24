using System;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Features.Evaluations.Commands;

public record SubmitCommitteeScoreCommand(
    int SubmissionId,
    int ScoredByUserId,
    int ScoreOut30,
    string? Notes
) : IRequest<int>;

public class SubmitCommitteeScoreHandler : IRequestHandler<SubmitCommitteeScoreCommand, int>
{
    private readonly IUnitOfWork _unitOfWork;

    public SubmitCommitteeScoreHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(SubmitCommitteeScoreCommand request, CancellationToken cancellationToken)
    {
        var submission = await _unitOfWork.Repository<Submission>().Entities
            .Include(s => s.Assignments)
            .FirstOrDefaultAsync(s => s.SubmissionId == request.SubmissionId);

        if (submission == null) throw new Exception("البحث غير موجود");

        // Requirement: Committee score (30) is entered after evaluator score (if research)
        // For research (type 1), we need an evaluator score.
        // For technical report (type 2), etc., it might be direct.
        
        EvaluatorAssignment? latestAssignment = null;
        if (submission.SubmissionType == 1) // بحث
        {
            latestAssignment = submission.Assignments.OrderByDescending(a => a.AssignedAt).FirstOrDefault();
            if (latestAssignment == null || latestAssignment.ScoreOut100 == null)
            {
                throw new Exception("لا يمكن إدخال درجة اللجنة قبل اكتمال درجة المقيم");
            }
        }

        decimal evaluatorPart = (latestAssignment?.ScoreOut100 ?? 0) * 0.7m;
        decimal finalScore = evaluatorPart + request.ScoreOut30;

        var committeeScore = new CommitteeScore
        {
            SubmissionId = request.SubmissionId,
            AssignmentId = latestAssignment?.AssignmentId,
            ScoredByUserId = request.ScoredByUserId,
            ScoreOut30 = request.ScoreOut30,
            FinalScore = finalScore,
            Notes = request.Notes
        };

        await _unitOfWork.Repository<CommitteeScore>().AddAsync(committeeScore);
        
        // Update submission status based on final score
        if (finalScore >= 70)
        {
            submission.Status = 4; // ناجح
        }
        else
        {
            submission.Status = 5; // غير ناجح
        }

        await _unitOfWork.Repository<Submission>().UpdateAsync(submission);
        await _unitOfWork.SaveChangesAsync();

        return committeeScore.ScoreId;
    }
}
