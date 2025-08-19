// CompanyCreateRequest.cs
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
    public class CompanyCreateRequest
    {
        [Required]
        public string CompanyName { get; set; }

        [Required]
        [Phone]
        public string CompanyPhone { get; set; }

        [Required]
        public string CompanyDescription { get; set; }

        [EmailAddress]
        public string? CompanyEmail { get; set; }

        [Required]
        public string CompanyAddress { get; set; }

        [Required]
        public int UserId { get; set; }

        public IFormFile CompanyAvatar { get; set; } // File upload for company avatar (optional)

        public IFormFile File { get; set; }
        public string FileName { get; set; }

    }
}
