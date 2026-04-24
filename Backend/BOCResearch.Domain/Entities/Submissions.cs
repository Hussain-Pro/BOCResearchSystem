using System;
using System.Collections.Generic;

namespace BOCResearch.Domain.Entities;

public class Submission
{
    public int SubmissionId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public int? CommitteeId { get; set; }
    public int SubmissionType { get; set; } // 1=بحث|2=تقرير|3=دورة|4=منشور
    public string Title { get; set; } = string.Empty;
    public string? FilePath { get; set; }
    public string? PublicationURL { get; set; }
    public string? PublicationName { get; set; }
    public DateTime? PublicationDate { get; set; }
    public string? PublicationFilePath { get; set; }
    public string? CourseApprovalPath { get; set; }
    public DateTime? CourseApprovalDate { get; set; }
    public string? CourseApprovalNumber { get; set; }
    public int Status { get; set; } // 1-11
    public int? PreviousSubmissionId { get; set; }
    public bool IsReplacement { get; set; }
    public bool IsUsedBefore { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? BlockedUntil { get; set; }
    public string? BlockReason { get; set; }

    // Navigations
    public Employee Employee { get; set; } = null!;
    public Committee? Committee { get; set; }
    public Submission? PreviousSubmission { get; set; }
    public ICollection<SubmissionReview> Reviews { get; set; } = new List<SubmissionReview>();
    public ICollection<ResearchVersion> Versions { get; set; } = new List<ResearchVersion>();
    public ICollection<EvaluatorAssignment> Assignments { get; set; } = new List<EvaluatorAssignment>();
}

public class SubmissionReview
{
    public int ReviewId { get; set; }
    public int SubmissionId { get; set; }
    public int ReviewedByUserId { get; set; }
    public int ReviewType { get; set; } // 1-3
    public int Result { get; set; } // 1-4
    public string? Notes { get; set; }
    public decimal? PlagiarismPercentage { get; set; }
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    public bool IsLatest { get; set; }

    // Navigations
    public Submission Submission { get; set; } = null!;
    public User ReviewedByUser { get; set; } = null!;
}

public class ResearchVersion
{
    public int VersionId { get; set; }
    public int SubmissionId { get; set; }
    public int VersionNumber { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int UploaderId { get; set; }
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    public string? QRCodeHash { get; set; }

    // Navigations
    public Submission Submission { get; set; } = null!;
    public User Uploader { get; set; } = null!;
}
