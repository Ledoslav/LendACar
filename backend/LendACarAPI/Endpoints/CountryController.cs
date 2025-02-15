using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountryController(ApplicationDbContext db) : ControllerBase
    {
        [HttpGet("getAll")]
        public async Task<ActionResult<Country[]>> GetAllCountries(CancellationToken cancellationToken)
        {
            var countries = await db.Countries
                .OrderBy(c=>c.Name)
                .ToArrayAsync(cancellationToken);

            return Ok(countries);
        }

        [HttpPost("create")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<ActionResult> CreateCountry([FromBody] Country country,CancellationToken cancellationToken)
        {
            var searchCountry = db.Countries
                .FirstOrDefault(c => c.Name == country.Name);
            if (searchCountry != null) return BadRequest("Country already exists");

            db.Countries.Add(country);
            await db.SaveChangesAsync(cancellationToken);

            return Created();
        }

        [HttpDelete("remove/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<ActionResult> RemoveCountry([FromRoute] int id, CancellationToken cancellationToken)
        {
            var country = await db.Countries.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
            if (country == null) return NotFound("Country not found");

            var cities=await db.Cities
                .Where(c=>c.CountryId== id)
                .ToArrayAsync(cancellationToken);


            db.RemoveRange(cities);
            //await db.SaveChangesAsync(cancellationToken);

            db.Remove(country);
            await db.SaveChangesAsync(cancellationToken);
            return Ok();
        }

        [HttpPut("update/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<ActionResult> UpdateCountry([FromBody] Country country, int id,CancellationToken cancellationToken)
        {
            var searchCountry = await db.Countries
                .Where(c => c.Id == id && !db.Countries.Any(other => other.Name == country.Name && other.Id != id))
                .FirstOrDefaultAsync(cancellationToken);

            if (searchCountry == null) return NotFound("Country not found");

            searchCountry.Name = country.Name;
            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }

    }
}
