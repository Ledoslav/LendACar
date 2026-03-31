using System;
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
    public class VerificationRequestTests
    {
        [Fact]
        public async Task GetAllVerificationRequests_ReturnsOkResultWithRequests()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            // Add a test verification request
            db.VerificationRequests.Add(new VerificationRequest 
            { 
                UserId = 1, 
                RequestDate = DateTime.UtcNow, 
                RequestComment = "Please verify my account." 
            });
            await db.SaveChangesAsync();

            mockAuthService.Setup(a => a.GetAuthInfoFromRequest()).Returns(new AuthClaims { UserId = 1, IsAdmin = true });
            var controller = new VerificationRequestController(db, mockAuthService.Object);

            var result = await controller.GetAllVerificationRequests();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var requests = Assert.IsType<VerificationRequest[]>(okResult.Value);
            
            Assert.NotEmpty(requests);
            Assert.Contains(requests, r => r.UserId == 1);
        }

        [Fact]
        public async Task GetVerificationRequestById_WithValidId_ReturnsRequest()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            var request = new VerificationRequest { UserId = 2, RequestDate = DateTime.UtcNow, RequestComment = "Valid Request" };
            db.VerificationRequests.Add(request);
            await db.SaveChangesAsync();

            mockAuthService.Setup(a => a.GetAuthInfoFromRequest()).Returns(new AuthClaims { UserId = 2, IsAdmin = true });
            var controller = new VerificationRequestController(db, mockAuthService.Object);

            var result = await controller.GetVerificationRequestById(request.Id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var resultDto = Assert.IsType<LendACarAPI.DTOs.VerificationDto>(okResult.Value);
            Assert.Equal(2, resultDto.UserId);
        }

        [Fact]
        public async Task GetVerificationRequestById_WithInvalidId_ReturnsNotFound()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            mockAuthService.Setup(a => a.GetAuthInfoFromRequest()).Returns(new AuthClaims { UserId = 999, IsAdmin = true });
            var controller = new VerificationRequestController(db, mockAuthService.Object);

            var result = await controller.GetVerificationRequestById(999);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Verification request not found", notFoundResult.Value);
        }

        [Fact]
        public async Task AddVerificationRequest_WithNewRequest_ReturnsCreated()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            var newRequestDto = new LendACarAPI.DTOs.VerificationSubmitDto 
            { 
                UserId = 3, 
                RequestComment = "Please verify my account." 
            };

            mockAuthService.Setup(a => a.GetAuthInfoFromRequest()).Returns(new AuthClaims { UserId = 3, IsAdmin = true });
            var controller = new VerificationRequestController(db, mockAuthService.Object);

            var result = await controller.AddVerificationRequest(newRequestDto);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var resultDto = Assert.IsType<LendACarAPI.DTOs.VerificationSubmitDto>(createdResult.Value);
            Assert.Equal(3, resultDto.UserId);
        }

        [Fact]
        public async Task AddVerificationRequest_WithExistingRequest_ReturnsBadRequest()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            db.VerificationRequests.Add(new VerificationRequest { UserId = 4, RequestDate = DateTime.UtcNow, RequestComment = "Existing" });
            await db.SaveChangesAsync();

            var existingRequestDto = new LendACarAPI.DTOs.VerificationSubmitDto 
            { 
                UserId = 4, 
                RequestComment = "Another request" 
            };

            mockAuthService.Setup(a => a.GetAuthInfoFromRequest()).Returns(new AuthClaims { UserId = 4, IsAdmin = true });
            var controller = new VerificationRequestController(db, mockAuthService.Object);

            var result = await controller.AddVerificationRequest(existingRequestDto);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("User already submited a verification request!", badRequestResult.Value);
        }
    }
}
