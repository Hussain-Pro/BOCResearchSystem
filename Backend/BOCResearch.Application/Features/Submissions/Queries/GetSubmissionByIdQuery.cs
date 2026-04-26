using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Features.Submissions.Queries;

public record GetSubmissionByIdQuery(int SubmissionId, string? RequestingEmployeeId, IReadOnlyList<string> Roles)
    : IRequest<SubmissionDetailDto?>;

public record SubmissionDetailDto(
    int Id,
    string Title,
    int Status,
    int Type,
    DateTime SubmittedAt,
    string? EmployeeName,
    decimal? FinalScore,
    IReadOnlyList<SubmissionTimelineEntryDto> Timeline
);

public record SubmissionTimelineEntryDto(string Label, DateTime At, string? Detail);

public class GetSubmissionByIdHandler : IRequestHandler<GetSubmissionByIdQuery, SubmissionDetailDto?>
{
    private static readonly HashSet<string> PrivilegedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "SystemSupervisor", "CommitteeHead", "CommitteeDeputy", "Secretary",
        "OriginalMember", "AlternateMember", "Evaluator", "Assistant", "DataEntry"
    };

    private readonly IUnitOfWork _unitOfWork;

    public GetSubmissionByIdHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<SubmissionDetailDto?> Handle(GetSubmissionByIdQuery request, CancellationToken cancellationToken)
    {
        var submission = await _unitOfWork.Repository<Submission>().Entities
            .AsNoTracking()
            .Include(s => s.Employee)
            .Include(s => s.Reviews)
            .ThenInclude(r => r.ReviewedByUser)
            .FirstOrDefaultAsync(s => s.SubmissionId == request.SubmissionId, cancellationToken);

        if (submission == null) return null;

        var canViewAll = request.Roles.Any(r => PrivilegedRoles.Contains(r));
        if (!canViewAll)
        {
            if (string.IsNullOrEmpty(request.RequestingEmployeeId) ||
                !string.Equals(submission.EmployeeId, request.RequestingEmployeeId, StringComparison.Ordinal))
                return null;
        }

        var timeline = new List<SubmissionTimelineEntryDto>
        {
            new("تم تقديم البحث", submission.SubmittedAt, null)
        };

        foreach (var review in submission.Reviews.OrderBy(r => r.ReviewedAt))
        {
            var reviewer = review.ReviewedByUser?.Username ?? "مراجع";
            timeline.Add(new($"مراجعة ({reviewer})", review.ReviewedAt,
                string.IsNullOrEmpty(review.Notes) ? null : review.Notes));
        }

        timeline.Add(new(StatusLabel(submission.Status), DateTime.UtcNow, null));

        var finalScore = await _unitOfWork.Repository<CommitteeScore>().Entities
            .AsNoTracking()
            .Where(c => c.SubmissionId == submission.SubmissionId)
            .OrderByDescending(c => c.ScoreId)
            .Select(c => (decimal?)c.FinalScore)
            .FirstOrDefaultAsync(cancellationToken);

        return new SubmissionDetailDto(
            submission.SubmissionId,
            submission.Title,
            submission.Status,
            submission.SubmissionType,
            submission.SubmittedAt,
            submission.Employee?.FullName,
            finalScore,
            timeline
        );
    }

    private static string StatusLabel(int status) => status switch
    {
        1 => "الحالة الحالية: جديد",
        2 => "الحالة الحالية: مطابق",
        3 => "الحالة الحالية: غير مطابق",
        4 => "الحالة الحالية: ناجح",
        5 => "الحالة الحالية: غير ناجح",
        6 => "الحالة الحالية: مرفوض",
        7 => "الحالة الحالية: تم تعديله",
        8 => "الحالة الحالية: جديد بعد الطلب",
        9 => "الحالة الحالية: مغلق",
        10 => "الحالة الحالية: تم استبداله",
        11 => "الحالة الحالية: مستوفٍ",
        _ => $"الحالة الحالية: {status}"
    };
}
