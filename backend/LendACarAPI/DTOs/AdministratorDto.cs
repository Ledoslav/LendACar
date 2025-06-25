using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class AdministratorDto
    {
        public int Id { get; set; }

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
        [StringLength(10, MinimumLength = 10, ErrorMessage = "Birth date must be in YYYY-MM-DD format.")]
        public string BirthDate { get; set; }

        [Required(ErrorMessage = "City is required.")]
        public int CityId { get; set; }
        public City? City { get; set; }

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(100, ErrorMessage = "Email address cannot exceed 100 characters.")]
        public string? EmailAddress { get; set; }

        [Required(ErrorMessage = "Username is required.")]
        [StringLength(30, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 30 characters.")]
        public string? Username { get; set; }

        public string? Token { get; set; }
    }
}
