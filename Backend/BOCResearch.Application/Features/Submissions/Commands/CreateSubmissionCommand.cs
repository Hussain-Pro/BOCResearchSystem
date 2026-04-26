using System;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

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
    private readonly Application.Common.Services.EligibilityService _eligibilityService;

    public CreateSubmissionHandler(
        IUnitOfWork unitOfWork,
        Application.Common.Services.EligibilityService eligibilityService)
    {
        _unitOfWork = unitOfWork;
        _eligibilityService = eligibilityService;
    }

    public async Task<int> Handle(CreateSubmissionCommand request, CancellationToken cancellationToken)
    {
        var employee = await _unitOfWork.Repository<Employee>().GetByIdAsync(request.EmployeeId);
        if (employee == null) throw new Exception("الموظف غير موجود");

        // 1. Check Eligibility Date
        var eligibleDate = await _eligibilityService.CalculateEligibleDateAsync(request.EmployeeId);
        if (DateTime.UtcNow < eligibleDate)
        {
            throw new Exception($"الموظف غير مؤهل للتقديم حتى تاريخ {eligibleDate:yyyy-MM-dd}");
        }

        // 2. Strict Rules: Diploma in Grade 2
        // Assumption: Qualification 5 = Technical Diploma, JobGrade 2 = Grade 2
        if (employee.Qualification == 5 && employee.JobGrade == 2 && request.SubmissionType != 2)
        {
            throw new Exception("الموظف بشهادة دبلوم في الدرجة الثانية مسموح له بتقديم تقرير فني فقط");
        }

        // 3. Check if used before (for Published Research or Course Curriculum)
        if (request.SubmissionType == 3 || request.SubmissionType == 4)
        {
            var existingSubmission = await _unitOfWork.Repository<Submission>().Entities.FirstOrDefaultAsync(s =>
                s.EmployeeId == request.EmployeeId &&
                s.Title == request.Title &&
                (s.Status == 4 || s.Status == 11), cancellationToken); // ناجح أو مستوفٍ

            if (existingSubmission != null)
            {
                throw new Exception("هذا التقديم تم استخدامه مسبقاً في ترقية ناجحة");
            }
        }

        var submission = new Submission
        {
            EmployeeId = request.EmployeeId,
            SubmissionType = request.SubmissionType,
            Title = request.Title,
            FilePath = request.FilePath,
            PublicationURL = request.PublicationURL,
            PublicationName = request.PublicationName,
            PublicationDate = request.PublicationDate,
            Status = 1, // جديد
            SubmittedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Submission>().AddAsync(submission);
        await _unitOfWork.SaveChangesAsync();

        return submission.SubmissionId;
    }
}
