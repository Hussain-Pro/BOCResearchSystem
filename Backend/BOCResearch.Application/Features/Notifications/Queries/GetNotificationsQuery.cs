using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Features.Notifications.Queries;

public record GetNotificationsQuery(string UserId) : IRequest<List<NotificationDTO>>;

public record NotificationDTO(
    int Id,
    string Title,
    string Message,
    DateTime CreatedAt,
    bool IsRead,
    string Type
);

public class GetNotificationsHandler : IRequestHandler<GetNotificationsQuery, List<NotificationDTO>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetNotificationsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<NotificationDTO>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        if (!int.TryParse(request.UserId, out int userId))
        {
            return new List<NotificationDTO>();
        }

        // We fetch from NotificationQueue and join with Template for the message
        return await _unitOfWork.Repository<NotificationQueue>().Entities
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.QueueId)
            .Select(n => new NotificationDTO(
                n.QueueId,
                n.Template.EmailSubject ?? "إشعار جديد",
                n.Template.MessageBody ?? "لديك إشعار جديد في النظام",
                n.SentDate ?? DateTime.UtcNow,
                n.Status == "Sent", // Mapping status to IsRead for now or add IsRead to entity if needed
                n.Template.EventName
            ))
            .Take(20)
            .ToListAsync(cancellationToken);
    }
}
