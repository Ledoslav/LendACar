// CompanyCreateRequest.cs
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{
        public class CompanyUpdateRequest
        {
            public string CompanyName { get; set; }
            public string CompanyPhone { get; set; }
            public string CompanyDescription { get; set; }
            public string CompanyEmail { get; set; }
            public string CompanyAddress { get; set; }
            public IFormFile CompanyAvatar { get; set; } // Optional
            public IFormFile File { get; set; }
            public string FileName { get; set; }
    }
   
}
