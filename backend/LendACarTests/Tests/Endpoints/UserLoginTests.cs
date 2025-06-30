using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Endpoints;
using LendACarAPI.Services;
using LendACarTests.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Cryptography;
using Xunit;

namespace LendACarTests.Tests.Endpoints
{
    public class UserLoginTests
    {
        [Fact]
        public async Task LoginUser_WithValidCredentials_ReturnsUserDtoWithToken()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            var loginDto = new LoginUserDto { Username = "KalloX", Password = "password" };

            mockAuthService.Setup(x => x.CreatToken(It.IsAny<User>())).Returns("fake-jwt-token");

            var controller = new UserController(db, mockAuthService.Object, mockPhotoService.Object);
            controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await controller.LoginUser(loginDto, CancellationToken.None);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var userDto = Assert.IsType<UserDto>(okResult.Value);
            Assert.Equal("KalloX", userDto.Username);
            Assert.Equal("fake-jwt-token", userDto.Token);
        }

        [Fact]
        public async Task LoginUser_WithInvalidCredentials_ReturnsUnauthorized()
        {
            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var db = await TestApplicationDbContext.CreateAsync(mockAuthService.Object, mockPhotoService.Object, new Mock<IRenderPDFReport>().Object);

            var loginDto = new LoginUserDto { Username = "KalloX", Password = "wrongpassword" };

            var controller = new UserController(db, mockAuthService.Object, mockPhotoService.Object);
            controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await controller.LoginUser(loginDto, CancellationToken.None);

            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal("Invalid credentials", unauthorizedResult.Value);
        }
    }
}
