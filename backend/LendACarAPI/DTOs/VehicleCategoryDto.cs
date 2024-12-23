using LendACarAPI.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class VehicleCategoryDto
    {
        public int Id { get; set; }

        [Required]
        public string? Name { get; set; }

        [Required]
        public string? Description { get; set; }

        //[Required]
        public byte[]? Icon { get; set; }

    }
}
