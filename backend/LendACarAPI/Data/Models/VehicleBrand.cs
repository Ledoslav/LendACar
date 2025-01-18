using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class VehicleBrand
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string BrandName { get; set; }

        // Potrebno dodati sliku sa logotipom brenda 
        public byte[]? Icon { get; set; }
    }
}
