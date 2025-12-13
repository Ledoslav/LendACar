using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class AddVehicleModelRequest
    {
        public string ModelName { get; set; }
        public string BrandName { get; set; }
        public string? Icon { get; set; }
    }
}