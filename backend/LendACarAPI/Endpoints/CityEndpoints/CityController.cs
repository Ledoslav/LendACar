using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LendACarAPI.Endpoints.CityEndpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class CityController(ApplicationDbContext db) : ControllerBase
    {
        [HttpGet("get")]
        public async Task<ActionResult<City[]>> GetAllCities()
        {
            var cities=await db.Cities.Include(c => c.Country).OrderBy(c=>c.Country.Name).ToArrayAsync();

            return Ok(cities);
        }

        [HttpPost("add")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<ActionResult<City>> CreateCity([FromBody] City city,CancellationToken cancellationToken)
        {
            var searchCity=db.Cities
                .Include(c=>c.Country)
                .Where(c=>c.Name==city.Name && c.CountryId==city.CountryId)
                .FirstOrDefault();
            if (searchCity != null) return BadRequest();
         
            db.Cities.Add(city);
            await db.SaveChangesAsync(cancellationToken);
            return Created();
        }

        [HttpDelete("remove/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<ActionResult> RemoveCity([FromRoute]int id,CancellationToken cancellationToken)
        {
            var city=await db.Cities.FirstOrDefaultAsync(c => c.Id == id,cancellationToken);
            if (city == null) return BadRequest();

            db.Remove(city);
            await db.SaveChangesAsync(cancellationToken);
            return Ok();
        }

        [HttpPut("update/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<ActionResult> UpdateCity([FromBody] City city, int id, CancellationToken cancellationToken)
        {
            var cityExists = await db.Cities
                .AnyAsync(c => c.Name == city.Name && c.CountryId == city.CountryId, cancellationToken);

            if (cityExists) return BadRequest();

            var searchCity=await db.Cities.FirstOrDefaultAsync(c=>c.Id == id,cancellationToken);

            if (searchCity == null) return BadRequest();

            searchCity.CountryId=city.CountryId;
            searchCity.Name = city.Name;

            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }

    }
}
