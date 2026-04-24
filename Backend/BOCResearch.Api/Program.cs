using BOCResearch.Infrastructure.Data;
using BOCResearch.Infrastructure.Services;
using BOCResearch.Infrastructure.Repositories;
using BOCResearch.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// DbContext setup
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<BOCResearch.Application.Common.Services.EligibilityService>();
builder.Services.AddScoped<IFtpService, FtpService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IMinutesService, MinutesService>();
builder.Services.AddScoped<ITwoFactorService, TwoFactorService>();
builder.Services.AddScoped<BOCResearch.Application.Common.Services.ConflictOfInterestService>();
builder.Services.AddHostedService<BOCResearch.Api.Services.DailyCleanupService>();

builder.Services.AddMemoryCache();
builder.Services.AddScoped<ICacheService, CacheService>();

builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(BOCResearch.Application.Common.Interfaces.IUnitOfWork).Assembly);
    cfg.AddBehavior(typeof(MediatR.IPipelineBehavior<,>), typeof(BOCResearch.Application.Common.Behaviors.ValidationBehavior<,>));
});

builder.Services.AddValidatorsFromAssembly(typeof(BOCResearch.Application.Common.Interfaces.IUnitOfWork).Assembly);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication Setup
var jwtKey = builder.Configuration["Jwt:Key"];
var issuer = builder.Configuration["Jwt:Issuer"];
var audience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey ?? throw new InvalidOperationException("JWT Key is missing.")))
        };
    });

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("BOCPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:8080", "http://localhost:5173", "https://*.boc.oil.gov.iq")
               .SetIsOriginAllowedToAllowWildcardSubdomains()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<BOCResearch.Api.Middleware.ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseCors("BOCPolicy");

app.UseAuthentication();
app.UseMiddleware<BOCResearch.Api.Middleware.AuditMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();
