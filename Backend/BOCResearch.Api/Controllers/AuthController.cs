using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BOCResearch.Api.Models;
using BOCResearch.Application.Common.Interfaces;
using BOCResearch.Application.DTOs;
using BOCResearch.Application.Features.Users.Commands;
using BOCResearch.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BOCResearch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private static readonly string[] RolePriority =
    [
        "SystemSupervisor", "CommitteeHead", "CommitteeDeputy", "Secretary",
        "OriginalMember", "AlternateMember", "Evaluator", "Assistant", "DataEntry", "Employee"
    ];

    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly Application.Common.Services.EligibilityService _eligibilityService;
    private readonly IMediator _mediator;

    public AuthController(
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        IPasswordHasher passwordHasher,
        Application.Common.Services.EligibilityService eligibilityService,
        IMediator mediator)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _eligibilityService = eligibilityService;
        _mediator = mediator;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _unitOfWork.Repository<User>().Entities
            .Include(u => u.Employee)
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new ApiResponse<string>("Invalid username or password"));

        if (!user.IsActive)
            return BadRequest(new ApiResponse<string>("Account is deactivated"));

        var roles = user.UserRoles.Select(ur => ur.Role.RoleName).Distinct().ToList();
        if (roles.Count == 0)
            roles.Add("Employee");

        var primaryRole = PickPrimaryRole(roles);
        var token = _tokenService.CreateToken(user, roles);

        DateTime? lastChange = user.Employee?.LastGradeChangeDate;
        DateTime? eligibleDate = null;

        if (!string.IsNullOrEmpty(user.EmployeeId))
            eligibleDate = await _eligibilityService.CalculateEligibleDateAsync(user.EmployeeId);

        return Ok(new ApiResponse<AuthResponse>(new AuthResponse(
            Token: token,
            Id: user.UserId,
            FullName: user.Employee?.FullName ?? user.Username,
            Role: primaryRole,
            Email: user.Email,
            EmployeeId: user.EmployeeId,
            TwoFactorEnabled: user.TwoFactorEnabled,
            LastGradeChangeDate: lastChange,
            EligibleDate: eligibleDate
        ), "Login successful"));
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new ApiResponse<int>(result, "تم إرسال طلب التسجيل بنجاح، بانتظار تفعيل المشرف"));
    }

    [AllowAnonymous]
    [HttpGet("seed")]
    public async Task<IActionResult> Seed()
    {
        var roleRepo = _unitOfWork.Repository<Role>();
        if (!(await roleRepo.GetAllAsync()).Any())
        {
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
        }

        await SeedSampleEmployeesIfEmptyAsync();

        return Ok(new ApiResponse<string>(
            "تم التحقق من البيانات الأولية. تسجيل الدخول: admin / admin123 — أرقام وظيفية للتجربة: 10245، 10312، 10488"));
    }

    private async Task SeedSampleEmployeesIfEmptyAsync()
    {
        if (await _unitOfWork.Repository<Employee>().Entities.AnyAsync())
            return;

        var lastChange = DateTime.UtcNow.AddYears(-3);
        var samples = new[]
        {
            new Employee
            {
                EmployeeId = "10245",
                FullName = "أحمد محمود علي",
                JobTitle = "مهندس بترولي",
                JobGrade = 3,
                Department = "العمليات",
                Section = "الحقل الشمالي",
                WorkLocation = "البصرة",
                Qualification = 3,
                QualificationName = "بكالوريوس",
                Email = "a.mahmoud@boc.oil.gov.iq",
                IsActive = true,
                LastGradeChangeDate = lastChange
            },
            new Employee
            {
                EmployeeId = "10312",
                FullName = "سارة كريم حسن",
                JobTitle = "محللة أنظمة",
                JobGrade = 3,
                Department = "تقنية المعلومات",
                Section = "الدعم الفني",
                WorkLocation = "البصرة",
                Qualification = 3,
                QualificationName = "بكالوريوس",
                Email = "s.karim@boc.oil.gov.iq",
                IsActive = true,
                LastGradeChangeDate = lastChange
            },
            new Employee
            {
                EmployeeId = "10488",
                FullName = "علي عبد الله ناصر",
                JobTitle = "فني أول",
                JobGrade = 2,
                Department = "الصيانة",
                Section = "المعدات",
                WorkLocation = "البصرة",
                Qualification = 5,
                QualificationName = "دبلوم تقني",
                Email = "a.abdullah@boc.oil.gov.iq",
                IsActive = true,
                LastGradeChangeDate = lastChange
            }
        };

        foreach (var e in samples)
            await _unitOfWork.Repository<Employee>().AddAsync(e);

        await _unitOfWork.SaveChangesAsync();
    }

    private static string PickPrimaryRole(IEnumerable<string> roles)
    {
        var set = roles.ToHashSet(StringComparer.OrdinalIgnoreCase);
        foreach (var r in RolePriority)
        {
            if (set.Contains(r))
                return r;
        }

        return roles.First();
    }
}
