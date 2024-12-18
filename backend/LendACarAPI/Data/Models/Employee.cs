using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LendACarAPI.Data.Models
{

    public class Employee:Person
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

        [Required]
        public DateOnly DateOfHire { get; set; }

        public string? JobTitle { get; set; }

        [ForeignKey(nameof(WorkingHour))]
        public int WorkingHourId { get; set; }
        public WorkingHour? WorkingHour { get; set; }

    }
}
