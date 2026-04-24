using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BOCResearch.Api.Services;

public class DailyCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyCleanupService> _logger;

    public DailyCleanupService(IServiceProvider serviceProvider, ILogger<DailyCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Daily Cleanup Service is running.");

            using (var scope = _serviceProvider.CreateScope())
            {
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                
                // Logic for unblocking plagiarized submissions
                var now = DateTime.UtcNow;
                var blockedSubmissions = await unitOfWork.Repository<Submission>()
                    .FindAsync(s => s.BlockedUntil != null && s.BlockedUntil <= now);

                foreach (var sub in blockedSubmissions)
                {
                    sub.BlockedUntil = null;
                    sub.BlockReason = "Block period expired (Auto-unblocked)";
                    unitOfWork.Repository<Submission>().Update(sub);
                }

                if (blockedSubmissions.Any())
                {
                    await unitOfWork.SaveChangesAsync();
                }
            }

            // Wait until next day
            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }
}
