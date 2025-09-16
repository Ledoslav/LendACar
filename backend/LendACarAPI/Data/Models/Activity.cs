using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class Activity
    {
        [Key]
        public int Id { get; set; }
        public string? Description { get; set; }
        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        public int Variant { get; set; }
        public DateTime? DateOfActivity { get; set; }
    }
}
