using System;
using System.Collections.Generic;

namespace BOCResearch.Domain.Entities;

public class EvaluationCriteria
{
    public int CriteriaId { get; set; }
    public string CriteriaName { get; set; } = string.Empty;
    public int MaxScore { get; set; }
    public int DisplayOrder { get; set; }
}

public class Evaluator
{
    public int EvaluatorId { get; set; }
    public int UserId { get; set; }
    public string? Institution { get; set; }
    public string? Qualification { get; set; }
    public string? Specialization { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigations
    public User User { get; set; } = null!;
}

public class EvaluatorAssignment
{
    public int AssignmentId { get; set; }
    public int SubmissionId { get; set; }
    public int EvaluatorId { get; set; }
    public int AssignedByUserId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EmailSentAt { get; set; }
    public decimal? ScoreOut100 { get; set; }
    public DateTime? ScoredAt { get; set; }
    public string? EvaluatorNotes { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigations
    public Submission Submission { get; set; } = null!;
    public Evaluator Evaluator { get; set; } = null!;
    public User AssignedByUser { get; set; } = null!;
    public ICollection<EvaluatorCriteriaScore> CriteriaScores { get; set; } = new List<EvaluatorCriteriaScore>();
}

public class EvaluatorCriteriaScore
{
    public int CriteriaScoreId { get; set; }
    public int AssignmentId { get; set; }
    public int CriteriaId { get; set; }
    public int Score { get; set; }
    public string? Notes { get; set; }
    public DateTime ScoredAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public EvaluatorAssignment Assignment { get; set; } = null!;
    public EvaluationCriteria Criteria { get; set; } = null!;
}

public class CommitteeScore
{
    public int ScoreId { get; set; }
    public int SubmissionId { get; set; }
    public int? AssignmentId { get; set; }
    public int ScoredByUserId { get; set; }
    public int ScoreOut30 { get; set; }
    public decimal FinalScore { get; set; }
    public string? Notes { get; set; }

    // Navigations
    public Submission Submission { get; set; } = null!;
    public EvaluatorAssignment? Assignment { get; set; }
    public User ScoredByUser { get; set; } = null!;
}

public class EvaluatorRequest
{
    public int RequestId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? EmployeeId_Ref { get; set; }
    public string? Qualification { get; set; }
    public string? Institution { get; set; }
    public string? Department { get; set; }
    public string? WorkLocation { get; set; }
    public int? JobGrade { get; set; }
    public string Email { get; set; } = string.Empty;
    public int Status { get; set; } // 1=معلق|2=موافق|3=مرفوض
}
