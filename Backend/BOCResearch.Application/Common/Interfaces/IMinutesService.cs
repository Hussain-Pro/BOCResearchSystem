using System.Threading.Tasks;

namespace BOCResearch.Application.Common.Interfaces;

public interface IMinutesService
{
    Task<string> GenerateSessionMinutesAsync(int sessionId);
}
