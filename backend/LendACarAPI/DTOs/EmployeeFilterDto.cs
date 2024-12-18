namespace LendACarAPI.DTOs
{
    public class EmployeeFilterDto
    {
        public string? Name { get; set; }
        public int? AgeFrom { get; set; }
        public int? AgeTo { get; set; }
        public int? CityId { get; set; }
        public string? JobTitle { get; set; }
    }
}
