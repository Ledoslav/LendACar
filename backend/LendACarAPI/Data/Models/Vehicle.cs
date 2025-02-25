using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LendACarAPI.Data.Models
{
    public class Vehicle
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        public float? EngineDisplacement { get; set; }
        public int? EnginePower { get; set; }
        [Required]
        public int TransmissionType { get; set; } // 0 - Manual, 1 - Automatic, 2 - AutomatedManual, 3 - DCT, 4 - CVT
        [Required]
        public int FuelType { get; set; } // 0 - Petrol , 1 - Diesel, 2 - Electric, 3 - Hybrid, 4 - LPG, 5 - CNG
        [Required]
        public int AirConditioning { get; set; } // 0 - None, 1 - Single-Zone, 2 - Double-Zone, 3 - Triple-Zone, 4 - Quad-Zone
        public int NumberOfSeats { get; set; }
        public bool TowingHitch { get; set; }
        public string Description { get; set; }
        public int ProductionYear {  get; set; }
        [Required]
        public bool Avaliable { get; set; } = false;
        public double AverageRating { get; set; } = 0.0;
        [Required]
        public double PricePerDay { get; set; }


        [ForeignKey(nameof(VehicleModel))]
        [Required]
        public int VehicleModelID { get; set; }
        public VehicleModel? VehicleModel { get; set; }

        [ForeignKey(nameof(VehicleCategory))]
        [Required]
        public int VehicleCategoryID { get; set; }
        public VehicleCategory? VehicleCategory { get; set; }


        [ForeignKey(nameof(User))]
        [Required]
        public int UserID { get; set; }
        public User? User { get; set; }


        [ForeignKey(nameof(City))]
        [Required]
        public int CityID { get; set; }
        public City? City { get; set; }

    }
}
