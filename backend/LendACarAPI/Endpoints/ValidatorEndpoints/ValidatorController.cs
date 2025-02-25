using LendACarAPI.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LendACarAPI.Endpoints.ValidatorEndpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValidatorController(ApplicationDbContext db) : ControllerBase
    {
        [HttpPost("check-username")]
        public async Task<ActionResult> ValidateAppUsersUsername([FromBody] UserNameValidationRequest request,CancellationToken cancellationToken )
        {
            bool isTaken = await db.Users.AnyAsync(u=>u.Username.ToLower()==request.Username.ToLower(),cancellationToken);

            return Ok(new { isTaken });
        }
    }

    public class UserNameValidationRequest
    {
        public  string Username { get; set; }
    }

}

