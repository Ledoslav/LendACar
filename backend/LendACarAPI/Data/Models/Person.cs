using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{

    public abstract class Person
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string? FirstName { get; set; }
        [Required]
        public string? LastName { get; set; }
        [Required]
        [Phone]
        public string? PhoneNumber { get; set; }
        [Required]
        public DateTime BirthDate { get; set; }

        [ForeignKey(nameof(City))]
        [Required]
        public int CityId { get; set; }
        public City? City { get; set; }

        public string? ProfilePhotoUrl { get; set; }
        public string? ProfilePhotoPublicId { get; set; }

        public bool IsAdmin { get; set; }
        public bool IsEmployee { get; set; }
        public bool IsAppUser { get; set; }


    }
}
