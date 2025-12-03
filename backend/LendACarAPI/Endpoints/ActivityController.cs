using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace LendACarAPI.Endpoints
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    namespace LendACarAPI.Endpoints
    {
        [ApiController]
        [Route("api/[controller]")]
        public class ActivityController : ControllerBase
        {
            private readonly ApplicationDbContext _context;

            public ActivityController(ApplicationDbContext context)
            {
                _context = context;
            }

            // GET: api/activity?userId=5
            [HttpGet]
            public async Task<ActionResult<IEnumerable<Activity>>> GetAllActivities([FromQuery] int userId)
            {
                var activities = await _context.Activitys
                    .Include(a => a.User)
                    .Where(x => x.UserId == userId)
                    .OrderByDescending(a => a.DateOfActivity)
                    .ToListAsync();

                return Ok(activities);
            }

            [HttpPost]
            public async Task<ActionResult<Activity>> PostActivity(ActivityCreateRequest request)
            {
                // Validate User
                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null)
                    return NotFound($"User with id {request.UserId} not found.");

                // Try to load related entities – use FirstOrDefaultAsync so you don't get exceptions
                var companyEmployee = await _context.CompanyEmployees
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(s => request.CompanyEmployeeId == s.UserId);

                var vehicle = await _context.Vehicles
                    .FirstOrDefaultAsync(s => s.Id == request.VehicleId);

                var newVehicle = await _context.Vehicles
                    .FirstOrDefaultAsync(s => s.Id == request.NewVehicleId);

                var company = await _context.Companies
                    .FirstOrDefaultAsync(s => s.UserId == request.UserId);

                var reservation = await _context.Reservations
                    .Include(r => r.Vehicle)
                    .FirstOrDefaultAsync(s => s.RenterId == request.UserId && s.VehicleID == request.VehicleId);

                // Build description safely
                string description = request.Variant switch
                {
                    // Employee
                    1 when companyEmployee?.User != null => $"New employee <b>{companyEmployee.User.Username}</b> added.",
                    2 when companyEmployee?.User != null => $"Employee <b>{companyEmployee.User.Username}</b> details updated.",
                    3 when companyEmployee?.User != null => $"Employee <b>{companyEmployee.User.Username}</b> removed.",

                    // Company
                    10 when company != null => $"Company <b>{company.CompanyName}</b> created by <b>{user.Username}</b>.",
                    11 when company != null => $"Company <b>{company.CompanyName}</b> updated.",
                    12 when company != null => $"Company <b>{company.CompanyName}</b> deleted.",

                    // Vehicle
                    20 when vehicle != null => $"New vehicle <b>{vehicle.Title}</b> saved.",
                    22 when vehicle != null => $"Vehicle <b>{vehicle.Title}</b> unsaved.",

                    // New Vehicle
                    23 when newVehicle != null => $"New vehicle <b>{newVehicle.Title}</b> added.",
                    24 when newVehicle != null => $"Vehicle <b>{newVehicle.Title}</b> deleted.",
                    25 when newVehicle != null => $"Vehicle <b>{newVehicle.Title}</b> details updated.",

                    // Reservation
                    30 when reservation?.Vehicle != null => $"Reservation for <b>{reservation.Vehicle.Title}</b> made by <b>{user.Username}</b>.",
                    32 when reservation?.Vehicle != null => $"Reservation for <b>{reservation.Vehicle.Title}</b> cancelled.",

                    // Default / fallback
                    _ => $"Activity variant {request.Variant} by <b>{user.Username}</b>."
                };


                // Optional: return BadRequest if a required entity for a variant is missing
                if (string.IsNullOrWhiteSpace(description) || description.StartsWith("Activity variant") && request.Variant is 1 or 2 or 3 or 4)
                {
                    return BadRequest("Required data for the selected variant could not be found.");
                }

                var activity = new Activity
                {
                    UserId = request.UserId,
                    Variant = request.Variant,
                    Description = description,
                    DateOfActivity = DateTime.UtcNow
                };

                try
                {
                    _context.Activitys.Add(activity);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException ex)
                {
                    // Log ex if you have logging
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        "An error occurred while saving the activity.");
                }

                return CreatedAtAction(nameof(GetAllActivities), new { id = activity.Id }, activity);
            }


            [HttpDelete("all")]
            public async Task<IActionResult> DeleteAllActivities()
            {
                var all = await _context.Activitys.ToListAsync();
                if (all.Any())
                {
                    _context.Activitys.RemoveRange(all);
                    await _context.SaveChangesAsync();
                }
                return NoContent();
            }

            [HttpDelete]
            public async Task<IActionResult> DeleteAllActivities([FromQuery] int userId)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound($"User with id {userId} not found.");

                var userActivities = await _context.Activitys
                    .Where(a => a.UserId == userId)
                    .ToListAsync();

                if (!userActivities.Any())
                    return NotFound($"No activities found for user with id {userId}.");

                _context.Activitys.RemoveRange(userActivities);
                await _context.SaveChangesAsync();

                return NoContent();
            }
        }
    }

}

public class ActivityCreateRequest
{
    public int UserId { get; set; }
    public int Variant { get; set; }
    public int CompanyEmployeeId { get; set; }
    public int VehicleId { get; set; }
    public int NewVehicleId { get; set; }
}

