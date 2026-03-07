using System.Threading.Tasks;
using LendACarAPI.Data.Models;
using LendACarAPI.Endpoints;
using LendACarTests.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using LendACarAPI.Services;

namespace LendACarTests.Tests.Endpoints
{
    public class VehicleCategoryTests
    {
        [Fact]
        public async Task GetAllCategories_ReturnsOkResultWithCategories()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            // Add a test category
            db.VehicleCategories.Add(new VehicleCategory { Name = "SUV", Description = "Sport Utility Vehicle", Icon = new byte[0] });
            await db.SaveChangesAsync();

            var controller = new VehicleCategoryController(db);

            var result = await controller.GetAllCategories();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var categories = Assert.IsType<VehicleCategory[]>(okResult.Value);
            
            Assert.NotEmpty(categories);
            Assert.Contains(categories, c => c.Name == "SUV");
        }

        [Fact]
        public async Task GetVehicleCategoryById_WithValidId_ReturnsCategory()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            var category = new VehicleCategory { Name = "Sedan", Description = "A sedan car", Icon = new byte[0] };
            db.VehicleCategories.Add(category);
            await db.SaveChangesAsync();

            var controller = new VehicleCategoryController(db);

            var result = await controller.GetVehicleCategoryById(category.Id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var resultDto = Assert.IsType<LendACarAPI.DTOs.VehicleCategoryDto>(okResult.Value);
            Assert.Equal("Sedan", resultDto.Name);
        }

        [Fact]
        public async Task GetVehicleCategoryById_WithInvalidId_ReturnsNotFound()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            var controller = new VehicleCategoryController(db);

            var result = await controller.GetVehicleCategoryById(999);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Vehicle category not found", notFoundResult.Value);
        }

        [Fact]
        public async Task AddVehicleCategory_WithNewCategory_ReturnsCreated()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            var newCategoryDto = new LendACarAPI.DTOs.VehicleCategoryDto 
            { 
                Name = "Truck", 
                Description = "A large truck", 
                Icon = new byte[0] 
            };

            var controller = new VehicleCategoryController(db);

            var result = await controller.AddVehicleCategory(newCategoryDto);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var resultDto = Assert.IsType<LendACarAPI.DTOs.VehicleCategoryDto>(createdResult.Value);
            Assert.Equal("Truck", resultDto.Name);
        }

        [Fact]
        public async Task AddVehicleCategory_WithExistingCategory_ReturnsBadRequest()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            db.VehicleCategories.Add(new VehicleCategory { Name = "Truck", Description = "A large truck", Icon = new byte[0] });
            await db.SaveChangesAsync();

            var existingCategoryDto = new LendACarAPI.DTOs.VehicleCategoryDto 
            { 
                Name = "Truck", 
                Description = "A different truck description", 
                Icon = new byte[0] 
            };

            var controller = new VehicleCategoryController(db);

            var result = await controller.AddVehicleCategory(existingCategoryDto);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Vehicle category already exists!", badRequestResult.Value);
        }
    }
}
