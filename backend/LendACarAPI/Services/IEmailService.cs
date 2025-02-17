using LendACarAPI.DTOs;

namespace LendACarAPI.Services
{
    public interface IEmailService
    {
        public Task SendEmailAsync(EmailDto email);
    }
}
