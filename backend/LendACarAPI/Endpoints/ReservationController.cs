using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Filters;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly ApplicationDbContext db;
        private readonly IAuthService authService;

        public ReservationController(ApplicationDbContext db, IAuthService authService)
        {
            this.db = db;
            this.authService = authService;
        }

        [HttpGet("getById/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> GetReservationById(int id, CancellationToken cancellationToken)
        {
            var authInfo = authService.GetAuthInfoFromRequest();

            var reservation = await db.Reservations
                .AsNoTracking()
                .Include(r => r.Vehicle)
                    .ThenInclude(v => v.VehicleImages)
                .Include(r => r.Renter)
                .Include(r => r.Owner)
                .Include(r => r.PickUpCity)
                    .ThenInclude(c => c.Country)
                .Include(r => r.DropOffCity)
                    .ThenInclude(c => c.Country)
                .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

            if (reservation == null) return NotFound("Reservation not found");

            if (reservation.RenterId != authInfo.UserId && reservation.OwnerId != authInfo.UserId && !authInfo.IsAdmin && !authInfo.IsEmployee)
                return Unauthorized("Not authorized to view this reservation");

            var dto = MapToDto(reservation);
            return Ok(dto);
        }

        [HttpGet("getByOwner/{ownerId}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> GetReservationsByOwner(int ownerId, CancellationToken cancellationToken)
        {
            var authInfo = authService.GetAuthInfoFromRequest();
            if (ownerId != authInfo.UserId && !authInfo.IsAdmin && !authInfo.IsEmployee)
                return Unauthorized("Not authorized");

            var reservations = await db.Reservations
                .AsNoTracking()
                .Where(r => r.OwnerId == ownerId)
                .Include(r => r.Vehicle)
                    .ThenInclude(v => v.VehicleImages)
                .Include(r => r.Renter)
                .Include(r => r.PickUpCity)
                    .ThenInclude(c => c.Country)
                .Include(r => r.DropOffCity)
                    .ThenInclude(c => c.Country)
                .ToListAsync(cancellationToken);

            if (!reservations.Any()) return BadRequest("No reservations found for this owner");

            var dtoList = reservations.Select(MapToDto).ToList();
            return Ok(dtoList);
        }

        [HttpGet("getByRenter/{renterId}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> GetReservationsByRenter(int renterId, CancellationToken cancellationToken)
        {
            var authInfo = authService.GetAuthInfoFromRequest();
            if (renterId != authInfo.UserId && !authInfo.IsAdmin && !authInfo.IsEmployee)
                return Unauthorized("Not authorized");

            var reservations = await db.Reservations
                .AsNoTracking()
                .Where(r => r.RenterId == renterId)
                .Include(r => r.Vehicle)
                    .ThenInclude(v => v.VehicleImages)
                .Include(r => r.Owner)
                .Include(r => r.PickUpCity)
                    .ThenInclude(c => c.Country)
                .Include(r => r.DropOffCity)
                    .ThenInclude(c => c.Country)
                .ToListAsync(cancellationToken);

            if (!reservations.Any()) return BadRequest("No reservations found for this renter");

            var dtoList = reservations.Select(MapToDto).ToList();
            return Ok(dtoList);
        }

        [HttpPost("create")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationCreateDto reservationDto, CancellationToken cancellationToken)
        {
            var authInfo = authService.GetAuthInfoFromRequest();
            reservationDto.RenterId = authInfo.UserId; // Ensure user can only create reservations for themselves

            // Validate renter, owner, vehicle, and cities
            var renter = await db.Users.FirstOrDefaultAsync(u => u.Id == reservationDto.RenterId, cancellationToken);
            var owner = await db.Users.FirstOrDefaultAsync(u => u.Id == reservationDto.OwnerId, cancellationToken);
            var vehicle = await db.Vehicles.FirstOrDefaultAsync(v => v.Id == reservationDto.VehicleID, cancellationToken);
            var pickUpCity = await db.Cities.FirstOrDefaultAsync(c => c.Id == reservationDto.PickUpCityID, cancellationToken);
            var dropOffCity = await db.Cities.FirstOrDefaultAsync(c => c.Id == reservationDto.DropOffCityID, cancellationToken);

            if (renter == null) return BadRequest("Renter not found");
            if (owner == null) return BadRequest("Owner not found");
            if (vehicle == null) return BadRequest("Vehicle not found");
            if (pickUpCity == null) return BadRequest("Pick-up city not found");
            if (dropOffCity == null) return BadRequest("Drop-off city not found");

            var reservation = new Reservation
            {
                RenterId = reservationDto.RenterId,
                OwnerId = reservationDto.OwnerId,
                VehicleID = reservationDto.VehicleID,
                PickUpCityID = reservationDto.PickUpCityID,
                DropOffCityID = reservationDto.DropOffCityID,
                PickUpDateTime = reservationDto.PickUpDateTime,
                DropOffDateTime = reservationDto.DropOffDateTime,
                Price = reservationDto.Price,
                IsCashPayment = reservationDto.IsCashPayment,
                Status = ReservationStatus.Pending
            };

            db.Reservations.Add(reservation);
            await db.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(reservation);
            return CreatedAtAction(nameof(GetReservationById), new { id = reservation.Id }, dto);
        }

        [HttpPut("updateStatus/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> UpdateReservationStatus(int id, [FromBody] UpdateReservationStatusDto dto, CancellationToken cancellationToken)
        {
            var authInfo = authService.GetAuthInfoFromRequest();
            var reservation = await db.Reservations.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
            if (reservation == null) return NotFound("Reservation not found");

            if (reservation.OwnerId != authInfo.UserId && !authInfo.IsAdmin && !authInfo.IsEmployee)
                return Unauthorized("Not authorized to update this reservation");

            reservation.Status = dto.Status;
            await db.SaveChangesAsync(cancellationToken);

            var result = MapToDto(reservation);
            return Ok(result);
        }

        private static ReservationDto MapToDto(Reservation reservation)
        {
            var mapUserToBasic = (User u) => u == null ? null : new UserBasicInfoDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Username = u.Username,
                ProfilePhotoUrl = u.ProfilePhotoUrl,
                EmailAddress = u.EmailAdress,
                PhoneNumber = u.PhoneNumber
            };

            var mapVehicleToBasic = (Vehicle v) => v == null ? null : new VehicleBasicInfoDto
            {
                Id = v.Id,
                Title = v.Title,
                PricePerDay = v.PricePerDay,
                EngineDisplacement = v.EngineDisplacement,
                EnginePower = v.EnginePower,
                TransmissionType = v.TransmissionType,
                FuelType = v.FuelType,
                AirConditioning = v.AirConditioning,
                NumberOfSeats = v.NumberOfSeats,
                TowingHitch = v.TowingHitch,
                Description = v.Description,
                ProductionYear = v.ProductionYear,
                Avaliable = v.Avaliable,
                AverageRating = v.AverageRating,
                LastUpdated = v.LastUpdated,
                VehicleModelID = v.VehicleModelID,
                VehicleModel = v.VehicleModel,
                VehicleCategoryID = v.VehicleCategoryID,
                VehicleCategory = v.VehicleCategory,
                CityID = v.CityID,
                City = v.City,
                UserID = v.UserID,
                User = mapUserToBasic(v.User),
                VehicleImages = v.VehicleImages?.Select(img => new VehicleImageDto { Id = img.Id, ImageUrl = img.ImageUrl, PublicId = img.PublicId }).ToList() ?? new List<VehicleImageDto>()
            };

            return new ReservationDto
            {
                Id = reservation.Id,
                Status = reservation.Status,
                IsCashPayment = reservation.IsCashPayment,
                Price = reservation.Price,
                PickUpDateTime = reservation.PickUpDateTime,
                DropOffDateTime = reservation.DropOffDateTime,
                RenterId = reservation.RenterId,
                Renter = mapUserToBasic(reservation.Renter),
                OwnerId = reservation.OwnerId,
                Owner = mapUserToBasic(reservation.Owner),
                VehicleID = reservation.VehicleID,
                Vehicle = mapVehicleToBasic(reservation.Vehicle),
                PickUpCityID = reservation.PickUpCityID,
                PickUpCity = reservation.PickUpCity,
                DropOffCityID = reservation.DropOffCityID,
                DropOffCity = reservation.DropOffCity
            };
        }
    }
}
