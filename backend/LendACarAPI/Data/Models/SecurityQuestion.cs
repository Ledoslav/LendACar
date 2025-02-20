using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class SecurityQuestion
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string QuestionText { get; set; }
    }
}
