using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Endpoints;
using LendACarAPI.Hubs;
using LendACarTests.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;
using LendACarAPI.Services;

namespace LendACarTests.Tests.Endpoints
{
    public class ChatControllerTests
    {
        private async Task<(ChatController controller, TestApplicationDbContext db)> CreateControllerWithDbAsync()
        {
            var mockHubContext = new Mock<IHubContext<ChatHub>>();
            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();

            mockHubContext.Setup(x => x.Clients).Returns(mockClients.Object);
            mockClients.Setup(x => x.Group(It.IsAny<string>()))
                .Returns(mockClientProxy.Object);

            var mockAuthService = new Mock<IAuthService>();
            var mockPhotoService = new Mock<IPhotoService>();
            var mockPdfService = new Mock<IRenderPDFReport>();

            var db = await TestApplicationDbContext.CreateAsync(
                mockAuthService.Object,
                mockPhotoService.Object,
                mockPdfService.Object
            );

            var controller = new ChatController(mockHubContext.Object, db);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            return (controller, db);
        }

        [Fact]
        public async Task GetMessages_ReturnsEmptyList_WhenChatDoesNotExist()
        {
            var (controller, _) = await CreateControllerWithDbAsync();

            var result = await controller.GetMessages(chatId: 123);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var messages = Assert.IsAssignableFrom<IEnumerable<ChatMessage>>(okResult.Value);
            Assert.Empty(messages);
        }

        [Fact]
        public async Task StartChat_CreatesNewChat_WhenChatDoesNotExist()
        {
            var (controller, db) = await CreateControllerWithDbAsync();

            var dto = new StartChatDto
            {
                DealerId = 1,
                CustomerId = 2,
                DealerName = "Dealer",
                CustomerName = "Customer",
                Vehicle = "BMW",
                VehicleId = 10
            };

            var result = await controller.StartChat(dto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var chat = Assert.IsType<Chat>(okResult.Value);

            Assert.Equal(1, chat.DealerId);
            Assert.Equal(2, chat.CustomerId);

            var exists = await db.Chats.AnyAsync(c =>
                c.DealerId == 1 &&
                c.CustomerId == 2 &&
                c.Vehicle == "BMW"
            );

            Assert.True(exists);
        }
    }
}
