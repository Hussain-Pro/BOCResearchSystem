using System.Collections.Generic;
using BOCResearch.Domain.Entities;

namespace BOCResearch.Application.Common.Interfaces;

public interface ITokenService
{
    string CreateToken(User user, IEnumerable<string> roles);
}
