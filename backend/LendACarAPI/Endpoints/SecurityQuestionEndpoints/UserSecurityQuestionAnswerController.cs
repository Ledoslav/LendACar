using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;

namespace LendACarAPI.Endpoints.SecurityQuestionEndpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserSecurityQuestionAnswerController(ApplicationDbContext db) : ControllerBase
    {
        [HttpPost("create-answer/{userID}")]
        public async Task<ActionResult> CreateAnswer(int userID,[FromBody] ChangeSecurityQuestionRequest request,CancellationToken cancellationToken)
        {

            var user = await db.Users
                .FirstOrDefaultAsync(u => u.Id == userID);

            if (user == null) return BadRequest("User not found");


            var hashedAnswerWithSalt = GenerateHash(request.QuestionAnswer);


            var securityQuestionAnswer = new UserSecurityQuestionAnswer
            {
                SecurityQuestionId = request.SecurityQuestionId,
                AnswerSalt = hashedAnswerWithSalt.Item1,
                AnswerHash = hashedAnswerWithSalt.Item2,
                AnswerAttempts = 0,
                IsDisabled = false
            };

            db.UserSecurityQuestionAnswers.Add(securityQuestionAnswer);
            await db.SaveChangesAsync(cancellationToken);

            user.UserSecurityQuestionAnswerId = securityQuestionAnswer.Id;

            await db.SaveChangesAsync(cancellationToken);

            return Created();
        }


        [HttpGet("user-security/{useremail}")]
        public async Task<ActionResult> HasUserHaveQuestion(string useremail,CancellationToken cancellationToken)
        {
            var user = await db.Users
                .Include(u => u.UserSecurityQuestionAnswer)
                .FirstOrDefaultAsync(u => u.EmailAdress == useremail);

            if (user == null) return BadRequest();

            bool hasQuestion;

            if (user.UserSecurityQuestionAnswer != null)
                hasQuestion = true;
            else
                hasQuestion = false;

            return Ok(new { hasSecurityQuestion = hasQuestion, questionText=user?.UserSecurityQuestionAnswer?.SecurityQuestionId });
        }



        [HttpPost("submit-answer/{useremail}")]
        public async Task<ActionResult> SubmitAnswer(string useremail, [FromBody] UserSecurityQuestionAnswerDto request, CancellationToken cancellationToken)
        {
            var user = await db.Users
                .Include(u=>u.UserSecurityQuestionAnswer)
                .FirstOrDefaultAsync(u => u.EmailAdress == useremail );

            if (user == null) return BadRequest();

            var userAnswer = user.UserSecurityQuestionAnswer;

            if(userAnswer.IsDisabled && userAnswer.DisabledUntil>DateTime.Now)
            {
                return BadRequest("You cannot answer due to too many wrong answer attempts");
            }


            using var hmac = new HMACSHA256(userAnswer.AnswerSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.QuestionAnswer));


            for (var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != userAnswer.AnswerHash[i])
                {
                    user.UserSecurityQuestionAnswer.AnswerAttempts++;

                    if (userAnswer.AnswerAttempts % 3 == 0)
                    {
                        var disableTime = Math.Pow(3, (userAnswer.AnswerAttempts / 3) - 1);
                        userAnswer.DisabledUntil = DateTime.Now.AddMinutes(disableTime);
                        userAnswer.IsDisabled= true;
                        await db.SaveChangesAsync(cancellationToken);
                        return Unauthorized($"You cant answer again for {disableTime} min");
                    }

                    await db.SaveChangesAsync(cancellationToken);
                    return Unauthorized("Wrong answer");

                }
            }

            if (userAnswer.AnswerAttempts != 0)
            {
                userAnswer.AnswerAttempts = 0;
                userAnswer.IsDisabled = false;
                await db.SaveChangesAsync(cancellationToken);
            }

            return Ok(new { isAnswerGood=true });
        }


        [HttpPut("change-question/{userId}")]
        public async Task<ActionResult> ChangeSecurityQuestion(int userId, [FromBody] ChangeSecurityQuestionRequest request, CancellationToken cancellationToken)
        {
            var user = await db.Users
                    .Include(u => u.UserSecurityQuestionAnswer)
                    .FirstOrDefaultAsync(u => u.Id == userId,cancellationToken);

            if (!ComparePasswords(request.CurrentPassword, user.PasswordSalt, user.PasswordHash))
                return BadRequest("Invalid password");


            var hashedAnswerWithSalt = GenerateHash(request.QuestionAnswer);

            user.UserSecurityQuestionAnswer.SecurityQuestionId = request.SecurityQuestionId;
            user.UserSecurityQuestionAnswer.AnswerSalt = hashedAnswerWithSalt.Item1;
            user.UserSecurityQuestionAnswer.AnswerHash = hashedAnswerWithSalt.Item2;
            user.UserSecurityQuestionAnswer.AnswerAttempts = 0;
            user.UserSecurityQuestionAnswer.IsDisabled = false;

            await db.SaveChangesAsync(cancellationToken);

            return Created();

        }


        [HttpDelete("remove-securityQuestion/{userId}")]
        public async Task<ActionResult> RemoveSecurityQuestion(int userId, [FromBody] ChangeSecurityQuestionRequest request, CancellationToken cancellationToken)
        {
            var user = await db.Users
                    .Include(u => u.UserSecurityQuestionAnswer)
                    .FirstOrDefaultAsync(u => u.Id == userId,cancellationToken);
            if (user == null) return BadRequest("User not found");

            if (!ComparePasswords(request.CurrentPassword, user.PasswordSalt, user.PasswordHash))
                return BadRequest("Invalid credentials");

            if(user.UserSecurityQuestionAnswer.SecurityQuestionId!= request.SecurityQuestionId)
                return BadRequest("Invalid credentials");

            using var hmac = new HMACSHA256(user.UserSecurityQuestionAnswer.AnswerSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.QuestionAnswer));
            for (var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.UserSecurityQuestionAnswer.AnswerHash[i])
                    return BadRequest("Invalid credentials");
            }

            user.UserSecurityQuestionAnswerId = null;
            db.Users.Update(user);

            var userSecurityQuestion = user.UserSecurityQuestionAnswer;

            db.UserSecurityQuestionAnswers.Remove(userSecurityQuestion);

            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }


        private (byte[], byte[]) GenerateHash(string newPassword)
        {
            using var hmac = new HMACSHA256();

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(newPassword));
            var salt = hmac.Key;
            return (salt, computedHash);
        }


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






        public class ChangeSecurityQuestionRequest
        {
            [Required]
            public int SecurityQuestionId { get; set; }
            public SecurityQuestion? SecurityQuestion { get; set; }
            [Required]
            public string QuestionAnswer { get; set; }
            [Required]
            public string CurrentPassword { get; set; }
        }
    }
}
