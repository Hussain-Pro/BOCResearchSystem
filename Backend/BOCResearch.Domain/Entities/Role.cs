using System.Collections.Generic;

namespace BOCResearch.Domain.Entities;

public class Role
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string RoleNameAr { get; set; } = string.Empty;
    
    // Navigations
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
