using Azure.Core;
using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Linq;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class PollController : ControllerBase
    {
        private static readonly List<Poll> Polls = new();
        private readonly IHubContext<PollHub> _hubContext; // SignalR context to broadcast updates

        public PollController(IHubContext<PollHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpGet]
        public IActionResult GetPolls() => Ok(Polls);

        [HttpPost]
        public IActionResult CreatePoll([FromBody] Poll poll)
        {
            poll.Id = Polls.Count + 1;
            Polls.Add(poll);
            return Ok(poll);
        }

        [HttpPost("{pollId}/vote")]
        public IActionResult Vote(int pollId, [FromBody] string option)
        {
            if (string.IsNullOrEmpty(option))
            {
                return BadRequest("The option field is required.");
            }

            var poll = Polls.FirstOrDefault(p => p.Id == pollId);
            if (poll == null)
            {
                return NotFound();
            }

            if (!poll.Options.Contains(option))  // Ensure the option is valid
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

            // Notify all clients about the updated poll
            _hubContext.Clients.All.SendAsync("ReceiveVoteUpdate", poll);

            return Ok(poll);
        }
    }
}
