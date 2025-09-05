using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LendACarAPI.DTOs
{
    public class ReservationDto
    {
        public int Id { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
        public bool IsCashPayment { get; set; }
        public decimal Price { get; set; }
        public DateTime PickUpDateTime { get; set; }
        public DateTime DropOffDateTime { get; set; }

        [Required]
        public int RenterId { get; set; }
        public User? Renter { get; set; }

        [Required]
        public int OwnerId { get; set; }
        public User? Owner { get; set; }

        [Required]
        public int VehicleID { get; set; }
        public Vehicle? Vehicle { get; set; }

        [Required]
        public int PickUpCityID { get; set; }
        public City? PickUpCity { get; set; }

        [Required]
        public int DropOffCityID { get; set; }
        public City? DropOffCity { get; set; }

    }
}

public class UpdateReservationStatusDto
{
    public ReservationStatus Status { get; set; }
}

