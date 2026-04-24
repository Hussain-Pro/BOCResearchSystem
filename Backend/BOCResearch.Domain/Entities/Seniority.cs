using System;

namespace BOCResearch.Domain.Entities;

public class ThankYouLetter
{
    public int LetterId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public int LetterType { get; set; } // 1|2
    public int MonthsReduction { get; set; } // 1|6
    public DateTime IssueDate { get; set; }
    public string? IssuedBy { get; set; }
    public string? LetterNumber { get; set; }
    public bool UsedInCalculation { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Navigations
    public Employee Employee { get; set; } = null!;
}

public class QualificationSeniority
{
    public int SeniorityId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public int Degree { get; set; } // 1-3
    public int MonthsReduction { get; set; } // 6|12
    public DateTime AwardDate { get; set; }
    public bool UsedInCalculation { get; set; } = false;

    // Navigations
    public Employee Employee { get; set; } = null!;
}
