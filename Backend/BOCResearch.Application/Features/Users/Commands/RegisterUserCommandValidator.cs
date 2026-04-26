using FluentValidation;

namespace BOCResearch.Application.Features.Users.Commands;

public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty().MinimumLength(3).MaximumLength(64);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(128);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.EmployeeId).MaximumLength(32);
        RuleFor(x => x.ActivationCode).MaximumLength(64);
        RuleFor(x => x.BadgeImagePath).MaximumLength(512);
    }
}
