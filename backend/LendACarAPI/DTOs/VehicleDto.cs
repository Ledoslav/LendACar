using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace LendACarAPI.DTOs
{
    public class VehicleDto
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }
        public float? EngineDisplacement { get; set; }
        public int? EnginePower { get; set; }

        [Required]
        public int TransmissionType { get; set; }

        [Required]
        public int FuelType { get; set; }

        [Required]
        public int AirConditioning { get; set; }

        public int NumberOfSeats { get; set; }
        public bool TowingHitch { get; set; }
        public string Description { get; set; }
        public int ProductionYear { get; set; }

        [Required]
        public bool Avaliable { get; set; }

        public double AverageRating { get; set; } = 0.0;

        [Required]
        public double PricePerDay { get; set; }

        [Required]
        public int VehicleModelID { get; set; }

        [ValidateNever]
        public VehicleModel VehicleModel { get; set; }

        [Required]
        public int VehicleCategoryID { get; set; }

        [ValidateNever]
        public VehicleCategory VehicleCategory { get; set; }

        [Required]
        public int UserID { get; set; }

        [ValidateNever]
        public DriversLicense DriversLicense { get; set; }

        [Required]
        public int CityID { get; set; }

        [ValidateNever]
        public City City { get; set; }

        public DateTime LastUpdated { get; set; }

        public List<VehicleImageDto> VehicleImages { get; set; } = new();
    }

    public class VehicleImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string? PublicId { get; set; }
    }
}
