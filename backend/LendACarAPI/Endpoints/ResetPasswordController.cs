using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]

    /// <summary>
    /// Global controller for reseting password for both users or employees
    /// It checks thru the email if it is a user or employee beacuse employees have @lendacar email and it is unique for every employee
    /// </summary>
    /// <returns>
    /// It returns employee or user because of the frontedn routing to send the user to the correct login page
    /// </returns>
    /// 


    public class ResetPasswordController(ApplicationDbContext db,IEmailService emailService) : ControllerBase
    {
        //Samo radi za usere jer employees nemaju validnu email adresu
        //Implementacija za employee i usere ce biti slican kao i za reset password metodu
        [HttpPost("send-reset-token")]
        public async Task<ActionResult> SendEmail([FromBody] EmailSendPasswordResetRequest request,CancellationToken cancellationToken)
        {
            var emailToken = RandomNumberGenerator.GetInt32(100000, 999999);

            var user = await db.Users.FirstOrDefaultAsync(u => u.EmailAdress == request.EmailTo);
            if (user == null)
                return BadRequest("User with given email was not found");


            user.ResetPasswordToken = emailToken.ToString();
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddMinutes(15);

            await db.SaveChangesAsync(cancellationToken);

            string emailBody = $@"
                         <html>
                         <body style='font-family: Arial, sans-serif;'>
                             <h3>Password Reset Request</h3>
                             <h2>Hello,</h2>
                             <h3>Use the code below to reset your password:</h3>
                             <h3>{emailToken}</h3>
                             <p>This code will expire in 15 minutes.</p>
                             <p>If you didn't request a password reset, please ignore this email.</p>
                         </body>
                         </html>";

            var email = new EmailDto()
            {
                To = request.EmailTo,
                Subject = $"Password reset verification code",
                Body = emailBody
            };

            await emailService.SendEmailAsync(email);
            bool isSent = true;


            return Ok(new {isSent});
        }

        [HttpPost("validate-password-token")]
        public async Task<ActionResult> ValidateToken([FromBody] EmailSendPasswordResetRequest resetRequest,CancellationToken cancellationToken)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.EmailAdress == resetRequest.EmailTo, cancellationToken);
            bool isValidToken = true;

            if (user == null)
                return BadRequest("User was with given email was not found");

            if (user.ResetPasswordToken != resetRequest.ResetToken || user.ResetPasswordTokenExpiry < DateTime.UtcNow)
            {
                isValidToken = false;
                return Ok(new { isValidToken});
            }

            return Ok(new { isValidToken });
        }





        [HttpPut("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] PasswordResetDto resetDto,CancellationToken cancellationToken)
        {
            User? user = null;
            Employee? employee = null;

            if (resetDto.EmailAddress.Contains("@lendacar.ba"))
                employee = await db.Employees.FirstOrDefaultAsync(e => e.EmailAdress == resetDto.EmailAddress, cancellationToken);
            else
                user = await db.Users.FirstOrDefaultAsync(u => u.EmailAdress == resetDto.EmailAddress, cancellationToken);


            if (user != null)
            {
                if(user.ResetPasswordToken!=resetDto.ResetToken || user.ResetPasswordTokenExpiry < DateTime.UtcNow)
                    return BadRequest("Invalid reset token");
                


                var hashedPassword = GeneratePasswordHash(resetDto.NewPassword);

                var salt = hashedPassword.Item1;
                var hash = hashedPassword.Item2;

                for (var i = 0; i < hash.Length; i++)
                {
                    if (hash[i] == user.PasswordHash[i])
                        return BadRequest("Cannot reuse old password");
                }


                user.PasswordHash = hash;
                user.PasswordSalt = salt;

                await db.SaveChangesAsync(cancellationToken);

                return Ok(new { userType = "user" });
            }

            if (employee != null)
            {
                var hashedPassword = GeneratePasswordHash(resetDto.NewPassword);

                var salt = hashedPassword.Item1;
                var hash = hashedPassword.Item2;

                employee.PasswordHash = hash;
                employee.PasswordSalt = salt;

                await db.SaveChangesAsync(cancellationToken);

                return Ok ( new { userType = "employee" });
            }

            return NotFound();
        }

        [HttpPut("change")]
        [MyAuthorization(IsAdmin: false, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> ChangePassword([FromBody] PasswordChangeDto changeDto, CancellationToken cancellationToken)
        {
            User? user=null;
            Employee? employee=null;

            if(changeDto.EmailAddress.Contains("@lendacar.ba"))
                employee = await db.Employees.FirstOrDefaultAsync(e => e.EmailAdress == changeDto.EmailAddress, cancellationToken);
            else
                user = await db.Users.FirstOrDefaultAsync(u => u.EmailAdress == changeDto.EmailAddress, cancellationToken);

            if (user != null)
            {

                if (!string.IsNullOrWhiteSpace(changeDto.CurrentPassword))
                {
                    if (!ComparePasswords(changeDto.CurrentPassword, user.PasswordSalt,user.PasswordHash))
                        return BadRequest("Entered password doesn't match current password");
                }
                else
                    return BadRequest("Current password is required");


                var hashedNewPassword = GeneratePasswordHash(changeDto.NewPassword);

                var salt = hashedNewPassword.Item1;
                var hash = hashedNewPassword.Item2;

                for (var i = 0; i < hash.Length; i++)
                {
                    if (hash[i] == user.PasswordHash[i])
                        return BadRequest("Cannot reuse old password");
                }


                user.PasswordHash = hash;
                user.PasswordSalt = salt;

                await db.SaveChangesAsync(cancellationToken);

                return Ok(new { userType = "user" });
            }

           

            if(employee != null)
            {
                if(!string.IsNullOrWhiteSpace(changeDto.CurrentPassword))
                {
                    if (!ComparePasswords(changeDto.CurrentPassword, employee.PasswordSalt,employee.PasswordHash))
                        return BadRequest("Entered password doesn't match current password");
                }
                else 
                    return BadRequest("Current password is required");

                var hashedNewPassword = GeneratePasswordHash(changeDto.NewPassword);

                var salt = hashedNewPassword.Item1;
                var hash = hashedNewPassword.Item2;

                employee.PasswordHash=hash; 
                employee.PasswordSalt = salt;

                await db.SaveChangesAsync(cancellationToken);

                return Ok(new { userType = "employee" });
            }

            return NotFound();
        }

        private (byte[], byte[]) GeneratePasswordHash(string newPassword)
        {
            using var hmac=new HMACSHA256();

            var computedHash=hmac.ComputeHash(Encoding.UTF8.GetBytes(newPassword));
            var salt = hmac.Key;
            return (salt, computedHash);
        }

        //Function which compares is the current password in the database the same as the password which the user sent
        private bool ComparePasswords(string currentPassword, byte[] passwordSalt, byte[] passwordHash)
        {

            using var hmac = new HMACSHA256(passwordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(currentPassword));
            for (var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != passwordHash[i])
                    return false;
            }

            return true;

        }

        public class EmailSendPasswordResetRequest
        {
            public string? EmailTo { get; set; }
            public string? ResetToken { get; set;}
        }
    }
}
