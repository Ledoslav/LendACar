using LendACarAPI.Data.Models;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LendACarAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly SymmetricSecurityKey _key;
        private  IHttpContextAccessor _httpContextAccessor;

        public AuthService(IConfiguration config, IHttpContextAccessor httpContextAccessor)
        {
            var jwtSecret = config["JWTSecretKey"];
            if (string.IsNullOrEmpty(jwtSecret))
                throw new Exception("JWTSecretKey is missing from configuration.");
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            _httpContextAccessor = httpContextAccessor;
        }


        

        public string CreatToken(Person person)
        {
           var claims=new List<Claim> 
           {
                new Claim("userId",person.Id.ToString()),
                new Claim("isAdmin",person.IsAdmin.ToString(),ClaimValueTypes.Boolean),
                new Claim("isEmployee",person.IsEmployee.ToString(),ClaimValueTypes.Boolean),
                new Claim("isAppUser",person.IsAppUser.ToString(),ClaimValueTypes.Boolean),
                new Claim("isLoggedIn",true.ToString(),ClaimValueTypes.Boolean),
           };

            var creds=new SigningCredentials(_key,SecurityAlgorithms.HmacSha256Signature);

            var jwt = new JwtSecurityToken(
                signingCredentials: creds,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(15),
                notBefore:DateTime.UtcNow
                );

            var tokenHandler = new JwtSecurityTokenHandler();

            return tokenHandler.WriteToken(jwt);
        }

        public AuthClaims? GetAuthInfoFromRequest()
        {
            string? token = _httpContextAccessor.HttpContext?.Request.Headers["my-auth-token"];

            return ValidateToken(token);
        }

        public AuthClaims? ValidateToken(string? token)
        {
            if (string.IsNullOrWhiteSpace(token)) return null;

            if (token.StartsWith("Bearer"))
            {
                token = token.Substring(6).Trim();
            }

            SecurityToken securityToken;

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = _key,
                    ValidateLifetime = true,
                    ValidateAudience = false,
                    ValidateIssuer = false,
                    ClockSkew = TimeSpan.Zero
                };

                tokenHandler.ValidateToken(token, validationParameters, out securityToken);

                if (securityToken != null)
                {
                    var tokenObject = tokenHandler.ReadJwtToken(token);
                    var authClaims = ClaimsToAuthClaims(tokenObject.Claims);
                    return authClaims;
                }
                else return null;
            }
            catch (SecurityTokenException ex)
            {
                return null;
            }

            catch
            {
                throw;
            }
        }


        private AuthClaims ClaimsToAuthClaims(IEnumerable<Claim> claims)
        {
            var authclaims=new AuthClaims();

            foreach (var claim in claims)
            {
                switch (claim.Type)
                {
                    case "userId":
                        authclaims.UserId = int.TryParse(claim.Value, out var userId) ? userId : 0;
                        break;
                    case "isAdmin":
                        authclaims.IsAdmin = bool.TryParse(claim.Value, out var isAdmin) && isAdmin;
                        break;
                    case "isEmployee":
                        authclaims.IsEmployee = bool.TryParse(claim.Value, out var isEmployee) && isEmployee;
                        break;
                    case "isLoggedIn":
                        authclaims.IsLoggedIn = bool.TryParse(claim.Value, out var isLoggedIn) && isLoggedIn;
                        break;
                    case "isAppUser":
                        authclaims.IsAppUser = bool.TryParse(claim.Value, out var isAppUser) && isAppUser;
                        break;
                }
            }

            return authclaims;

        }

    }


    public class AuthClaims()
    { 
        public int UserId { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsEmployee { get; set; }
        public bool IsLoggedIn { get; set; }
        public bool IsAppUser { get; set; }
    }

}
