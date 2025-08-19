using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class Company
    {
        [Key]
        public int Id { get; set; }
        public byte[]? CompanyAvatar { get; set; }
        [Required]
        public string CompanyName { get; set; }
        [Required]
        [Phone]
        public string CompanyPhone { get; set; }
        [Required]
        public string CompanyDescription { get; set; }

        [EmailAddress]
        public string? CompanyEmail { get; set;}
        [Required]
        public string CompanyAddress { get; set; }

        public double AverageRating { get; set; } = 0.0;

        public byte[]? File { get; set; }

        public string FileName { get; set; }

        [ForeignKey(nameof(User))]
        public int UserId { get; set; }
        public User? User { get; set; } 

    }
}
