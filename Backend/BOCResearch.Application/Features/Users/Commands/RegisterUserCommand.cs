using System;
using System.Threading;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Application.Features.Users.Commands;

public record RegisterUserCommand(
    string Username,
    string Password,
    string Email,
    string? EmployeeId,
    string? ActivationCode,
    string? BadgeImagePath
) : IRequest<int>;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, int>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserHandler(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
    }

    public async Task<int> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        if (await _unitOfWork.Repository<User>().Entities.AnyAsync(u => u.Username == request.Username))
            throw new Exception("اسم المستخدم موجود مسبقاً");

        if (await _unitOfWork.Repository<User>().Entities.AnyAsync(u => u.Email == request.Email))
            throw new Exception("البريد الإلكتروني مستخدم مسبقاً");

        var user = new User
        {
            Username = request.Username,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Email = request.Email,
            EmployeeId = request.EmployeeId,
            ActivationCode = request.ActivationCode,
            BadgeImagePath = request.BadgeImagePath,
            IsActive = false, // بانتظار تفعيل المشرف
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return user.UserId;
    }
}
