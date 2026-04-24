using System;
using System.Collections.Generic;

namespace BOCResearch.Domain.Entities;

public class Committee
{
    public int CommitteeId { get; set; }
    public string CommitteeName { get; set; } = string.Empty;
    public string? AdminOrderNumber { get; set; }
    public DateTime? AdminOrderDate { get; set; }
    public string? IssuedBy { get; set; }
    public int CommitteeType { get; set; } // 1|2
    public int Year { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigations
    public ICollection<CommitteeMember> Members { get; set; } = new List<CommitteeMember>();
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
}

public class CommitteeMember
{
    public int MemberId { get; set; }
    public int CommitteeId { get; set; }
    public int UserId { get; set; }
    public int RoleInCommittee { get; set; } // 1-8
    public int Priority { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigations
    public Committee Committee { get; set; } = null!;
    public User User { get; set; } = null!;
}

public class Session
{
    public int SessionId { get; set; }
    public int CommitteeId { get; set; }
    public string? SessionNumber { get; set; }
    public string? Location { get; set; }
    public DateTime SessionDate { get; set; }
    public TimeSpan SessionTime { get; set; }
    public int Status { get; set; } // 1-3
    public int CreatedByUserId { get; set; }

    // Navigations
    public Committee Committee { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
    public ICollection<SessionSubmissionAssignment> Assignments { get; set; } = new List<SessionSubmissionAssignment>();
    public ICollection<SessionAttendance> Attendance { get; set; } = new List<SessionAttendance>();
}

public class SessionAttendance
{
    public int AttendanceID { get; set; }
    public int SessionID { get; set; }
    public int MemberID { get; set; }
    public bool IsPresent { get; set; }
    public string? SignaturePath { get; set; }

    // Navigations
    public Session Session { get; set; } = null!;
    public CommitteeMember Member { get; set; } = null!;
}

public class SessionSubmissionAssignment
{
    public int AssignmentId { get; set; }
    public int SessionId { get; set; }
    public int SubmissionId { get; set; }
    public int? AssignedToMemberId { get; set; }
    public int SessionResult { get; set; } // 1-5
    public string? SessionNotes { get; set; }
    public DateTime? ReviewedAt { get; set; }

    // Navigations
    public Session Session { get; set; } = null!;
    public Submission Submission { get; set; } = null!;
    public CommitteeMember? AssignedToMember { get; set; }
}

public class MeetingSignature
{
    public int SigId { get; set; }
    public int MeetingId { get; set; } // Can refer to SessionId or MinutesId
    public int MemberId { get; set; }
    public string? SignatureHash { get; set; }
    public DateTime SigningTime { get; set; } = DateTime.UtcNow;
    public bool IsVerified { get; set; }

    // Navigations
    public CommitteeMember Member { get; set; } = null!;
}

public class Minute
{
    public int MinuteId { get; set; }
    public int SessionId { get; set; }
    public int Status { get; set; } // 1=جديد|2=منجز|3=مؤرشف
    public string? CommitteeOrderRef { get; set; }
    public string? SessionRef { get; set; }
    public string? OtherRecommendations { get; set; }
    public string? GeneratedFilePath { get; set; }
    public int CreatedByUserId { get; set; }

    // Navigations
    public Session Session { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
}
