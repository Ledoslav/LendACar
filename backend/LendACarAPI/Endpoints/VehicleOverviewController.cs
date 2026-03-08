using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Helper;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleOverviewController(ApplicationDbContext db) : ControllerBase
    {
        [HttpGet("paged")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
        public async Task<ActionResult<IEnumerable<VehicleOverviewDto>>> GetPagedVehicles([FromQuery] VehicleOverviewPagingRequest request, CancellationToken cancellationToken)
        {
            var query = db.Vehicles
                .Include(v => v.User)
                .ThenInclude(u => u.City)
                .Include(v => v.VehicleModel)
                .ThenInclude(vm => vm.VehicleBrand)
                .Include(v => v.VehicleCategory)
                .AsQueryable();

            // Filters
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var searchLower = request.Search.ToLower();
                query = query.Where(v => v.Title.ToLower().Contains(searchLower));
            }

            if (request.OwnerId.HasValue)
            {
                query = query.Where(v => v.UserID == request.OwnerId.Value);
            }

            if (request.BrandId.HasValue)
            {
                query = query.Where(v => v.VehicleModel.VehicleBrandId == request.BrandId.Value);
            }

            if (request.CityId.HasValue)
            {
                // Based on owner's city
                query = query.Where(v => v.User.CityId == request.CityId.Value);
            }

            if (request.CategoryId.HasValue)
            {
                query = query.Where(v => v.VehicleCategoryID == request.CategoryId.Value);
            }

            if (request.FuelType.HasValue)
            {
                query = query.Where(v => v.FuelType == request.FuelType.Value);
            }

            // Sorting
            switch (request.SortOrder)
            {
                case "price_asc":
                    query = query.OrderBy(v => v.PricePerDay);
                    break;
                case "price_desc":
                    query = query.OrderByDescending(v => v.PricePerDay);
                    break;
                case "res_asc":
                    query = query.OrderBy(v => db.Reservations.Count(r => r.VehicleID == v.Id));
                    break;
                case "res_desc":
                    query = query.OrderByDescending(v => db.Reservations.Count(r => r.VehicleID == v.Id));
                    break;
                case "newest":
                    query = query.OrderByDescending(v => v.Id);
                    break;
                case "oldest":
                    query = query.OrderBy(v => v.Id);
                    break;
                default:
                    query = query.OrderByDescending(v => v.Id); // Default to newest
                    break;
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(v => new VehicleOverviewDto
                {
                    Id = v.Id,
                    Title = v.Title,
                    OwnerName = v.User.FirstName + " " + v.User.LastName,
                    BrandName = v.VehicleModel.VehicleBrand.BrandName,
                    CityName = v.User.City.Name,
                    CategoryName = v.VehicleCategory.Name,
                    FuelType = v.FuelType,
                    PricePerDay = v.PricePerDay,
                    ReservationsCount = db.Reservations.Count(r => r.VehicleID == v.Id)
                })
                .ToListAsync(cancellationToken);

            Response.Headers.Append("X-Total-Count", totalCount.ToString());
            Response.Headers.Append("Access-Control-Expose-Headers", "X-Total-Count");

            return Ok(new { data = items, totalCount });
        }

        [HttpGet("filter-options")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
        public async Task<ActionResult<VehicleOverviewFilterOptionsDto>> GetFilterOptions(CancellationToken cancellationToken)
        {
            var owners = await db.Users
                .Where(u => db.Vehicles.Any(v => v.UserID == u.Id))
                .Select(u => new FilterOptionDto { Id = u.Id, Name = u.FirstName + " " + u.LastName })
                .ToListAsync(cancellationToken);

            var brands = await db.VehicleBrands
                .Select(b => new FilterOptionDto { Id = b.Id, Name = b.BrandName })
                .ToListAsync(cancellationToken);

            var cities = await db.Cities
                .Where(c => db.Users.Any(u => u.CityId == c.Id && db.Vehicles.Any(v => v.UserID == u.Id)))
                .Select(c => new FilterOptionDto { Id = c.Id, Name = c.Name })
                .ToListAsync(cancellationToken);

            var categories = await db.VehicleCategories
                .Select(c => new FilterOptionDto { Id = c.Id, Name = c.Name })
                .ToListAsync(cancellationToken);

            return Ok(new VehicleOverviewFilterOptionsDto
            {
                Owners = owners,
                Brands = brands,
                Cities = cities,
                Categories = categories
            });
        }

        [HttpDelete("delete/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
        public async Task<IActionResult> DeleteVehicle(int id, CancellationToken cancellationToken)
        {
            var vehicle = await db.Vehicles
                .Include(v => v.VehicleImages)
                .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

            if (vehicle == null)
            {
                return NotFound(new { message = "Vehicle not found" });
            }

            // Remove associated reservations
            var reservations = await db.Reservations
                .Where(r => r.VehicleID == id)
                .ToListAsync(cancellationToken);
            db.Reservations.RemoveRange(reservations);

            // Remove associated images
            db.VehicleImages.RemoveRange(vehicle.VehicleImages);

            db.Vehicles.Remove(vehicle);
            await db.SaveChangesAsync(cancellationToken);

            return Ok(new { message = "Vehicle deleted successfully" });
        }
    }
}
