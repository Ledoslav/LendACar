using LendACarAPI.Data.Models;
using LendACarAPI.Endpoints;
using LendACarTests.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using System.Threading.Tasks;
using LendACarAPI.Services;

namespace LendACarTests.Tests.Endpoints
{
    public class CompanyControllerTests
    {
        private async Task<(CompanyController controller, TestApplicationDbContext db)> CreateControllerWithDbAsync()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var mockPdfService = new Mock<IRenderPDFReport>();

            mockAuthService.Setup(x => x.GetAuthInfoFromRequest()).Returns(new AuthClaims
            {
                IsAdmin = false,
                IsEmployee = false,
                IsAppUser = true,
                IsLoggedIn = true,
                UserId = 1
            });

            var db = await TestApplicationDbContext.CreateAsync(
                mockAuthService.Object,
                mockPhotoService.Object,
                mockPdfService.Object
            );

            var controller = new CompanyController(db);
            controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            return (controller, db);
        }

        [Fact]
        public async Task CheckIfCompanyExists_ReturnsFalse_WhenCompanyDoesNotExist()
        {
            var (controller, db) = await CreateControllerWithDbAsync();

            var result = await controller.CheckIfCompanyExists(userId: 1);

            Assert.False(result.Value);
        }

        [Fact]
        public async Task CheckIfCompanyExists_ReturnsTrue_WhenCompanyExists()
        {
            var (controller, db) = await CreateControllerWithDbAsync();

            db.Companies.Add(new Company
            {
                CompanyName = "Test Company",
                CompanyPhone = "123456789",
                CompanyDescription = "Test Description",
                CompanyAddress = "Test Address",
                CompanyEmail = "test@company.com",
                FileName = "test.png",
                UserId = 1
            });

            await db.SaveChangesAsync();

            var result = await controller.CheckIfCompanyExists(userId: 1);

            Assert.True(result.Value);
        }

        [Fact]
        public async Task GetCompanyByUserId_ReturnsCompany_WhenCompanyExists()
        {
            var (controller, db) = await CreateControllerWithDbAsync();

            var company = new Company
            {
                CompanyName = "My Company",
                CompanyPhone = "987654321",
                CompanyDescription = "Another Description",
                CompanyAddress = "Another Address",
                CompanyEmail = "my@company.com",
                FileName = "file.pdf",
                UserId = 2
            };

            db.Companies.Add(company);
            await db.SaveChangesAsync();

            var result = await controller.GetCompanyByUserId(userId: 2);

            var returnedCompany = Assert.IsType<Company>(result.Value);
            Assert.Equal("My Company", returnedCompany.CompanyName);
        }
    }
}
