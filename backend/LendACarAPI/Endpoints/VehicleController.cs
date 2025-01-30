using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Filters;
using LendACarAPI.Helper;
using LendACarAPI.Migrations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Microsoft.VisualBasic.FileIO;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleController(ApplicationDbContext db) : ControllerBase
    {
        [HttpGet("get")]
        public async Task<ActionResult<MyPagedList<VehicleDto[]>>> GetAllVehicles([FromQuery] MyPagingRequest pagedParams, CancellationToken cancellationToken)
        {
            var query = db.Vehicles
                .Include(v => v.VehicleModel)
                .Include(v => v.VehicleCategory)
                .Include(v => v.User)
                .Include(v => v.City)
                .Include(v => v.City != null ? v.City.Country : null)
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
                    MaximumLoad = vehicle.MaximumLoad,
                    Description = vehicle.Description,
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
                .Include(v => v.City != null ? v.City.Country : null)
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
                MaximumLoad = vehicle.MaximumLoad,
                Description = vehicle.Description,
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

        [HttpPost("addNew")]
        public async Task<IActionResult> AddVehicle([FromBody] VehicleDto vehicleDto)
        {
            var newVehicle = new Vehicle
            {
                Id = vehicleDto.Id,
                Title = vehicleDto.Title,
                EngineDisplacement = vehicleDto.EngineDisplacement,
                EnginePower = vehicleDto.EnginePower,
                TransmissionType = vehicleDto.TransmissionType,
                FuelType = vehicleDto.FuelType,
                AirConditioning = vehicleDto.AirConditioning,
                NumberOfSeats = vehicleDto.NumberOfSeats,
                TowingHitch = vehicleDto.TowingHitch,
                MaximumLoad = vehicleDto.MaximumLoad,
                Description = vehicleDto.Description,
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
        public async Task<IActionResult> EditVehicle(int id, [FromBody] VehicleDto vehicleDto)
        {
            var vehicle = await db.Vehicles.FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null) return NotFound("Vehicle category not found");


                vehicle.Title = vehicleDto.Title;
                vehicle.EngineDisplacement = vehicleDto.EngineDisplacement;
                vehicle.EnginePower = vehicleDto.EnginePower;
                vehicle.TransmissionType = vehicleDto.TransmissionType;
                vehicle.FuelType = vehicleDto.FuelType;
                vehicle.AirConditioning = vehicleDto.AirConditioning;
                vehicle.NumberOfSeats = vehicleDto.NumberOfSeats;
                vehicle.TowingHitch = vehicleDto.TowingHitch;
                vehicle.MaximumLoad = vehicleDto.MaximumLoad;
                vehicle.Description = vehicleDto.Description;
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
                .Include(v => v.City != null ? v.City.Country : null)
                .FirstOrDefaultAsync(v => v.Id == id);

            return Ok(new VehicleDto
            {
                Id = vehicleDto.Id,
                Title = vehicleDto.Title,
                EngineDisplacement = vehicleDto.EngineDisplacement,
                EnginePower = vehicleDto.EnginePower,
                TransmissionType = vehicleDto.TransmissionType,
                FuelType = vehicleDto.FuelType,
                AirConditioning = vehicleDto.AirConditioning,
                NumberOfSeats = vehicleDto.NumberOfSeats,
                TowingHitch = vehicleDto.TowingHitch,
                MaximumLoad = vehicleDto.MaximumLoad,
                Description = vehicleDto.Description,
                Avaliable = vehicleDto.Avaliable,
                AverageRating = vehicleDto.AverageRating,
                PricePerDay = vehicleDto.PricePerDay,
                VehicleCategoryID = vehicleDto.VehicleCategoryID,
                VehicleCategory = vehicle.VehicleCategory,
                VehicleModelID = vehicleDto.VehicleModelID,
                VehicleModel = vehicle.VehicleModel,
                UserID = vehicleDto.UserID,
                User = vehicleDto.User,
                CityID = vehicleDto.CityID,
            });
        }

        [HttpDelete("remove/{id}")]
        public async Task<IActionResult> RemoveVehicle(int id)
        {
            var vehicle = await db.Vehicles.FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null) return NotFound("Vehicle not found");

            db.Vehicles.Remove(vehicle);
            await db.SaveChangesAsync();

            return NoContent();
        }

    }

}
