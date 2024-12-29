using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LendACarAPI.DTOs
{
    public class VerificationDto
    {
        public int Id { get; set; }
        [Required]
        public DateTime RequestDate { get; set; }

        [Required]
        public int UserId { get; set; }

        public string? RequestComment { get; set; }


        public DateTime? RequestReviewDate { get; set; }
        public int? RequestStatus { get; set; } // 0 - odbijen, 1 - odobren, 2 - aktivan (ili drugi broj koji nije 0 ili 1)
        public string? DenialComment { get; set; }

        public int? EmpAdmId { get; set; }
        public bool? RevievedByAdmin { get; set; }

    }
}
