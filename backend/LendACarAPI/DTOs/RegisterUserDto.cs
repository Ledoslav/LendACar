using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class RegisterUserDto
    {
        [Required(ErrorMessage = "First name is required.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "First name must be between 2 and 50 characters.")]
        public string? FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Last name must be between 2 and 50 characters.")]
        public string? LastName { get; set; }

        [Required(ErrorMessage = "Phone number is required.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        public string? PhoneNumber { get; set; }

        [Required(ErrorMessage = "Birth date is required.")]
        [StringLength(10, MinimumLength = 10, ErrorMessage = "Birth date must be in the format YYYY-MM-DD.")]
        public string BirthDate { get; set; }

        [Required(ErrorMessage = "City is required.")]
        public int CityId { get; set; }

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(100, ErrorMessage = "Email address cannot exceed 100 characters.")]
        public string? EmailAdress { get; set; }

        [Required(ErrorMessage = "Username is required.")]
        [StringLength(30, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 30 characters.")]
        public string? Username { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters.")]
        public string? Password { get; set; }
        public bool IsVerified { get; set; }

        public int? SecurityQuestionId { get; set; }
        public SecurityQuestion? SecurityQuestion { get; set; }
        public string? QuestionAnswer { get; set; }
    }
}
