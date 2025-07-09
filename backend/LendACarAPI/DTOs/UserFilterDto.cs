using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.DTOs
{
    public class UserFilterDto
    {
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 50 characters.")]
        [RegularExpression(@"^[\w\s\-]+$", ErrorMessage = "Only letters, numbers, spaces, and - allowed.")]
        public string? Name { get; set; }
        public int? AgeFrom { get; set; }
        public int? AgeTo { get; set; }
        public int? CityId { get; set; }
        public int? CountryId { get; set; }
        public bool? IsVerified { get; set; }
    }
}
