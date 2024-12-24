namespace LendACarAPI.DTOs
{
    public class UserFilterDto
    {
        public string? Name { get; set; }
        public int? AgeFrom { get; set; }
        public int? AgeTo { get; set; }
        public int? CityId { get; set; }
        public int? CountryId { get; set; }
        public bool? IsVerified { get; set; }
    }
}
