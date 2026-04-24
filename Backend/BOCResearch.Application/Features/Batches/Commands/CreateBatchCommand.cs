using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;

namespace BOCResearch.Application.Features.Batches.Commands;

public record CreateBatchCommand(
    int CommitteeId,
    int Year,
    int BatchNumber,
    int CreatedByUserId,
    List<int> SubmissionIds
) : IRequest<int>;

public class CreateBatchHandler : IRequestHandler<CreateBatchCommand, int>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateBatchHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(CreateBatchCommand request, CancellationToken cancellationToken)
    {
        var batch = new Batch
        {
            CommitteeId = request.CommitteeId,
            Year = request.Year,
            BatchNumber = request.BatchNumber,
            Status = 1, // جديد
            CreatedByUserId = request.CreatedByUserId,
            OutgoingDate = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Batch>().AddAsync(batch);
        await _unitOfWork.SaveChangesAsync();

        foreach (var subId in request.SubmissionIds)
        {
            var batchSub = new BatchSubmission
            {
                BatchId = batch.BatchId,
                SubmissionId = subId
            };
            await _unitOfWork.Repository<BatchSubmission>().AddAsync(batchSub);
        }

        await _unitOfWork.SaveChangesAsync();

        return batch.BatchId;
    }
}
