using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;

namespace LendACarAPI.Endpoints.DataSeedEndpoints
{
    [Route("api/[controller]")]
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class DataSeedGenerateEndpoint(ApplicationDbContext db, IWebHostEnvironment env):ControllerBase
    {
        [HttpPost("generateReferalData")]
        public async Task<ActionResult<string>> ReferalDataSeedGeneration(CancellationToken cancellationToken = default)
        {
            if (!env.IsDevelopment()) return Unauthorized("Endpoints are disabled in production/staging environments.");

            await DataSeeder.SeedReferalDataAsync(db);
            return await Task.FromResult("Data generation completed successfully.");
        }

        [HttpPost("generatePersonData")]
        public async Task<ActionResult<string>> PersonDataSeedGeneration(CancellationToken cancellationToken = default)
        {
            if (!env.IsDevelopment()) return Unauthorized("Endpoints are disabled in production/staging environments.");

            await DataSeeder.SeedPersonDataAsync(db);
            return await Task.FromResult("Data generation completed successfully.");
        }
    }
}

