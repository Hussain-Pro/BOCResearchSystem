using System;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;

namespace BOCResearch.Application.Features.Batches.Commands;

public record UpdateBatchStatusCommand(
    int BatchId,
    int Status,
    string? OutgoingNumber = null,
    DateTime? OutgoingDate = null
) : IRequest<bool>;

public class UpdateBatchStatusHandler : IRequestHandler<UpdateBatchStatusCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateBatchStatusHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateBatchStatusCommand request, CancellationToken cancellationToken)
    {
        var batch = await _unitOfWork.Repository<Batch>().GetByIdAsync(request.BatchId);
        if (batch == null) return false;

        batch.Status = request.Status;
        
        if (request.OutgoingNumber != null) batch.OutgoingNumber = request.OutgoingNumber;
        if (request.OutgoingDate != null) batch.OutgoingDate = request.OutgoingDate;

        if (request.Status == 3) // أرسل للوزارة
        {
            batch.SentToMinistryAt = DateTime.UtcNow;
        }
        else if (request.Status == 4) // استلمت من الوزارة
        {
            batch.FirstResponseAt = DateTime.UtcNow;
        }
        else if (request.Status == 5) // اكتملت
        {
            batch.CompletedAt = DateTime.UtcNow;
        }

        await _unitOfWork.Repository<Batch>().UpdateAsync(batch);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}
