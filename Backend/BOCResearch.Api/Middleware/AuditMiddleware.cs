using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace BOCResearch.Api.Middleware;

public class AuditMiddleware
{
    private readonly RequestDelegate _next;

    public AuditMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUnitOfWork unitOfWork)
    {
        var method = context.Request.Method;
        
        // Only log modifying requests
        if (method == "POST" || method == "PUT" || method == "DELETE" || method == "PATCH")
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdStr, out var id) ? id : null;

            var auditLog = new SystemAuditLog
            {
                UserId = userId,
                ActionType = method,
                TableName = context.Request.Path,
                ActionDate = DateTime.UtcNow,
                IPAddress = context.Connection.RemoteIpAddress?.ToString()
            };

            // Capture request body if needed (simplified for now)
            // auditLog.NewData = ...;

            await unitOfWork.Repository<SystemAuditLog>().AddAsync(auditLog);
            await unitOfWork.SaveChangesAsync();
        }

        await _next(context);
    }
}
