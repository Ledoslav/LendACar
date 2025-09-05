using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LendACarAPI.DTOs
{
    public class ReservationCreateDto
    {   
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
        public bool IsCashPayment { get; set; }
        public decimal Price { get; set; }
        public DateTime PickUpDateTime { get; set; }
        public DateTime DropOffDateTime { get; set; }

        [Required]
        public int RenterId { get; set; }

        [Required]
        public int OwnerId { get; set; }

        [Required]
        public int VehicleID { get; set; }

        [Required]
        public int PickUpCityID { get; set; }

        [Required]
        public int DropOffCityID { get; set; }

    }
}
