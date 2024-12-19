using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

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


    public class ResetPasswordController(ApplicationDbContext db) : ControllerBase
    {

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
        public async Task<IActionResult> ChangePassword([FromBody] PasswordResetDto resetDto, CancellationToken cancellationToken)
        {
            User? user=null;
            Employee? employee=null;

            if(resetDto.EmailAddress.Contains("@lendacar.ba"))
                employee = await db.Employees.FirstOrDefaultAsync(e => e.EmailAdress == resetDto.EmailAddress, cancellationToken);
            else
                user = await db.Users.FirstOrDefaultAsync(u => u.EmailAdress == resetDto.EmailAddress, cancellationToken);

            if (user != null)
            {

                if (!string.IsNullOrWhiteSpace(resetDto.CurrentPassword))
                {
                    if (!ComparePasswords(resetDto.CurrentPassword, user.PasswordSalt,user.PasswordHash))
                        return BadRequest("Entered password doesn't match current password");
                }
                else
                    return BadRequest("Current password is required");


                var hashedNewPassword = GeneratePasswordHash(resetDto.NewPassword);

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
                if(!string.IsNullOrWhiteSpace(resetDto.CurrentPassword))
                {
                    if (!ComparePasswords(resetDto.CurrentPassword, employee.PasswordSalt,employee.PasswordHash))
                        return BadRequest("Entered password doesn't match current password");
                }
                else 
                    return BadRequest("Current password is required");

                var hashedNewPassword = GeneratePasswordHash(resetDto.NewPassword);

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
    }
}
