using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
        public class ChatMessage
        {
            public int Id { get; set; }
            public int ChatId { get; set; }
            public int SenderId { get; set; }
            public string Text { get; set; } = "";
            public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        }

        public class Chat
        {
            public int Id { get; set; }
            public int DealerId { get; set; }
            public int CustomerId { get; set; }
            public string CustomerName { get; set; } = "";
            public string DealerName { get; set; } = "";
            public string Vehicle { get; set; } = "";
            public int VehicleId { get; set; }
            public string? DealerAvatar { get; set; } = "";
            public string? CustomerAvatar { get; set; } = "";

        public List<ChatMessage> Messages { get; set; } = new();
        }
    }
