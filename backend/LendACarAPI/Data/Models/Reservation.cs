using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LendACarAPI.Data.Models;

public class Reservation
{
    [Key]
    public int Id { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public bool IsCashPayment {  get; set; }
    public decimal Price { get; set; }
    public DateTime PickUpDateTime { get; set; }
    public DateTime DropOffDateTime { get; set; }

    [ForeignKey(nameof(Renter))]
    [Required]
    public int RenterId { get; set; }
    public User? Renter { get; set; }

    [ForeignKey(nameof(Owner))]
    [Required]
    public int OwnerId { get; set; }
    public User? Owner { get; set; }

    [ForeignKey(nameof(Vehicle))]
    [Required]
    public int VehicleID { get; set; }
    public Vehicle? Vehicle { get; set; }

    [ForeignKey(nameof(PickUpCity))]
    [Required]
    public int PickUpCityID { get; set; }
    public City? PickUpCity { get; set; }

    [ForeignKey(nameof(DropOffCity))]
    [Required]
    public int DropOffCityID { get; set; }
    public City? DropOffCity { get; set; }

}

public enum ReservationStatus
{
    Pending,
    Approved,
    Rejected,
    Cancelled,
    Completed
}