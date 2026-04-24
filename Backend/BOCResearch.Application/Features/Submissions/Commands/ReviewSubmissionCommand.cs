using System;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;

namespace BOCResearch.Application.Features.Submissions.Commands;

public record ReviewSubmissionCommand(
    int SubmissionId,
    int NewStatus,
    string? Notes = null,
    int? ReviewedByUserId = null,
    decimal? PlagiarismPercentage = null
) : IRequest<bool>;

public class ReviewSubmissionHandler : IRequestHandler<ReviewSubmissionCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public ReviewSubmissionHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ReviewSubmissionCommand request, CancellationToken cancellationToken)
    {
        var submission = await _unitOfWork.Repository<Submission>().GetByIdAsync(request.SubmissionId);
        if (submission == null) return false;

        submission.Status = request.NewStatus;
        
        var review = new SubmissionReview
        {
            SubmissionId = request.SubmissionId,
            ReviewedByUserId = request.ReviewedByUserId ?? 0,
            PlagiarismPercentage = request.PlagiarismPercentage,
            Notes = request.Notes,
            ReviewedAt = DateTime.UtcNow,
            ReviewType = 1, // General Review
            Result = request.NewStatus,
            IsLatest = true
        };

        await _unitOfWork.Repository<SubmissionReview>().AddAsync(review);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}
