using LendACarAPI.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using LendACarAPI.Hubs;
using LendACarAPI.Data;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ApplicationDbContext _db;

        public ChatController(IHubContext<ChatHub> hubContext, ApplicationDbContext db)
        {
            _hubContext = hubContext;
            _db = db;
        }

        // GET: api/chat?userId=123
        [HttpGet]
        public async Task<IActionResult> GetUserChats([FromQuery] int userId)
        {
            var chats = await _db.Chats
                .Include(c => c.Messages)
                .Where(c => c.DealerId == userId || c.CustomerId == userId)
                .ToListAsync();

            return Ok(chats);
        }

        // GET: api/chat/5/messages
        [HttpGet("{chatId}/messages")]
        public async Task<IActionResult> GetMessages(int chatId)
        {
            var chat = await _db.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == chatId);

            if (chat == null)
                return Ok(new List<ChatMessage>());

            return Ok(chat.Messages.OrderBy(m => m.Timestamp));
        }

        // POST: api/chat/start
        [HttpPost("start")]
        public async Task<IActionResult> StartChat([FromBody] StartChatDto dto)
        {
            var existing = await _db.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c =>
                    (c.DealerId == dto.DealerId && c.CustomerId == dto.CustomerId ||
                     c.DealerId == dto.CustomerId && c.CustomerId == dto.DealerId)
                    && c.Vehicle == dto.Vehicle
                );

            if (existing != null) return Ok(existing);

            var chat = new Chat
            {
                DealerId = dto.DealerId,
                CustomerId = dto.CustomerId,
                DealerName = dto.DealerName,
                DealerAvatar = dto.DealerAvatar,
                CustomerName = dto.CustomerName,
                CustomerAvatar = dto.CustomerAvatar,
                VehicleId = dto.VehicleId,
                Vehicle = dto.Vehicle
            };

            _db.Chats.Add(chat);
            await _db.SaveChangesAsync();

            return Ok(chat);
        }

        // POST: api/chat/send
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessage message)
        {
            var chat = await _db.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == message.ChatId);

            if (chat == null)
                return Ok(new { success = false });

            message.Timestamp = DateTime.UtcNow;
            chat.Messages.Add(message);
            await _db.SaveChangesAsync();

            // IMPORTANT: senderId must be sent!
            await _hubContext.Clients.Group($"chat-{message.ChatId}")
                .SendAsync("ReceiveMessage", new
                {
                    chatId = message.ChatId,
                    senderId = message.SenderId,
                    text = message.Text,
                    timestamp = message.Timestamp
                });

            return Ok(message);
        }

        // DELETE: api/chat/5
        [HttpDelete("{chatId}")]
        public async Task<IActionResult> DeleteChat(int chatId)
        {
            var chat = await _db.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == chatId);

            if (chat == null)
                return NotFound();

            _db.ChatMessages.RemoveRange(chat.Messages);
            _db.Chats.Remove(chat);

            await _db.SaveChangesAsync();

            return Ok(new { success = true });
        }

    }


    public class StartChatDto
    {
        public int DealerId { get; set; }
        public int CustomerId { get; set; }

        public string DealerName { get; set; } = "";
        public string CustomerName { get; set; } = "";

        public string? DealerAvatar { get; set; } = "";
        public string? CustomerAvatar { get; set; } = "";

        public string Vehicle { get; set; } = "";
        public int VehicleId { get; set; }
    }
}
