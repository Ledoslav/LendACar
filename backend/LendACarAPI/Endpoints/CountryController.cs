using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Helper;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountryController(ApplicationDbContext db) : ControllerBase
    {
        [HttpGet("getAll")]
        public async Task<ActionResult<Country[]>> GetAllCountries([FromQuery] string? countryName,CancellationToken cancellationToken)
        {
            var query= db.Countries.AsQueryable();

            if (!string.IsNullOrEmpty(countryName))
                query = query.Where(c => c.Name.ToLower().Contains(countryName.ToLower()));


            var countries = await query
                .OrderBy(c=>c.Name)
                .ToArrayAsync(cancellationToken);

            return Ok(countries);
        }

        [HttpGet("getAllPaged")]
        public async Task<ActionResult<MyPagedList<Country[]>>> GetAllPagedCountries([FromQuery] string? countryName, [FromQuery] MyPagingRequest pagingRequest, CancellationToken cancellationToken)
        {
            var query = db.Countries.AsQueryable();

            if (!string.IsNullOrEmpty(countryName))
                query = query.Where(c => c.Name.ToLower().Contains(countryName.ToLower()));

            query = query
            .OrderBy(c => c.Name);

            var countries = await MyPagedList<Country>.CreateAsync(query, pagingRequest, cancellationToken);
            Response.AddPaginationHeader(countries);

            return Ok(countries.DataItems);
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
