namespace BOCResearch.Domain.Entities;

public class Employee
{
    public string EmployeeId { get; set; } = string.Empty; // PK
    public string FullName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public int JobGrade { get; set; } // 1, 2, or 3
    public string Department { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string WorkLocation { get; set; } = string.Empty;
    public int Qualification { get; set; } // 1-5
    public string QualificationName { get; set; } = string.Empty;
    public DateTime? LastGradeChangeDate { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    // Navigations
    public User? User { get; set; }
}
