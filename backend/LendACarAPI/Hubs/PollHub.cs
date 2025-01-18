using Microsoft.EntityFrameworkCore;
using LendACarAPI.Data.Models;
using Microsoft.AspNetCore.SignalR;

namespace LendACarAPI.Hubs;


public class PollHub : Hub
{
    public async Task BroadcastVoteUpdate(Poll poll)
    {
        await Clients.All.SendAsync("ReceiveVoteUpdate", poll);
    }
}
