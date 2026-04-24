namespace BOCResearch.Application.DTOs;

public record LoginRequest(string Username, string Password);

public record AuthResponse(
    string Token,
    int Id,
    string FullName,
    string Role,
    string Email,
    string? EmployeeId,
    bool TwoFactorEnabled,
    DateTime? LastGradeChangeDate = null,
    DateTime? EligibleDate = null
);

public record RegisterRequest(
    string EmployeeId,
    string FullName,
    string Email,
    string Username,
    string Password,
    string ActivationCode
);
