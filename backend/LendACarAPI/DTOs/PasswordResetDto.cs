using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class PasswordResetDto
    {
        [Required]
        public string? EmailAddress { get; set; }
        [Required]
        public string? CurrentPassword { get; set; }
        [Required]
        public string? NewPassword { get; set; }

        public string? ResetToken { get; set; }
    }
}
