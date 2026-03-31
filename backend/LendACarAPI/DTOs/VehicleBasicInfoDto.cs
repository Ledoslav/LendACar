using LendACarAPI.Data.Models;
using System.Collections.Generic;

namespace LendACarAPI.DTOs
{
    public class VehicleBasicInfoDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public double PricePerDay { get; set; }
        public float? EngineDisplacement { get; set; }
        public int? EnginePower { get; set; }
        public int TransmissionType { get; set; }
        public int FuelType { get; set; }
        public int AirConditioning { get; set; }
        public int NumberOfSeats { get; set; }
        public bool TowingHitch { get; set; }
        public string Description { get; set; }
        public int ProductionYear { get; set; }
        public bool Avaliable { get; set; }
        public double AverageRating { get; set; }
        public System.DateTime LastUpdated { get; set; }
        
        public int VehicleModelID { get; set; }
        public VehicleModel VehicleModel { get; set; }
        
        public int VehicleCategoryID { get; set; }
        public VehicleCategory VehicleCategory { get; set; }

        public int CityID { get; set; }
        public City City { get; set; }

        public int UserID { get; set; }
        public UserBasicInfoDto? User { get; set; }
        
        public List<VehicleImageDto> VehicleImages { get; set; } = new();
    }
}
