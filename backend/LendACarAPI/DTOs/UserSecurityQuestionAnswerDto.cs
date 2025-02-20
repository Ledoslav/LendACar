using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class UserSecurityQuestionAnswerDto
    {
        public int? Id { get; set; }

        [Required]
        public int SecurityQuestionId { get; set; }
        public SecurityQuestion? SecurityQuestion { get; set; }

        [Required]
        public string QuestionAnswer { get; set; }

        public int? AnswerAttempts { get; set; }
        public bool? IsDisabled { get; set; }
        public DateTime? DisabledUntil { get; set; }
    }
}
