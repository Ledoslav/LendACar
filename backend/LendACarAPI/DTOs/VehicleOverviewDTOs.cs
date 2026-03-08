using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class VehicleOverviewDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string OwnerName { get; set; }
        public string BrandName { get; set; }
        public string CityName { get; set; }
        public string CategoryName { get; set; }
        public int FuelType { get; set; } // 0 - Petrol , 1 - Diesel, 2 - Electric, 3 - Hybrid, 4 - LPG, 5 - CNG
        public int TransmissionType { get; set; } // 0 - Manual, 1 - Automatic, 2 - Automated Manual, 3 - DCT, 4 - CVT
        public double PricePerDay { get; set; }
        public int ReservationsCount { get; set; }
    }

    public class VehicleOverviewFilterOptionsDto
    {
        public List<FilterOptionDto> Owners { get; set; } = new();
        public List<FilterOptionDto> Brands { get; set; } = new();
        public List<FilterOptionDto> Cities { get; set; } = new();
        public List<FilterOptionDto> Categories { get; set; } = new();
    }

    public class FilterOptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class VehicleOverviewPagingRequest
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }
        public int? OwnerId { get; set; }
        public int? BrandId { get; set; }
        public int? CityId { get; set; }
        public int? CategoryId { get; set; }
        public int? FuelType { get; set; }
        public string? SortOrder { get; set; } // price_asc, price_desc, res_asc, res_desc, newest, oldest
    }
}
