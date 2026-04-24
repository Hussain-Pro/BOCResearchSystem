using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using Microsoft.EntityFrameworkCore;
using iText.Kernel.Font;
using iText.IO.Font;

namespace BOCResearch.Infrastructure.Services;

public class MinutesService : IMinutesService
{
    private readonly IUnitOfWork _unitOfWork;

    public MinutesService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<string> GenerateSessionMinutesAsync(int sessionId)
    {
        var session = await _unitOfWork.Repository<Session>().Entities
            .Include(s => s.Committee)
            .Include(s => s.Assignments)
                .ThenInclude(a => a.Submission)
                    .ThenInclude(sub => sub.Employee)
            .Include(s => s.Attendance)
                .ThenInclude(a => a.Member)
                    .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null) throw new Exception("Session not found");

        var fileName = $"Minutes_{session.SessionNumber}_{DateTime.Now:yyyyMMddHHmmss}.pdf";
        var filePath = Path.Combine("wwwroot", "minutes", fileName);
        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

        using (var writer = new PdfWriter(filePath))
        using (var pdf = new PdfDocument(writer))
        using (var document = new Document(pdf))
        {
            // Set RTL and Arabic font (Placeholder for actual font path)
            // document.SetBaseDirection(BaseDirection.RIGHT_TO_LEFT);
            
            document.Add(new Paragraph("محضر اجتماع لجنة البحوث").SetTextAlignment(TextAlignment.CENTER).SetFontSize(18));
            document.Add(new Paragraph($"رقم الاجتماع: {session.SessionNumber}"));
            document.Add(new Paragraph($"التاريخ: {session.SessionDate:yyyy-MM-dd}"));
            document.Add(new Paragraph($"المكان: {session.Location}"));

            // Example Table for Successful Submissions
            var successful = session.Assignments.Where(a => a.SessionResult == 4).ToList(); // Assuming 4=Successful
            if (successful.Any())
            {
                document.Add(new Paragraph("البحوث الناجحة:").SetTextAlignment(TextAlignment.RIGHT));
                var table = new Table(UnitValue.CreatePercentArray(new float[] { 1, 2, 3, 2, 2 })).UseAllAvailableWidth();
                table.AddHeaderCell("ت");
                table.AddHeaderCell("الرقم الوظيفي");
                table.AddHeaderCell("الاسم");
                table.AddHeaderCell("العنوان");
                table.AddHeaderCell("النوع");

                int i = 1;
                foreach (var item in successful)
                {
                    table.AddCell(i++.ToString());
                    table.AddCell(item.Submission.EmployeeId);
                    table.AddCell(item.Submission.Employee.FullName);
                    table.AddCell(item.Submission.Title);
                    table.AddCell(item.Submission.SubmissionType.ToString());
                }
                document.Add(table);
            }

            document.Add(new Paragraph("\nتوصيات أخرى:").SetTextAlignment(TextAlignment.RIGHT));
            document.Add(new Paragraph("لا يوجد"));

            document.Add(new Paragraph("\nالأعضاء الحاضرون:").SetTextAlignment(TextAlignment.RIGHT));
            foreach (var att in session.Attendance.Where(a => a.IsPresent))
            {
                document.Add(new Paragraph($"- {att.Member.User.Username} ................................"));
            }
        }

        return filePath;
    }
}
