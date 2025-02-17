using LendACarAPI.DTOs;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;


namespace LendACarAPI.Services
{
    public class GmailService(IConfiguration config) : IEmailService
    {
        public async Task SendEmailAsync(EmailDto email)
        {
            var from = Environment.GetEnvironmentVariable("From");

            var emailMessage = new MimeMessage();
            emailMessage.From.Add(MailboxAddress.Parse(from));
            emailMessage.To.Add(MailboxAddress.Parse(email.To));
            emailMessage.Subject=email.Subject;
            emailMessage.Body=new TextPart(TextFormat.Html) { Text = email.Body };

            var smtpServer = Environment.GetEnvironmentVariable("SmtpServer");
            var username=Environment.GetEnvironmentVariable("Username");
            var password=Environment.GetEnvironmentVariable("AppPassword");

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpServer, 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(username, password);
            await smtp.SendAsync(emailMessage);
            await smtp.DisconnectAsync(true);

        }
    }
}
