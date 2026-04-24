using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BOCResearch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFunctionsAndViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // [H] Views
            
            migrationBuilder.Sql(@"
                CREATE VIEW vw_EligibleEmployees AS
                SELECT e.*, 
                       DATEADD(YEAR, 5, e.LastGradeChangeDate) AS RawEligibleDate,
                       ISNULL((SELECT SUM(MonthsReduction) FROM ThankYouLetters WHERE EmployeeID = e.EmployeeID AND IsActive = 1 AND UsedInCalculation = 0), 0) +
                       ISNULL((SELECT SUM(MonthsReduction) FROM QualificationSeniorities WHERE EmployeeID = e.EmployeeID AND UsedInCalculation = 0), 0) AS TotalReductionMonths
                FROM Employees e
                WHERE e.IsActive = 1;
            ");

            migrationBuilder.Sql(@"
                CREATE VIEW vw_EvaluatorScoreDetail AS
                SELECT s.SubmissionId, s.Title, a.EvaluatorId, u.Username AS EvaluatorName,
                       c.CriteriaName, ecs.Score, ecs.Notes
                FROM Submissions s
                JOIN EvaluatorAssignments a ON s.SubmissionId = a.SubmissionId
                JOIN Evaluators ev ON a.EvaluatorId = ev.EvaluatorId
                JOIN Users u ON ev.UserId = u.UserId
                JOIN EvaluatorCriteriaScores ecs ON a.AssignmentId = ecs.AssignmentId
                JOIN EvaluationCriteria c ON ecs.CriteriaId = c.CriteriaId;
            ");

            // [I] Functions & Procedures

            migrationBuilder.Sql(@"
                CREATE FUNCTION fn_GetEligibleDate(@EmployeeID NVARCHAR(450))
                RETURNS DATETIME
                AS
                BEGIN
                    DECLARE @LastDate DATETIME;
                    DECLARE @RedMonths INT;
                    
                    SELECT @LastDate = LastGradeChangeDate FROM Employees WHERE EmployeeID = @EmployeeID;
                    
                    SELECT @RedMonths = 
                        ISNULL((SELECT SUM(MonthsReduction) FROM ThankYouLetters WHERE EmployeeID = @EmployeeID AND IsActive = 1 AND UsedInCalculation = 0), 0) +
                        ISNULL((SELECT SUM(MonthsReduction) FROM QualificationSeniorities WHERE EmployeeID = @EmployeeID AND UsedInCalculation = 0), 0);
                    
                    RETURN DATEADD(MONTH, -ISNULL(@RedMonths, 0), DATEADD(YEAR, 5, @LastDate));
                END
            ");

            migrationBuilder.Sql(@"
                CREATE FUNCTION fn_GetEvaluatorTotalScore(@AssignmentID INT)
                RETURNS DECIMAL(5,2)
                AS
                BEGIN
                    RETURN (SELECT SUM(Score) FROM EvaluatorCriteriaScores WHERE AssignmentID = @AssignmentID);
                END
            ");

            migrationBuilder.Sql(@"
                CREATE FUNCTION fn_GetFinalScore(@EvaluatorScore DECIMAL(5,2), @CommitteeScore DECIMAL(5,2))
                RETURNS DECIMAL(5,2)
                AS
                BEGIN
                    RETURN (@EvaluatorScore * 0.7) + @CommitteeScore;
                END
            ");

            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_DailySystemCleanup
                AS
                BEGIN
                    -- Unblock plagiarism blocked submissions
                    UPDATE Submissions
                    SET BlockedUntil = NULL,
                        BlockReason = 'Auto-unblocked: Period Expired'
                    WHERE BlockedUntil IS NOT NULL AND BlockedUntil <= GETUTCDATE();
                    
                    -- Archive notification queue (sent or old failed)
                    DELETE FROM NotificationQueue WHERE Status = 'Sent' AND SentDate < DATEADD(DAY, -30, GETUTCDATE());
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_DailySystemCleanup;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS fn_GetFinalScore;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS fn_GetEvaluatorTotalScore;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS fn_GetEligibleDate;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS vw_EvaluatorScoreDetail;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS vw_EligibleEmployees;");
        }
    }
}
