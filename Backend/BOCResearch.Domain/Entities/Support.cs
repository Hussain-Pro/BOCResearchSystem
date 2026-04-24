using System;
using System.Collections.Generic;

namespace BOCResearch.Domain.Entities;

public class Batch
{
    public int BatchId { get; set; }
    public int CommitteeId { get; set; }
    public int Year { get; set; }
    public int BatchNumber { get; set; }
    public int Status { get; set; } // 1-6
    public int CreatedByUserId { get; set; }
    public string? OutgoingNumber { get; set; }
    public DateTime? OutgoingDate { get; set; }
    public DateTime? SentToMinistryAt { get; set; }
    public DateTime? FirstResponseAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigations
    public Committee Committee { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
    public ICollection<BatchSubmission> Submissions { get; set; } = new List<BatchSubmission>();
}

public class BatchSubmission
{
    public int BatchSubId { get; set; }
    public int BatchId { get; set; }
    public int SubmissionId { get; set; }
    public int? MinistryResult { get; set; } // 1-5
    public int? MinistryScore { get; set; }
    public string? MinistryNotes { get; set; }
    public string? MinistryLetterPath { get; set; }
    public DateTime? MinistryResponseAt { get; set; }
    public int? FinalStatus { get; set; }

    // Navigations
    public Batch Batch { get; set; } = null!;
    public Submission Submission { get; set; } = null!;
}

public class Message
{
    public int MessageId { get; set; }
    public int SenderUserId { get; set; }
    public int RecipientUserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public int? ParentMessageId { get; set; }

    // Navigations
    public User Sender { get; set; } = null!;
    public User Recipient { get; set; } = null!;
    public Message? ParentMessage { get; set; }
}

public class SystemAuditLog
{
    public int LogId { get; set; }
    public int? UserId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public string? RecordId { get; set; }
    public string? OldData { get; set; } // JSON
    public string? NewData { get; set; } // JSON
    public DateTime ActionDate { get; set; } = DateTime.UtcNow;
    public string? IPAddress { get; set; }
}

public class SystemSetting
{
    public string SettingKey { get; set; } = string.Empty;
    public string? SettingValue { get; set; }
    public string? Description { get; set; }
}

public class FTPDocument
{
    public int DocId { get; set; }
    public string? DocType { get; set; }
    public int? ReferenceId { get; set; }
    public string? ReferenceTable { get; set; }
    public string FTPPath { get; set; } = string.Empty;
    public string? OriginalFileName { get; set; }
    public long FileSizeBytes { get; set; }
    public string? MimeType { get; set; }
    public int UploadedByUserId { get; set; }
    public bool IsArchived { get; set; }
    public string? CheckSum { get; set; }

    // Navigations
    public User UploadedByUser { get; set; } = null!;
}

public class NotificationTemplate
{
    public int TemplateId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string? EmailSubject { get; set; }
    public string? MessageBody { get; set; }
    public string? PushBody { get; set; }
}

public class NotificationQueue
{
    public int QueueId { get; set; }
    public int UserId { get; set; }
    public int TemplateId { get; set; }
    public string Status { get; set; } = "Pending";
    public int RetryCount { get; set; }
    public DateTime? SentDate { get; set; }

    // Navigations
    public User User { get; set; } = null!;
    public NotificationTemplate Template { get; set; } = null!;
}

public class EmployeeRelationship
{
    public int RelId { get; set; }
    public string EmpNo1 { get; set; } = string.Empty;
    public string EmpNo2 { get; set; } = string.Empty;
    public string? RelationType { get; set; }
}
