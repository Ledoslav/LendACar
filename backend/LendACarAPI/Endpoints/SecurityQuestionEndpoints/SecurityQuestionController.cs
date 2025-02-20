using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Endpoints.SecurityQuestionEndpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class SecurityQuestionController(ApplicationDbContext db) : ControllerBase
    {
        [HttpGet("get-all-questions")]
        public async Task<ActionResult> GetAllSecurityQuestions(CancellationToken cancellationToken)
        {
            var questions = await db.SecurityQuestions.ToArrayAsync(cancellationToken);
            if (questions.Length < 1) return BadRequest("There is no security questions");

            return Ok(questions);
        }

        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        [HttpPost("create-securityQuestion")]
        public async Task<ActionResult> AddSecurityQuestion([FromBody] SecurityQuestionRequest request, CancellationToken cancellationToken)
        {
            var securityQuestion = new SecurityQuestion
            {
                QuestionText = request.SecurityQuestionText
            };

            db.SecurityQuestions.Add(securityQuestion);

            await db.SaveChangesAsync(cancellationToken);

            return Created();
        }

        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        [HttpPut("update-securityQuestion/{id}")]
        public async Task<ActionResult> UpdateSecurityQuestion(int id, [FromBody] SecurityQuestionRequest request, CancellationToken cancellationToken)
        {
            var question = await db.SecurityQuestions.FirstOrDefaultAsync(x => x.Id == id);

            if (question == null) return NotFound("Quesiton not found");

            question.QuestionText = request.SecurityQuestionText;

            await db.SaveChangesAsync(cancellationToken);

            return Ok("Question updated successfully");
        }

        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        [HttpDelete("delete-securityQuestion/{id}")]
        public async Task<ActionResult> DeleteSecurityQuestion(int id, CancellationToken cancellationToken)
        {
            var question = await db.SecurityQuestions.FirstOrDefaultAsync(x => x.Id == id);

            if (question == null) return NotFound("Quesiton not found");

            db.Remove(question);

            await db.SaveChangesAsync(cancellationToken);

            return Ok("Question removed successfully");
        }

    }

    public class SecurityQuestionRequest
    {
        [Required]
        public string SecurityQuestionText { get; set; }
    }
}
