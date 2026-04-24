using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Features.Evaluations.Commands;

public record CriteriaScoreInput(int CriteriaId, int Score, string? Notes);

public record SubmitEvaluatorScoresCommand(
    int AssignmentId,
    List<CriteriaScoreInput> Scores,
    string? EvaluatorNotes
) : IRequest<bool>;

public class SubmitEvaluatorScoresHandler : IRequestHandler<SubmitEvaluatorScoresCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public SubmitEvaluatorScoresHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(SubmitEvaluatorScoresCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _unitOfWork.Repository<EvaluatorAssignment>().Entities
            .Include(a => a.CriteriaScores)
            .FirstOrDefaultAsync(a => a.AssignmentId == request.AssignmentId);

        if (assignment == null) return false;

        var criteria = await _unitOfWork.Repository<EvaluationCriteria>().GetAllAsync();
        
        int totalScore = 0;
        foreach (var scoreInput in request.Scores)
        {
            var criterion = criteria.FirstOrDefault(c => c.CriteriaId == scoreInput.CriteriaId);
            if (criterion == null) throw new Exception($"Criterion {scoreInput.CriteriaId} not found");
            if (scoreInput.Score > criterion.MaxScore) throw new Exception($"Score for {criterion.CriteriaName} exceeds max {criterion.MaxScore}");

            var existingScore = assignment.CriteriaScores.FirstOrDefault(s => s.CriteriaId == scoreInput.CriteriaId);
            if (existingScore != null)
            {
                existingScore.Score = scoreInput.Score;
                existingScore.Notes = scoreInput.Notes;
                existingScore.ScoredAt = DateTime.UtcNow;
            }
            else
            {
                await _unitOfWork.Repository<EvaluatorCriteriaScore>().AddAsync(new EvaluatorCriteriaScore
                {
                    AssignmentId = assignment.AssignmentId,
                    CriteriaId = scoreInput.CriteriaId,
                    Score = scoreInput.Score,
                    Notes = scoreInput.Notes,
                    ScoredAt = DateTime.UtcNow
                });
            }
            totalScore += scoreInput.Score;
        }

        assignment.ScoreOut100 = totalScore;
        assignment.ScoredAt = DateTime.UtcNow;
        assignment.EvaluatorNotes = request.EvaluatorNotes;

        await _unitOfWork.Repository<EvaluatorAssignment>().UpdateAsync(assignment);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}
