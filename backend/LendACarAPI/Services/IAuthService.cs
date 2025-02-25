using LendACarAPI.Data.Models;
using System.Security.Claims;

namespace LendACarAPI.Services
{
    public interface IAuthService
    {
        public string CreatToken(Person person);
        public AuthClaims? GetAuthInfoFromRequest();
        public AuthClaims? ValidateToken(string? token);
    }
}
