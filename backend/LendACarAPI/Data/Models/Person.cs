using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{

    //TO DO:
    //Napraviti Address objekat i dodati ti ga u Person
    // Address bi mogao sadrzati grad pa onda na frontendu display to sve zajedno ali kada se profi pravi da bude odvojeno 
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


        public int GetAge()
        {
            var today = DateTime.Today;

            var age = today.Year - BirthDate.Year;

            if (BirthDate.Date > today.AddYears(-age))
            {
                age--;
            }

            return age;
        }

    }
}
