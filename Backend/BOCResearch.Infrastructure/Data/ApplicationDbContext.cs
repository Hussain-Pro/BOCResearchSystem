using BOCResearch.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<ThankYouLetter> ThankYouLetters => Set<ThankYouLetter>();
    public DbSet<QualificationSeniority> QualificationSeniorities => Set<QualificationSeniority>();
    public DbSet<Committee> Committees => Set<Committee>();
    public DbSet<CommitteeMember> CommitteeMembers => Set<CommitteeMember>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<SubmissionReview> SubmissionReviews => Set<SubmissionReview>();
    public DbSet<ResearchVersion> ResearchVersions => Set<ResearchVersion>();
    public DbSet<EvaluationCriteria> EvaluationCriteria => Set<EvaluationCriteria>();
    public DbSet<Evaluator> Evaluators => Set<Evaluator>();
    public DbSet<EvaluatorAssignment> EvaluatorAssignments => Set<EvaluatorAssignment>();
    public DbSet<EvaluatorCriteriaScore> EvaluatorCriteriaScores => Set<EvaluatorCriteriaScore>();
    public DbSet<CommitteeScore> CommitteeScores => Set<CommitteeScore>();
    public DbSet<Batch> Batches => Set<Batch>();
    public DbSet<BatchSubmission> BatchSubmissions => Set<BatchSubmission>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<SessionSubmissionAssignment> SessionSubmissionAssignments => Set<SessionSubmissionAssignment>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<SystemAuditLog> SystemAuditLogs => Set<SystemAuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<SessionAttendance> SessionAttendances => Set<SessionAttendance>();
    public DbSet<MeetingSignature> MeetingSignatures => Set<MeetingSignature>();
    public DbSet<Minute> Minutes => Set<Minute>();
    public DbSet<EvaluatorRequest> EvaluatorRequests => Set<EvaluatorRequest>();
    public DbSet<FTPDocument> FTPDocuments => Set<FTPDocument>();
    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();
    public DbSet<NotificationQueue> NotificationQueues => Set<NotificationQueue>();
    public DbSet<EmployeeRelationship> EmployeeRelationships => Set<EmployeeRelationship>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.EmployeeId);
            entity.Property(e => e.EmployeeId).HasMaxLength(50);
            entity.Property(e => e.FullName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(150);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.Username).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Username).IsUnique();

            entity.HasOne(u => u.Employee)
                  .WithOne(e => e.User)
                  .HasForeignKey<User>(u => u.EmployeeId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.UserRoleId);
            entity.HasOne(ur => ur.User)
                  .WithMany(u => u.UserRoles)
                  .HasForeignKey(ur => ur.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ur => ur.Role)
                  .WithMany()
                  .HasForeignKey(ur => ur.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.SubmissionId);
            entity.HasOne(s => s.Employee)
                  .WithMany()
                  .HasForeignKey(s => s.EmployeeId);
        });

        modelBuilder.Entity<EvaluatorAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId);
            entity.Property(e => e.ScoreOut100).HasPrecision(5, 2);
            entity.HasOne(a => a.AssignedByUser)
                  .WithMany()
                  .HasForeignKey(a => a.AssignedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EvaluatorCriteriaScore>(entity =>
        {
            entity.HasKey(e => e.CriteriaScoreId);
            entity.HasIndex(e => new { e.AssignmentId, e.CriteriaId }).IsUnique();
        });

        modelBuilder.Entity<CommitteeScore>(entity =>
        {
            entity.HasKey(e => e.ScoreId);
            entity.Property(e => e.FinalScore).HasPrecision(5, 2);
            entity.HasOne(s => s.ScoredByUser)
                  .WithMany()
                  .HasForeignKey(s => s.ScoredByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Evaluator>(entity =>
        {
            entity.HasKey(e => e.EvaluatorId);
            entity.HasOne(ev => ev.User)
                  .WithMany()
                  .HasForeignKey(ev => ev.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.MessageId);
            entity.HasOne(m => m.Sender)
                  .WithMany()
                  .HasForeignKey(m => m.SenderUserId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(m => m.Recipient)
                  .WithMany()
                  .HasForeignKey(m => m.RecipientUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Minute>(entity =>
        {
            entity.HasKey(e => e.MinuteId);
            entity.HasOne(m => m.Session)
                  .WithMany()
                  .HasForeignKey(m => m.SessionId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(m => m.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(m => m.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SubmissionReview>(entity =>
        {
            entity.HasKey(e => e.ReviewId);
            entity.Property(e => e.PlagiarismPercentage).HasPrecision(5, 2);
            entity.HasOne(r => r.ReviewedByUser)
                  .WithMany()
                  .HasForeignKey(r => r.ReviewedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ResearchVersion>(entity =>
        {
            entity.HasKey(e => e.VersionId);
            entity.HasOne(v => v.Uploader)
                  .WithMany()
                  .HasForeignKey(v => v.UploaderId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasKey(e => e.SettingKey);
            entity.Property(e => e.SettingKey).HasMaxLength(100);
        });

        modelBuilder.Entity<SubmissionReview>(entity => entity.HasKey(e => e.ReviewId));
        modelBuilder.Entity<ResearchVersion>(entity => entity.HasKey(e => e.VersionId));
        modelBuilder.Entity<EvaluationCriteria>(entity => entity.HasKey(e => e.CriteriaId));
        modelBuilder.Entity<Evaluator>(entity => entity.HasKey(e => e.EvaluatorId));
        modelBuilder.Entity<Batch>(entity =>
        {
            entity.HasKey(e => e.BatchId);
            entity.HasOne(b => b.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(b => b.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.SessionId);
            entity.HasOne(s => s.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(s => s.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<BatchSubmission>(entity => entity.HasKey(e => e.BatchSubId));
        modelBuilder.Entity<Minute>(entity => entity.HasKey(e => e.MinuteId));
        modelBuilder.Entity<EvaluatorRequest>(entity => entity.HasKey(e => e.RequestId));
        modelBuilder.Entity<FTPDocument>(entity =>
        {
            entity.HasKey(e => e.DocId);
            entity.HasOne(d => d.UploadedByUser)
                  .WithMany()
                  .HasForeignKey(d => d.UploadedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<NotificationTemplate>(entity => entity.HasKey(e => e.TemplateId));
        modelBuilder.Entity<NotificationQueue>(entity =>
        {
            entity.HasKey(e => e.QueueId);
            entity.HasOne(q => q.User)
                  .WithMany()
                  .HasForeignKey(q => q.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<EmployeeRelationship>(entity => entity.HasKey(e => e.RelId));
        modelBuilder.Entity<ThankYouLetter>(entity => entity.HasKey(e => e.LetterId));
        modelBuilder.Entity<QualificationSeniority>(entity => entity.HasKey(e => e.SeniorityId));
        modelBuilder.Entity<Committee>(entity => entity.HasKey(e => e.CommitteeId));
        modelBuilder.Entity<CommitteeMember>(entity => entity.HasKey(e => e.MemberId));
        modelBuilder.Entity<SessionSubmissionAssignment>(entity => entity.HasKey(e => e.AssignmentId));
        modelBuilder.Entity<SystemAuditLog>(entity => entity.HasKey(e => e.LogId));

        // Additional configurations for complex relationships
        modelBuilder.Entity<SessionSubmissionAssignment>()
            .HasOne(a => a.Session)
            .WithMany(s => s.Assignments)
            .HasForeignKey(a => a.SessionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BatchSubmission>()
            .HasOne(bs => bs.Batch)
            .WithMany(b => b.Submissions)
            .HasForeignKey(bs => bs.BatchId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SessionAttendance>(entity =>
        {
            entity.HasKey(e => e.AttendanceID);
            entity.HasOne(a => a.Session)
                  .WithMany(s => s.Attendance)
                  .HasForeignKey(a => a.SessionID)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(a => a.Member)
                  .WithMany()
                  .HasForeignKey(a => a.MemberID)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MeetingSignature>(entity =>
        {
            entity.HasKey(e => e.SigId);
            entity.HasOne(s => s.Member)
                  .WithMany()
                  .HasForeignKey(s => s.MemberId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
