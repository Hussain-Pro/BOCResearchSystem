using System.Threading.Tasks;

namespace BOCResearch.Application.Common.Interfaces;

public interface ITwoFactorService
{
    string GenerateSecretKey();
    string GenerateQrCodeUri(string email, string secretKey);
    bool VerifyCode(string secretKey, string code);
}
