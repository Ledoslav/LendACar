using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class CompanyEmployee
    {
        [Key]
        [ForeignKey(nameof(User))]
        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }
        [EmailAddress]
        public string? CompanyAdminEmail { get; set; }
        public DateTime BirthDate { get; set; }

        [ForeignKey(nameof(CompanyPosition))]
        [Required]
        public int CompanyPositionId { get; set; }
        public CompanyPosition? CompanyPosition { get; set; }

        [ForeignKey(nameof(Company))]
        [Required]
        public int CompanyId { get; set; }
        public Company Company { get; set; }

        [ForeignKey(nameof(WorkingHour))]
        public int WorkingHourId { get; set; }
        public WorkingHour? WorkingHour { get; set; }
    }
}
