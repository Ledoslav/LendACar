using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{

    public class User:Person
    {

        [Required]
        [EmailAddress]
        public string EmailAdress { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }
        [Required]
        public byte[] PasswordSalt { get; set; }

        [Required]
        public string Username { get; set; }
        public DateTime CreatedDate { get; set; }
        public double AverageRating { get; set; } = 0.0;
        [Required]
        public bool IsVerified { get; set; } = false;
        [Required]
        public bool IsBanned { get; set; } = false;

        public string? ResetPasswordToken { get; set; }
        public DateTime? ResetPasswordTokenExpiry { get; set; }


        [ForeignKey(nameof(UserSecurityQuestionAnswer))]
        public int? UserSecurityQuestionAnswerId { get; set; }
        public UserSecurityQuestionAnswer? UserSecurityQuestionAnswer { get; set; }


        // Najvjerovatnije cemo koristiti string sa URL-om koji prikazuje sliku vozacke dozvole
        public DriversLicense DriversLicense { get; set; }

    }
}
