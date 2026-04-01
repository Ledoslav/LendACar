// PollController.cs
using Azure.Core;
using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Hubs;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class PollController : ControllerBase
    {
        private readonly IHubContext<PollHub> _hubContext;
        private readonly ApplicationDbContext _db;
        private readonly IAuthService _authService;

        public PollController(IHubContext<PollHub> hubContext, ApplicationDbContext db, IAuthService authService)
        {
            _hubContext = hubContext;
            _db = db;
            _authService = authService;
        }

        [HttpGet]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> GetPolls() => Ok(await _db.Polls.ToListAsync());

        [HttpPost]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
        public async Task<IActionResult> CreatePoll([FromBody] Poll poll)
        {
            poll.IsClosed = false;
            poll.VotedUserIds = new List<int>();
            _db.Polls.Add(poll);
            await _db.SaveChangesAsync();
            return Ok(poll);
        }

        [HttpPost("{pollId}/close")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
        public async Task<IActionResult> ClosePoll(int pollId)
        {
            var poll = await _db.Polls.FirstOrDefaultAsync(p => p.Id == pollId);
            if (poll == null) return NotFound();

            poll.IsClosed = true;
            await _db.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveVoteUpdate", poll);
            return Ok(poll);
        }

        [HttpPost("{pollId}/vote")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> Vote(int pollId, [FromBody] string option)
        {
            // Extract userId from JWT token — never trust client-supplied identity
            var claims = _authService.GetAuthInfoFromRequest();
            if (claims == null)
                return Unauthorized();

            var userId = claims.UserId;

            if (string.IsNullOrEmpty(option))
            {
                return BadRequest("The option field is required.");
            }

            var poll = await _db.Polls.FirstOrDefaultAsync(p => p.Id == pollId);
            if (poll == null)
            {
                return NotFound();
            }

            if (poll.IsClosed)
            {
                return BadRequest("This poll is closed.");
            }

            // Admins and employees may vote multiple times (for testing purposes)
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            bool isPrivileged = user != null && (user.IsAdmin || user.IsEmployee);

            if (!isPrivileged && poll.VotedUserIds.Contains(userId))
            {
                return BadRequest("You have already voted on this poll.");
            }

            if (!poll.Options.Contains(option))
            {
                return BadRequest("Invalid option selected.");
            }

            if (poll.Votes.ContainsKey(option))
            {
                poll.Votes[option]++;
            }
            else
            {
                poll.Votes[option] = 1;
            }

            if (!isPrivileged)
            {
                poll.VotedUserIds.Add(userId);
            }

            _db.Polls.Update(poll);
            await _db.SaveChangesAsync();

            // Notify all clients about the updated poll
            await _hubContext.Clients.All.SendAsync("ReceiveVoteUpdate", poll);

            return Ok(poll);
        }
    }
}
