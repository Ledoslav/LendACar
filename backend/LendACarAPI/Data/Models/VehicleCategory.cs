using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class VehicleCategory
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public string? Description { get; set; }

        //[Required]
        public byte[]? Icon { get; set; }

    }
}
