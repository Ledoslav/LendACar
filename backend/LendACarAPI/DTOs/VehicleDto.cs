using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        public string TransmissionType { get; set; }
        [Required]
        public string FuelType { get; set; }
        [Required]
        public string AirConditioning { get; set; }
        public int NumberOfSeats { get; set; }
        public bool TowingHitch { get; set; }
        public int? MaximumLoad { get; set; }
        public string Description { get; set; }
        [Required]
        public bool Avaliable { get; set; } = false;
        public double AverageRating { get; set; } = 0.0;
        [Required]
        public double PricePerDay { get; set; }

        [Required]
        public int VehicleModelID { get; set; }
        public VehicleModel VehicleModel { get; set; }

        [Required]
        public int VehicleCategoryID { get; set; }
        public VehicleCategory VehicleCategory { get; set; }

        [Required]
        public int UserID { get; set; }
        public User User { get; set; }

        [Required]
        public int CityID { get; set; }
        public City City { get; set; }

    }
}
