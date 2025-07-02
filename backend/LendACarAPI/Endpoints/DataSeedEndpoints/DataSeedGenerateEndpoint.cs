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
    public class DataSeedGenerateEndpoint(ApplicationDbContext db):ControllerBase
    {
        [HttpPost("generateReferalData")]
        public async Task<string> ReferalDataSeedGeneration(CancellationToken cancellationToken = default)
        {
            await DataSeeder.SeedReferalDataAsync(db);
            return await Task.FromResult("Data generation completed successfully.");
        }

        [HttpPost("generatePersonData")]
        public async Task<string> PersonDataSeedGeneration(CancellationToken cancellationToken = default)
        {
            await DataSeeder.SeedPersonDataAsync(db);
            return await Task.FromResult("Data generation completed successfully.");
        }
    }
}

