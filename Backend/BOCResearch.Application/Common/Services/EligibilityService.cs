using System;
using System.Linq;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;

namespace BOCResearch.Application.Common.Services;

public class EligibilityService
{
    private readonly IUnitOfWork _unitOfWork;

    public EligibilityService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DateTime> CalculateEligibleDateAsync(string employeeId)
    {
        var employee = await _unitOfWork.Repository<Employee>().GetByIdAsync(employeeId);
        if (employee == null) throw new Exception("Employee not found");

        // Base date: Last change + 5 years
        var baseDate = (employee.LastGradeChangeDate ?? DateTime.UtcNow).AddYears(5);

        // Reduction from Thank You Letters
        var thankYouLetters = await _unitOfWork.Repository<ThankYouLetter>()
            .FindAsync(l => l.EmployeeId == employeeId && l.IsActive && !l.UsedInCalculation);
        
        int monthsReduction = thankYouLetters.Sum(l => l.MonthsReduction);

        // Reduction from Qualification Seniority
        var seniority = await _unitOfWork.Repository<QualificationSeniority>()
            .FindAsync(s => s.EmployeeId == employeeId && !s.UsedInCalculation);
        
        monthsReduction += seniority.Sum(s => s.MonthsReduction);

        return baseDate.AddMonths(-monthsReduction);
    }
}
