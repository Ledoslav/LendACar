using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class Bookmark
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public int VehicleId { get; set; }

        // Optional: track when the bookmark was created
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    }
}
