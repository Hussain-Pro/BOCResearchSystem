using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BOCResearch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSubmissionReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PlagiarismPercentage",
                table: "SubmissionReviews",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlagiarismPercentage",
                table: "SubmissionReviews");
        }
    }
}
