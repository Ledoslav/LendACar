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
        public User? User { get; set; } 

        public string? RequestComment { get; set; } 



        public DateTime? RequestReviewDate { get; set; }
        public int? RequestStatus { get; set; } = 2; // 0 - odbijen, 1 - odobren, 2 - aktivan (ili drugi broj koji nije 0 ili 1)
        public string? DenialComment { get; set; } 

        public int? EmpAdmId { get; set; } // id uposlenika ili admina koji je odobrio/odbio zahtjev
        public bool? RevievedByAdmin { get; set; } = false; // biti ce true ukoliko je admin izvrsio pregled verifikacije

    }
}
