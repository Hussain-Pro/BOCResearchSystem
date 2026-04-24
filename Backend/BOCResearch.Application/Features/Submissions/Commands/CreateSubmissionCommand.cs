using System;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;

namespace BOCResearch.Application.Features.Submissions.Commands;

public record CreateSubmissionCommand(
    string EmployeeId,
    int SubmissionType,
    string Title,
    string? FilePath,
    string? PublicationURL = null,
    string? PublicationName = null,
    DateTime? PublicationDate = null
) : IRequest<int>;

public class CreateSubmissionHandler : IRequestHandler<CreateSubmissionCommand, int>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateSubmissionHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(CreateSubmissionCommand request, CancellationToken cancellationToken)
    {
        var submission = new Submission
        {
            EmployeeId = request.EmployeeId,
            SubmissionType = request.SubmissionType,
            Title = request.Title,
            FilePath = request.FilePath,
            PublicationURL = request.PublicationURL,
            PublicationName = request.PublicationName,
            PublicationDate = request.PublicationDate,
            Status = 1, // الجديد
            SubmittedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Submission>().AddAsync(submission);
        await _unitOfWork.SaveChangesAsync();

        return submission.SubmissionId;
    }
}
