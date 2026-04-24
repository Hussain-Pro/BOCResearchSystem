using System.IO;
using System.Threading.Tasks;

namespace BOCResearch.Application.Common.Interfaces;

public interface IFtpService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string folder);
    Task<byte[]> DownloadFileAsync(string remotePath);
}
