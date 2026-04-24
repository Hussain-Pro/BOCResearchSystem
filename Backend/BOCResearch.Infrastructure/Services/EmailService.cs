using System.Threading.Tasks;

namespace BOCResearch.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}

public class EmailService : IEmailService
{
    public Task SendEmailAsync(string to, string subject, string body)
    {
        // For development, just log it. Real implementation would use SmtpClient or SendGrid
        System.Diagnostics.Debug.WriteLine($"Email sent to {to}: {subject}");
        return Task.CompletedTask;
    }
}
