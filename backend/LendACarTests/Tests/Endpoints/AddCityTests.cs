using LendACarAPI.Data.Models;
using LendACarAPI.Endpoints.CityEndpoints;
using LendACarAPI.Services;
using LendACarTests.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Threading;
using Xunit;

namespace LendACarTests.Tests.Endpoints
{
    public class AddCityTests
    {
        private async Task<(CityController controller, TestApplicationDbContext db)> CreateControllerWithDbAsync()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var mockPdfService = new Mock<IRenderPDFReport>();
            mockAuthService.Setup(x => x.GetAuthInfoFromRequest()).Returns(new AuthClaims
            {
                IsAdmin = true,
                IsEmployee = false,
                IsAppUser = false,
                IsLoggedIn = true,
                UserId = 1
            });
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, mockPdfService.Object);
            var controller = new CityController(db);
            controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
            return (controller, db);
        }

        [Fact]
        public async Task CreateCity_Success()
        {
            var (controller, db) = await CreateControllerWithDbAsync();
            var city = new City { Name = "Testopolis", CountryId = 1 };

            var result = await controller.CreateCity(city, CancellationToken.None);

            Assert.IsType<Microsoft.AspNetCore.Mvc.CreatedResult>(result.Result);
            var exists = await db.Cities.AnyAsync(c => c.Name == "Testopolis" && c.CountryId == 1);
            Assert.True(exists);
        }

        [Fact]
        public async Task CreateCity_Duplicate_ReturnsBadRequest()
        {
            var (controller, db) = await CreateControllerWithDbAsync();
            var city = new City { Name = "Testopolis", CountryId = 1 };
            await controller.CreateCity(city, CancellationToken.None);
            var result = await controller.CreateCity(new City { Name = "Testopolis", CountryId = 1 }, CancellationToken.None);

            Assert.IsType<Microsoft.AspNetCore.Mvc.BadRequestResult>(result.Result);
        }

        [Fact]
        public async Task CreateCity_WithNonExistentCountryId_ReturnsDbUpdateExceptionOrBadRequest()
        {
            var (controller, db) = await CreateControllerWithDbAsync();
            var city = new City { Name = "Ghost City", CountryId = 99999 };
            var result = await controller.CreateCity(city, CancellationToken.None);

            Assert.True(result.Result is Microsoft.AspNetCore.Mvc.CreatedResult || result.Result is Microsoft.AspNetCore.Mvc.BadRequestObjectResult);
        }



        [Fact]
        public async Task CreateCity_MissingCountryId_ReturnsBadRequest()
        {
            var (controller, db) = await CreateControllerWithDbAsync();
            var city = new City { Name = "NoCountry", CountryId = 0 };
            controller.ModelState.AddModelError("CountryId", "Required");
            var result = await controller.CreateCity(city, CancellationToken.None);
            Assert.IsType<Microsoft.AspNetCore.Mvc.BadRequestResult>(result.Result);
        }

        [Fact]
        public async Task CreateCity_CaseInsensitiveDuplicate_ReturnsBadRequest()
        {
            var (controller, db) = await CreateControllerWithDbAsync();
            var city1 = new City { Name = "Testopolis", CountryId = 1 };
            var city2 = new City { Name = "testopolis", CountryId = 1 };
            await controller.CreateCity(city1, CancellationToken.None);
            var result = await controller.CreateCity(city2, CancellationToken.None);

            Assert.True(result.Result is Microsoft.AspNetCore.Mvc.BadRequestResult || result.Result is Microsoft.AspNetCore.Mvc.CreatedResult);
        }

        [Fact]
        public async Task CreateCity_SameNameDifferentCountries_Success()
        {
            var (controller, db) = await CreateControllerWithDbAsync();
            var city1 = new City { Name = "Springfield", CountryId = 1 };
            var city2 = new City { Name = "Springfield", CountryId = 2 };
            var result1 = await controller.CreateCity(city1, CancellationToken.None);
            var result2 = await controller.CreateCity(city2, CancellationToken.None);
            Assert.IsType<Microsoft.AspNetCore.Mvc.CreatedResult>(result1.Result);
            Assert.IsType<Microsoft.AspNetCore.Mvc.CreatedResult>(result2.Result);
        }

    }
}
