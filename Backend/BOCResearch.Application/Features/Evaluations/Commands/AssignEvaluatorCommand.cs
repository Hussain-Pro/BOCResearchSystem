using System;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;

namespace BOCResearch.Application.Features.Evaluations.Commands;

public record AssignEvaluatorCommand(
    int SubmissionId,
    int EvaluatorId,
    int AssignedByUserId
) : IRequest<int>;

public class AssignEvaluatorHandler : IRequestHandler<AssignEvaluatorCommand, int>
{
    private readonly IUnitOfWork _unitOfWork;

    public AssignEvaluatorHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(AssignEvaluatorCommand request, CancellationToken cancellationToken)
    {
        var assignment = new EvaluatorAssignment
        {
            SubmissionId = request.SubmissionId,
            EvaluatorId = request.EvaluatorId,
            AssignedByUserId = request.AssignedByUserId,
            AssignedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<EvaluatorAssignment>().AddAsync(assignment);
        await _unitOfWork.SaveChangesAsync();

        return assignment.AssignmentId;
    }
}
