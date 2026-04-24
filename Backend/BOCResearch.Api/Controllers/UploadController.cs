using System;
using System.IO;
using System.Threading.Tasks;
using BOCResearch.Api.Models;
using BOCResearch.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BOCResearch.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IFtpService _ftpService;

    public UploadController(IFtpService ftpService)
    {
        _ftpService = ftpService;
    }

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
