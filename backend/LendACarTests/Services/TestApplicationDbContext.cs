using LendACarAPI.Data;
using LendACarAPI.Services; // For DataSeeder
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace LendACarTests.Services
{
    public class TestApplicationDbContext : ApplicationDbContext
    {
        public TestApplicationDbContext(DbContextOptions<TestApplicationDbContext> options)
            : base(options)
        {
        }

        public static async Task<TestApplicationDbContext> CreateAsync(IAuthService authService, IPhotoService photoService, IRenderPDFReport renderPDFReport)
        {
            var options = new DbContextOptionsBuilder<TestApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{System.Guid.NewGuid()}")
                .Options;
            var db = new TestApplicationDbContext(options);
            await DataSeeder.SeedReferalDataAsync(db);
            await DataSeeder.SeedPersonDataAsync(db, authService, photoService, renderPDFReport);
            return db;
        }
    }
} 