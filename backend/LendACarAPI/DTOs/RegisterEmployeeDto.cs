using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class RegisterEmployeeDto
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
        public string? EmailAddress { get; set; }

        [Required]
        public string? Username { get; set; }

        [Required]
        public string? Password { get; set; }

        public string? JobTitle { get; set; }

        public int WorkingHourId { get; set; }

        public DateOnly DateOfHire { get; set; }

    }
}
