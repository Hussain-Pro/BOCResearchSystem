using System.Linq;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Common.Services;

public class ConflictOfInterestService
{
    private readonly IUnitOfWork _unitOfWork;

    public ConflictOfInterestService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> HasConflictAsync(string employeeId1, string employeeId2)
    {
        if (string.IsNullOrEmpty(employeeId1) || string.IsNullOrEmpty(employeeId2)) return false;
        if (employeeId1 == employeeId2) return true;

        return await _unitOfWork.Repository<EmployeeRelationship>().Entities
            .AnyAsync(r => 
                (r.EmpNo1 == employeeId1 && r.EmpNo2 == employeeId2) ||
                (r.EmpNo1 == employeeId2 && r.EmpNo2 == employeeId1));
    }

    public async Task<bool> UserHasConflictWithSubmissionAsync(int userId, int submissionId)
    {
        var user = await _unitOfWork.Repository<User>().Entities
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.UserId == userId);
        
        if (user?.Employee == null) return false;

        var submission = await _unitOfWork.Repository<Submission>().GetByIdAsync(submissionId);
        if (submission == null) return false;

        return await HasConflictAsync(user.EmployeeId, submission.EmployeeId);
    }
}
