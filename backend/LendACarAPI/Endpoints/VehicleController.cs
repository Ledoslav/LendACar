using CloudinaryDotNet;
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
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleController: ControllerBase
    {
        private readonly ApplicationDbContext db;
        private readonly IPhotoService photoService;

        public VehicleController(ApplicationDbContext db, IPhotoService photoService)
        {
            this.db = db;
            this.photoService = photoService ?? throw new ArgumentNullException(nameof(photoService));
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
                .Include(v => v.VehicleImages)
                .AsQueryable();


            if (!string.IsNullOrWhiteSpace(pagedParams.Search))
            {
                var searchLower = pagedParams.Search.ToLower();
                query = query.Where(v => v.Title.ToLower().Contains(searchLower));
            }

            // --- Price range filter ---
                query = query.Where(v => v.PricePerDay >= pagedParams.FromPrice);
                query = query.Where(v => v.PricePerDay <= pagedParams.ToPrice);


            // --- Date filters ---
            if (!pagedParams.AllDateActive)
            {
                if (pagedParams.Last24Active)
                {
                    var from = DateTime.UtcNow.AddDays(-1);
                    query = query.Where(v => v.LastUpdated >= from);
                }
                if (pagedParams.Last7Active)
                {
                    var from = DateTime.UtcNow.AddDays(-7);
                    query = query.Where(v => v.LastUpdated >= from);
                }
                if (pagedParams.LastMonthActive)
                {
                    var from = DateTime.UtcNow.AddMonths(-1);
                    query = query.Where(v => v.LastUpdated >= from);
                }
            }

            // --- Transmission filters ---
            if (!pagedParams.AllTransActive)
            {
                var transConditions = new List<int>();
                if (pagedParams.ManualTransActive) transConditions.Add(0);
                if (pagedParams.AutomaticTransActive) transConditions.Add(1);
                // Add other TransmissionType values as needed: 2 - AutomatedManual, 3 - DCT, 4 - CVT
                if (transConditions.Any()) query = query.Where(v => transConditions.Contains(v.TransmissionType));
            }

            // --- Fuel filters ---
            if (!pagedParams.AllFuelActive)
            {
                var fuelConditions = new List<int>();
                if (pagedParams.PetrolActive) fuelConditions.Add(0);
                if (pagedParams.DieselActive) fuelConditions.Add(1);
                if (pagedParams.OtherFuelActive)
                {
                    fuelConditions.Add(2); // Electric
                    fuelConditions.Add(3); // Hybrid
                    fuelConditions.Add(4); // LPG
                    fuelConditions.Add(5); // CNG
                }
                if (fuelConditions.Any()) query = query.Where(v => fuelConditions.Contains(v.FuelType));
            }

            // --- Special offers ---
            if (pagedParams.SpecialOffersActive)
            {
                // Example: price discount < 0, or some other condition
                query = query.Where(v => v.PricePerDay < 100); // example placeholder
            }

            // --- Special equipment ---
            if (pagedParams.SpecialEquipmentActive)
            {
                query = query.Where(v => v.TowingHitch); // or other equipment flags
            }

            // --- Select DTO ---
            var vehicleQuery = query.Select(vehicle => new VehicleDto
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
                LastUpdated = vehicle.LastUpdated,
                VehicleImages = vehicle.VehicleImages.Select(img => new VehicleImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl
                }).ToList()
            });

            var vehicles = await MyPagedList<VehicleDto>.CreateAsync(vehicleQuery, pagedParams, cancellationToken);
            Response.AddPaginationHeader(vehicles);

            if (!vehicles.DataItems.Any()) return Ok(vehicles.DataItems);
            return Ok(vehicles.DataItems);
        }



        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetVehicleById(int id)
        {
            var vehicle = await db.Vehicles
                .Include(v => v.VehicleModel)
                .ThenInclude(v => v.VehicleBrand)
                .Include(v => v.VehicleCategory)
                .Include(v => v.User)
                .Include(v => v.City)
                .ThenInclude(c => c.Country)
                .Include(v => v.VehicleImages)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null) return NotFound("Vehicle not found");

            var vehicleDto = new VehicleDto
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
                City = vehicle.City,
                LastUpdated = vehicle.LastUpdated,
                VehicleImages = vehicle.VehicleImages
                    .Select(img => new VehicleImageDto
                    {
                        Id = img.Id,
                        ImageUrl = img.ImageUrl,
                        PublicId = img.PublicId
                    }).ToList()
            };

            return Ok(vehicleDto);
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
                .Include(v => v.VehicleImages) // include images
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
                City = vehicle.City,
                LastUpdated = vehicle.LastUpdated,
                VehicleImages = vehicle.VehicleImages
                    .Select(img => new VehicleImageDto
                    {
                        Id = img.Id,
                        ImageUrl = img.ImageUrl,
                        PublicId = img.PublicId
                    }).ToList()
            }).ToList();

            return Ok(vehicleDtos);
        }


        [HttpGet("getCompanyAdminUserId")]
        public async Task<IActionResult> GetVehiclesCompanyAdminEmail([FromQuery] int UserId, [FromQuery] string? CompanyAdminEmail, CancellationToken cancellationToken)
        {
                var employee = await db.CompanyEmployees
                .FirstOrDefaultAsync(e => e.UserId == UserId, cancellationToken);

                var admin = await db.CompanyEmployees
                .FirstOrDefaultAsync(a => a.CompanyId == employee.CompanyId && a.CompanyAdminEmail != null, cancellationToken);

                return Ok(admin.UserId);
       
        }

        [HttpGet("getByCompanyAdminEmail")]
        public async Task<IActionResult> GetVehiclesByCompanyAdminEmail([FromQuery]int UserId, [FromQuery] string? CompanyAdminEmail , CancellationToken cancellationToken)
        {
            if(CompanyAdminEmail == null)
            {
                var employee = await db.CompanyEmployees
                .FirstOrDefaultAsync(e => e.UserId == UserId, cancellationToken);

                var admin = await db.CompanyEmployees
                .FirstOrDefaultAsync(a => a.CompanyId == employee.CompanyId && a.CompanyAdminEmail != null, cancellationToken);

                var vehicles = await db.Vehicles
                .Where(v => v.UserID == admin.UserId)
                .Include(v => v.VehicleModel)
                .Include(v => v.VehicleCategory)
                .Include(v => v.User)
                .Include(v => v.City)
                .ThenInclude(c => c.Country)
                .Include(v => v.VehicleImages)
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
                    LastUpdated = vehicle.LastUpdated,
                    VehicleImages = vehicle.VehicleImages.Select(img => new VehicleImageDto
                    {
                        Id = img.Id,
                        ImageUrl = img.ImageUrl
                    }).ToList()
                }).ToList();

                return Ok(vehicleDtos);
            }
            else
            {
                var companyEmployee = await db.CompanyEmployees
                .Where(e => e.CompanyAdminEmail == CompanyAdminEmail)
                .ToListAsync(cancellationToken);

                var vehicles = await db.Vehicles
                .Where(v => v.UserID == companyEmployee[0].UserId)
                .Include(v => v.VehicleModel)
                .Include(v => v.VehicleCategory)
                .Include(v => v.User)
                .Include(v => v.City)
                .ThenInclude(c => c.Country)
                .Include(v => v.VehicleImages)
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
                    LastUpdated = vehicle.LastUpdated,
                    VehicleImages = vehicle.VehicleImages.Select(img => new VehicleImageDto
                    {
                        Id = img.Id,
                        ImageUrl = img.ImageUrl
                    }).ToList()
                }).ToList();

                return Ok(vehicleDtos);
            }
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
                LastUpdated = DateTime.Now
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
            vehicle.LastUpdated = DateTime.Now;

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
                LastUpdated = returnVehicle.LastUpdated,
            });
        }

        [HttpDelete("remove/{id}")]
        public async Task<IActionResult> RemoveVehicle(int id)
        {
            var vehicle = await db.Vehicles.FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null) return NotFound("Vehicle not found");

            // Check if there are images associated with the vehicle and delete them
            var vehicleImages = await db.VehicleImages.Where(vi => vi.VehicleId == id).ToListAsync();

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

        [HttpPost("upload")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<ActionResult<VehicleDto>> CreateVehicle([FromForm] VehicleUploadDto dto, List<IFormFile> images, CancellationToken cancellationToken)
        {
            var vehicle = new Vehicle
            {
                Title = dto.Title,
                VehicleModelID = dto.VehicleModelID,
                PricePerDay = dto.PricePerDay,
                FuelType = dto.FuelType,
                TransmissionType = dto.TransmissionType,
                EngineDisplacement = dto.EngineDisplacement,
                EnginePower = dto.EnginePower,
                AirConditioning = dto.AirConditioning,
                NumberOfSeats = dto.NumberOfSeats,
                TowingHitch = dto.TowingHitch,
                ProductionYear = dto.ProductionYear,
                Description = dto.Description,
                VehicleCategoryID = dto.VehicleCategoryID,
                CityID = dto.CityID,
                Avaliable = dto.Avaliable,
                UserID = dto.UserID,
                LastUpdated = DateTime.UtcNow
            };

            db.Vehicles.Add(vehicle);
            await db.SaveChangesAsync(cancellationToken);

            // handle images
            if (images != null && images.Any())
            {
                foreach (var file in images)
                {
                    var result = await photoService.AddVehiclePhotoAsync(file);
                    db.VehicleImages.Add(new VehicleImage
                    {
                        VehicleId = vehicle.Id,
                        ImageUrl = result.SecureUrl.AbsoluteUri,
                        PublicId = result.PublicId
                    });
                }
                await db.SaveChangesAsync(cancellationToken);

                // Reload VehicleImages for DTO
                await db.Entry(vehicle).Collection(v => v.VehicleImages).LoadAsync(cancellationToken);
            }


            // return mapped DTO
            var vehicleDto = new VehicleDto
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
                LastUpdated = vehicle.LastUpdated,
                VehicleImages = vehicle.VehicleImages.Select(img => new VehicleImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl
                }).ToList()
            };

            return Ok(vehicleDto);
        }


    }
}
