using LendACarAPI.Data.Models;

namespace LendACarAPI.DTOs
{
    public class UserBasicInfoDto
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public string? EmailAddress { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
