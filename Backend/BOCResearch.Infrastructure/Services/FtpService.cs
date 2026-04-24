using System;
using System.IO;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using FluentFTP;
using Microsoft.Extensions.Configuration;

namespace BOCResearch.Infrastructure.Services;

public class FtpService : IFtpService
{
    private readonly IConfiguration _config;

    public FtpService(IConfiguration config)
    {
        _config = config;
    }

    private AsyncFtpClient GetClient()
    {
        var host = _config["Ftp:Host"];
        var user = _config["Ftp:User"];
        var pass = _config["Ftp:Pass"];
        return new AsyncFtpClient(host, user, pass);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string folder)
    {
        using var client = GetClient();
        await client.Connect();

        var remotePath = $"/{folder}/{Guid.NewGuid()}_{fileName}";
        
        // Ensure directory exists
        if (!await client.DirectoryExists($"/{folder}"))
        {
            await client.CreateDirectory($"/{folder}");
        }

        var status = await client.UploadStream(fileStream, remotePath);
        
        await client.Disconnect();

        if (status != FtpStatus.Success)
        {
            throw new Exception("FTP Upload failed");
        }

        return remotePath;
    }

    public async Task<byte[]> DownloadFileAsync(string remotePath)
    {
        using var client = GetClient();
        await client.Connect();

        using var ms = new MemoryStream();
        var status = await client.DownloadStream(ms, remotePath);

        await client.Disconnect();

        if (!status)
        {
            throw new Exception("FTP Download failed");
        }

        return ms.ToArray();
    }
}
