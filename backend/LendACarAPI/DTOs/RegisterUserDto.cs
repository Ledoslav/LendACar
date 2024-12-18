using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class RegisterUserDto
    {
        [Required]
        public string? FirstName { get; set; }

        [Required]
        public string? LastName { get; set; }

        [Required]
        [Phone]
        public string? PhoneNumber { get; set; }

        [Required]
        public string BirthDate { get; set; }

        public int CityId { get; set; }

        [Required]
        [EmailAddress]
        public string? EmailAdress { get; set; }

        [Required]
        public string? Username { get; set; }

        [Required]
        public string? Password { get; set; }
        public bool IsVerified { get; set; }
    }
}
