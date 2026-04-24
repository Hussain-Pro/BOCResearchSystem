using System;
using System.Collections.Generic;

namespace BOCResearch.Domain.Entities;

public class User
{
    public int UserId { get; set; }
    public string? EmployeeId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? BadgeImagePath { get; set; }
    public bool IsActive { get; set; } = false;
    public bool TwoFactorEnabled { get; set; } = false;
    public string? TwoFactorSecret { get; set; }
    public string? ActivationCode { get; set; }
    public bool IsCodeUsed { get; set; } = false;
    public int? VerifiedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // Navigations
    public Employee? Employee { get; set; }
    public User? VerifiedByUser { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
