using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{


    public class VerificationRequest
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public DateTime RequestDate { get; set; } 


        [ForeignKey(nameof(User))]
        [Required]
        public int UserId { get; set; }
        public User? User { get; set; } // korisnik koji salje zahtjev

        public string? RequestComment { get; set; } // mogucnost korisniku da ostavi komentar koji ce biti vidljiv uposleniku



        public DateTime? RequestReviewDate { get; set; } // datum kada je uposlenik pregledao zahtjev
        public bool? IsApproved { get; set; } // ukoliko je null znaci da zahtjev jos nije pregledan, ako je true znaci da je odobren, ukoliko je false znaci da je odbijen
        public string? DenialComment { get; set; } // ovdje uposlenik moze navesti razlog zasto je odbio zahtjev

        [ForeignKey(nameof(Employee))]
        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; } // uposlenik koji je odobrio/odbio zahtjev, biti ce null dok zahtjev nije odobren/odbijen

    }
}
