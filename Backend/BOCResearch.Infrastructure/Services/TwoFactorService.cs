using BOCResearch.Application.Common.Interfaces;
using OtpNet;
using System;
using System.Text;

namespace BOCResearch.Infrastructure.Services;

public class TwoFactorService : ITwoFactorService
{
    private const string Issuer = "BOC-ERS";

    public string GenerateSecretKey()
    {
        var key = KeyGeneration.GenerateRandomKey(20);
        return Base32Encoding.ToString(key);
    }

    public string GenerateQrCodeUri(string email, string secretKey)
    {
        return $"otpauth://totp/{Issuer}:{email}?secret={secretKey}&issuer={Issuer}";
    }

    public bool VerifyCode(string secretKey, string code)
    {
        try
        {
            var keyBytes = Base32Encoding.ToBytes(secretKey);
            var totp = new Totp(keyBytes);
            return totp.VerifyTotp(code, out long timeStepMatched, new VerificationWindow(2, 2));
        }
        catch
        {
            return false;
        }
    }
}
