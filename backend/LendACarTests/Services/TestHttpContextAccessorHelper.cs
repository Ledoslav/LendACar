using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using LendACarAPI.Data.Models;

namespace LendACarTests.Services
{
    public static class TestHttpContextAccessorHelper
    {
        public const string AuthHeaderName = "my-auth-token";

        private static string JwtSecretKey = "test-secret-key-12345678901234567890123456789012";


        public static string GenerateValidJwtToken(Person person)
        {
            string test = Environment.GetEnvironmentVariable("JWTSecretKey");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);
            var claims = new List<Claim>
            {
                new Claim("userId", person.Id.ToString()),
                new Claim("isAdmin", person.IsAdmin.ToString(), ClaimValueTypes.Boolean),
                new Claim("isEmployee", person.IsEmployee.ToString(), ClaimValueTypes.Boolean),
                new Claim("isAppUser", person.IsAppUser.ToString(), ClaimValueTypes.Boolean),
                new Claim("isLoggedIn", true.ToString(), ClaimValueTypes.Boolean),
            };
            var jwt = new JwtSecurityToken(
                signingCredentials: creds,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(15),
                notBefore: DateTime.UtcNow
            );
            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.WriteToken(jwt);
        }

        public static string GenerateInvalidJwtToken()
        {
            return "invalid.jwt.token";
        }

        public static IHttpContextAccessor CreateWithValidAuthToken(Person person)
        {
            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            var token = GenerateValidJwtToken(person);
            context.Request.Headers[AuthHeaderName] = token;
            mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(context);
            return mockHttpContextAccessor.Object;
        }

        public static IHttpContextAccessor CreateWithInvalidAuthToken()
        {
            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            var token = GenerateInvalidJwtToken();
            context.Request.Headers[AuthHeaderName] = token;
            mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(context);
            return mockHttpContextAccessor.Object;
        }
    }
} 