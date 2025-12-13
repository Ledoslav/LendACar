using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class UpdateVehicleRequest
    {
        public string ModelName { get; set; }
        public string newModelName { get; set; }
        public string BrandName {  get; set; }
        public string newBrandName { get; set; }
        public string? Icon { get; set; }
    }
}