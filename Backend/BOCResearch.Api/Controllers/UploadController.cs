using System;
using System.IO;
using System.Threading.Tasks;
using BOCResearch.Api.Models;
using BOCResearch.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BOCResearch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IFtpService _ftpService;

    public UploadController(IFtpService ftpService)
    {
        _ftpService = ftpService;
    }

    /// <summary>Upload employee badge / ID image during registration (anonymous).</summary>
    [AllowAnonymous]
    [HttpPost("badge")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadBadge(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new ApiResponse<string>("No file uploaded"));

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp" or ".pdf"))
            return BadRequest(new ApiResponse<string>("Only JPG, PNG, WEBP or PDF are allowed for badge"));

        using var stream = file.OpenReadStream();
        var remotePath = await _ftpService.UploadFileAsync(stream, file.FileName, "badges");

        if (string.IsNullOrEmpty(remotePath))
            return StatusCode(500, new ApiResponse<string>("Failed to upload to storage"));

        return Ok(new ApiResponse<string>(remotePath, "Badge uploaded successfully"));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new ApiResponse<string>("No file uploaded"));

        if (Path.GetExtension(file.FileName).ToLower() != ".pdf")
            return BadRequest(new ApiResponse<string>("Only PDF files are allowed"));

        var fileName = file.FileName;
        using var stream = file.OpenReadStream();
        
        var remotePath = await _ftpService.UploadFileAsync(stream, fileName, "submissions");

        if (string.IsNullOrEmpty(remotePath))
            return StatusCode(500, new ApiResponse<string>("Failed to upload to storage"));

        return Ok(new ApiResponse<string>(remotePath, "File uploaded successfully"));
    }
}
