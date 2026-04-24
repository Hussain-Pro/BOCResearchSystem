using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BOCResearch.Api.Models;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Application.DTOs;
using BOCResearch.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly Application.Common.Services.EligibilityService _eligibilityService;

    public AuthController(
        IUnitOfWork unitOfWork, 
        ITokenService tokenService,
        IPasswordHasher passwordHasher,
        Application.Common.Services.EligibilityService eligibilityService)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _eligibilityService = eligibilityService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _unitOfWork.Repository<User>().Entities
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new ApiResponse<string>("Invalid username or password"));
        }

        if (!user.IsActive)
        {
            return BadRequest(new ApiResponse<string>("Account is deactivated"));
        }

        var roles = new List<string> { "Employee" };
        if (user.Username == "admin") roles.Add("SystemSupervisor");

        var token = _tokenService.CreateToken(user, roles);

        DateTime? lastChange = user.Employee?.LastGradeChangeDate;
        DateTime? eligibleDate = null;

        if (!string.IsNullOrEmpty(user.EmployeeId))
        {
            eligibleDate = await _eligibilityService.CalculateEligibleDateAsync(user.EmployeeId);
        }

        return Ok(new ApiResponse<AuthResponse>(new AuthResponse(
            Token: token,
            Id: user.UserId,
            FullName: user.Employee?.FullName ?? user.Username,
            Role: roles.First(),
            Email: user.Email,
            EmployeeId: user.EmployeeId,
            TwoFactorEnabled: user.TwoFactorEnabled,
            LastGradeChangeDate: lastChange,
            EligibleDate: eligibleDate
        ), "Login successful"));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] BOCResearch.Application.Features.Users.Commands.RegisterUserCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new ApiResponse<int>(result, "تم إرسال طلب التسجيل بنجاح، بانتظار تفعيل المشرف"));
    }

    [HttpGet("seed")]
    public async Task<IActionResult> Seed()
    {
        var roleRepo = _unitOfWork.Repository<Role>();
        if ((await roleRepo.GetAllAsync()).Any()) return Ok(new ApiResponse<string>("Already seeded"));

        var adminRole = new Role { RoleName = "SystemSupervisor", RoleNameAr = "مشرف النظام" };
        var empRole = new Role { RoleName = "Employee", RoleNameAr = "موظف" };
        
        await roleRepo.AddAsync(adminRole);
        await roleRepo.AddAsync(empRole);
        await _unitOfWork.SaveChangesAsync();

        var adminUser = new User
        {
            Username = "admin",
            PasswordHash = _passwordHasher.HashPassword("admin123"),
            Email = "admin@boc.oil.gov.iq",
            IsActive = true
        };

        await _unitOfWork.Repository<User>().AddAsync(adminUser);
        await _unitOfWork.SaveChangesAsync();

        await _unitOfWork.Repository<UserRole>().AddAsync(new UserRole
        {
            UserId = adminUser.UserId,
            RoleId = adminRole.RoleId
        });
        await _unitOfWork.SaveChangesAsync();

        return Ok(new ApiResponse<string>("Seeded successfully. Use admin/admin123 to login."));
    }
}
