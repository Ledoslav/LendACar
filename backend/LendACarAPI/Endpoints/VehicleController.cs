using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Filters;
using LendACarAPI.Helper;
using LendACarAPI.Migrations;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleController : ControllerBase
    {
        private readonly ApplicationDbContext db;

        public VehicleController(ApplicationDbContext db)
        {
            this.db = db;
        }

        [HttpGet("get")]
        public async Task<ActionResult<MyPagedList<VehicleDto[]>>> GetAllVehicles([FromQuery] MyPagingRequest pagedParams, CancellationToken cancellationToken)
        {
            var query = db.Vehicles
                .Include(v => v.VehicleModel)
                .Include(v => v.VehicleCategory)
                .Include(v => v.User)
                .Include(v => v.City)
                .ThenInclude(c => c.Country)
                .Select(vehicle => new VehicleDto()
                {
                    Id = vehicle.Id,
                    Title = vehicle.Title,
                    EngineDisplacement = vehicle.EngineDisplacement,
                    EnginePower = vehicle.EnginePower,
                    TransmissionType = vehicle.TransmissionType,
                    FuelType = vehicle.FuelType,
                    AirConditioning = vehicle.AirConditioning,
                    NumberOfSeats = vehicle.NumberOfSeats,
                    TowingHitch = vehicle.TowingHitch,
                    Description = vehicle.Description,
                    ProductionYear = vehicle.ProductionYear,
                    Avaliable = vehicle.Avaliable,
                    AverageRating = vehicle.AverageRating,
                    PricePerDay = vehicle.PricePerDay,
                    VehicleCategoryID = vehicle.VehicleCategoryID,
                    VehicleCategory = vehicle.VehicleCategory,
                    VehicleModelID = vehicle.VehicleModelID,
                    VehicleModel = vehicle.VehicleModel,
                    UserID = vehicle.UserID,
                    User = vehicle.User,
                    CityID = vehicle.CityID,
                });

            var vehicles = await MyPagedList<VehicleDto>.CreateAsync(query, pagedParams, cancellationToken);

            Response.AddPaginationHeader(vehicles);

            if (vehicles.DataItems.Length == 0) return BadRequest();

            return Ok(vehicles.DataItems);
        }

        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetVehicleById(int id)
        {
            var vehicle = await db.Vehicles
                .Include(v => v.VehicleModel)
                .Include(v => v.VehicleCategory)
                .Include(v => v.User)
                .Include(v => v.City)
                .ThenInclude(c => c.Country)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null) return NotFound("Vehicle not found");

            var vehicleCategoryDto = new VehicleDto
            {
                Id = vehicle.Id,
                Title = vehicle.Title,
                EngineDisplacement = vehicle.EngineDisplacement,
                EnginePower = vehicle.EnginePower,
                TransmissionType = vehicle.TransmissionType,
                FuelType = vehicle.FuelType,
                AirConditioning = vehicle.AirConditioning,
                NumberOfSeats = vehicle.NumberOfSeats,
                TowingHitch = vehicle.TowingHitch,
                Description = vehicle.Description,
                ProductionYear = vehicle.ProductionYear,
                Avaliable = vehicle.Avaliable,
                AverageRating = vehicle.AverageRating,
                PricePerDay = vehicle.PricePerDay,
                VehicleCategoryID = vehicle.VehicleCategoryID,
                VehicleCategory = vehicle.VehicleCategory,
                VehicleModelID = vehicle.VehicleModelID,
                VehicleModel = vehicle.VehicleModel,
                UserID = vehicle.UserID,
                User = vehicle.User,
                CityID = vehicle.CityID,
            };

            return Ok(vehicleCategoryDto);
        }

        [HttpGet("getByUser/{userId}")]
        public async Task<IActionResult> GetVehiclesByUser(int userId, CancellationToken cancellationToken)
        {
            var vehicles = await db.Vehicles
                .Where(v => v.UserID == userId)
                .Include(v => v.VehicleModel)
                .Include(v => v.VehicleCategory)
                .Include(v => v.User)
                .Include(v => v.City)
                .ThenInclude(c => c.Country)
                .ToListAsync(cancellationToken);

            if (!vehicles.Any()) return BadRequest("No vehicles found for this user");

            var vehicleDtos = vehicles.Select(vehicle => new VehicleDto
            {
                Id = vehicle.Id,
                Title = vehicle.Title,
                EngineDisplacement = vehicle.EngineDisplacement,
                EnginePower = vehicle.EnginePower,
                TransmissionType = vehicle.TransmissionType,
                FuelType = vehicle.FuelType,
                AirConditioning = vehicle.AirConditioning,
                NumberOfSeats = vehicle.NumberOfSeats,
                TowingHitch = vehicle.TowingHitch,
                Description = vehicle.Description,
                ProductionYear = vehicle.ProductionYear,
                Avaliable = vehicle.Avaliable,
                AverageRating = vehicle.AverageRating,
                PricePerDay = vehicle.PricePerDay,
                VehicleCategoryID = vehicle.VehicleCategoryID,
                VehicleCategory = vehicle.VehicleCategory,
                VehicleModelID = vehicle.VehicleModelID,
                VehicleModel = vehicle.VehicleModel,
                UserID = vehicle.UserID,
                User = vehicle.User,
                CityID = vehicle.CityID,
            }).ToList();

            return Ok(vehicleDtos);
        }


        [HttpPost("addNew")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<IActionResult> AddVehicle([FromBody] VehicleUploadDto vehicleDto)
        {
            // Check if the User with the provided UserID exists and is verified
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == vehicleDto.UserID);

            if (user == null)
            {
                return BadRequest("User not found");
            }

            if (!user.IsVerified)
            {
                return BadRequest("User is not verified and cannot upload vehicles");
            }

            // If the user exists and is verified, proceed with adding the vehicle
            var newVehicle = new Vehicle
            {
                Title = vehicleDto.Title,
                EngineDisplacement = vehicleDto.EngineDisplacement,
                EnginePower = vehicleDto.EnginePower,
                TransmissionType = vehicleDto.TransmissionType,
                FuelType = vehicleDto.FuelType,
                AirConditioning = vehicleDto.AirConditioning,
                NumberOfSeats = vehicleDto.NumberOfSeats,
                TowingHitch = vehicleDto.TowingHitch,
                Description = vehicleDto.Description,
                ProductionYear = vehicleDto.ProductionYear,
                Avaliable = vehicleDto.Avaliable,
                AverageRating = vehicleDto.AverageRating,
                PricePerDay = vehicleDto.PricePerDay,
                VehicleCategoryID = vehicleDto.VehicleCategoryID,
                VehicleModelID = vehicleDto.VehicleModelID,
                UserID = vehicleDto.UserID,
                CityID = vehicleDto.CityID,
            };

            db.Vehicles.Add(newVehicle);
            await db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVehicleById), new { id = newVehicle.Id }, vehicleDto);
        }


        [HttpPut("update/{id}")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<IActionResult> EditVehicle(int id, [FromBody] VehicleDto vehicleDto)
        {
            var vehicle = await db.Vehicles.FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null) return NotFound("Vehicle not found");

            vehicle.Title = vehicleDto.Title;
            vehicle.EngineDisplacement = vehicleDto.EngineDisplacement;
            vehicle.EnginePower = vehicleDto.EnginePower;
            vehicle.TransmissionType = vehicleDto.TransmissionType;
            vehicle.FuelType = vehicleDto.FuelType;
            vehicle.AirConditioning = vehicleDto.AirConditioning;
            vehicle.NumberOfSeats = vehicleDto.NumberOfSeats;
            vehicle.TowingHitch = vehicleDto.TowingHitch;
            vehicle.Description = vehicleDto.Description;
            vehicle.ProductionYear = vehicleDto.ProductionYear;
            vehicle.Avaliable = vehicleDto.Avaliable;
            vehicle.AverageRating = vehicleDto.AverageRating;
            vehicle.PricePerDay = vehicleDto.PricePerDay;
            vehicle.VehicleModelID = vehicleDto.VehicleModelID;
            vehicle.UserID = vehicleDto.UserID;
            vehicle.CityID = vehicleDto.CityID;

            await db.SaveChangesAsync();

            var returnVehicle = await db.Vehicles
                .Include(v => v.VehicleModel)
                .Include(v => v.VehicleCategory)
                .Include(v => v.User)
                .Include(v => v.City)
                .ThenInclude(c => c.Country)
                .FirstOrDefaultAsync(v => v.Id == id);

            return Ok(new VehicleDto
            {
                Id = returnVehicle.Id,
                Title = returnVehicle.Title,
                EngineDisplacement = returnVehicle.EngineDisplacement,
                EnginePower = returnVehicle.EnginePower,
                TransmissionType = returnVehicle.TransmissionType,
                FuelType = returnVehicle.FuelType,
                AirConditioning = returnVehicle.AirConditioning,
                NumberOfSeats = returnVehicle.NumberOfSeats,
                TowingHitch = returnVehicle.TowingHitch,
                Description = returnVehicle.Description,
                ProductionYear = returnVehicle.ProductionYear,
                Avaliable = returnVehicle.Avaliable,
                AverageRating = returnVehicle.AverageRating,
                PricePerDay = returnVehicle.PricePerDay,
                VehicleCategoryID = returnVehicle.VehicleCategoryID,
                VehicleCategory = returnVehicle.VehicleCategory,
                VehicleModelID = returnVehicle.VehicleModelID,
                VehicleModel = returnVehicle.VehicleModel,
                UserID = returnVehicle.UserID,
                User = returnVehicle.User,
                CityID = returnVehicle.CityID,
            });
        }

        [HttpDelete("remove/{id}")]
        public async Task<IActionResult> RemoveVehicle(int id)
        {
            var vehicle = await db.Vehicles.FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null) return NotFound("Vehicle not found");

            // Check if there are images associated with the vehicle and delete them
            var vehicleImages = await db.VehicleImages.Where(vi => vi.VehicleID == id).ToListAsync();

            if (vehicleImages.Any())
            {
                db.VehicleImages.RemoveRange(vehicleImages);  // Remove all associated images
                await db.SaveChangesAsync();
            }

            // Now remove the vehicle
            db.Vehicles.Remove(vehicle);
            await db.SaveChangesAsync();

            return NoContent();
        }

    }
}
