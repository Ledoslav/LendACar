using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "First name is required.")]
        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters.")]
        public string? FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters.")]
        public string? LastName { get; set; }

        [Required(ErrorMessage = "Phone number is required.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        public string? PhoneNumber { get; set; }

        [Required(ErrorMessage = "Birth date is required.")]
        [StringLength(10, ErrorMessage = "Birth date must be in the format YYYY-MM-DD.")]
        public string BirthDate { get; set; }

        [Required(ErrorMessage = "City is required.")]
        public int CityId { get; set; }
        public City? City { get; set; }

        public int? CountryId { get; set; }

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(100, ErrorMessage = "Email address cannot exceed 100 characters.")]
        public string? EmailAddress { get; set; }

        [Required(ErrorMessage = "Username is required.")]
        [StringLength(30, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 30 characters.")]
        public string? Username { get; set; }
        public double AverageRating { get; set; } = 0.0;
        public bool IsVerified { get; set; }

        public string? Token { get; set; }

        public string? ProfilePhotoUrl { get; set; }

        public bool isUserVerifiedStatusChanged { get; set; }

        public int? UserSecurityQuestionAnswerId { get; set; }
        public UserSecurityQuestionAnswer? SecurityQuestion { get; set; }
    }
}
