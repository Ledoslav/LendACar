using LendACarAPI.Data.Models;
using System;
using Microsoft.AspNetCore.SignalR;
using LendACarAPI.Data;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    private readonly ApplicationDbContext _db;

    public ChatHub(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task SendMessage(int chatId, int senderId, string text)
    {
        var msg = new ChatMessage
        {
            ChatId = chatId,
            SenderId = senderId,
            Text = text,
            Timestamp = DateTime.Now
        };

        _db.ChatMessages.Add(msg);
        await _db.SaveChangesAsync();

        await Clients.Group(chatId.ToString())
            .SendAsync("ReceiveMessage", msg);
    }

    public async Task JoinChat(int chatId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, chatId.ToString());
    }

}
