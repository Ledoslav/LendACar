using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LendACarAPI.Data.Models
{
    public class UserSecurityQuestionAnswer
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey(nameof(SecurityQuestion))]
        public int SecurityQuestionId { get; set; }
        public SecurityQuestion? SecurityQuestion { get; set; }

        [Required]
        public byte[] AnswerHash { get; set; }
        [Required]
        public byte[] AnswerSalt { get; set; }

        public int AnswerAttempts { get; set; }  
        public bool IsDisabled { get; set; }  
        public DateTime? DisabledUntil { get; set; }  
    }
}
