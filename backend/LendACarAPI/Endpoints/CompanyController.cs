using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace LendACarAPI.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompanyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // This endpoint checks if the logged-in user has a company
        [HttpGet("check/{userId}")]
        public async Task<ActionResult<bool>> CheckIfCompanyExists(int userId)
        {
            // Check if the user has a company by matching the UserId
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);  // Assumes that Company has UserId

            if (company == null)
            {
                return false;  // Return false if no company exists
            }

            return true;  // Return true if a company exists
        }

        // You could also return company details if necessary
        [HttpGet("get/{userId}")]
        public async Task<ActionResult<Company>> GetCompanyByUserId(int userId)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
            {
                return NotFound("No company found for this user.");
            }

            return company;
        }

        // CompanyController.cs
        [HttpPost("create")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<ActionResult<Company>> CreateCompany([FromForm] CompanyCreateRequest request)
        {
            // Check if the user already has a company
            var existingCompany = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == request.UserId);

            if (existingCompany != null)
            {
                return BadRequest("This user already has a company.");
            }

            // Create default WorkingHours if they don't exist
            var workingHour = await _context.WorkingHours
                .FirstOrDefaultAsync(wh => wh.StartTime == new TimeOnly(9, 0) && wh.EndTime == new TimeOnly(17, 0));

            if (workingHour == null)
            {
                workingHour = new WorkingHour
                {
                    StartTime = new TimeOnly(9, 0), // Default to 9:00 AM if not provided
                    EndTime = new TimeOnly(17, 0), // Default to 5:00 PM if not provided
                    Monday = true,
                    Tuesday = true,
                    Wednesday = true,
                    Thursday = true,
                    Friday = true,
                    Saturday = true,
                    Sunday = true
                };

                _context.WorkingHours.Add(workingHour);
                await _context.SaveChangesAsync();
            }

            // Create default CompanyPosition if it doesn't exist
            var companyPosition = await _context.CompanyPositions
                .FirstOrDefaultAsync(cp => cp.Name == "Admin");

            if (companyPosition == null)
            {
                companyPosition = new CompanyPosition
                {
                    Name = "Admin",
                    Description = "Company Administrator"
                };

                _context.CompanyPositions.Add(companyPosition);
                await _context.SaveChangesAsync();
            }

            // Map the incoming request to the company model
            var company = new Company
            {
                CompanyName = request.CompanyName,
                CompanyPhone = request.CompanyPhone,
                CompanyDescription = request.CompanyDescription,
                CompanyEmail = request.CompanyEmail,
                CompanyAddress = request.CompanyAddress,
                UserId = request.UserId,
                AverageRating = 0.0 // Initial average rating
            };

            // Handle avatar if it's provided
            if (request.CompanyAvatar != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await request.CompanyAvatar.CopyToAsync(memoryStream);
                    company.CompanyAvatar = memoryStream.ToArray();
                }
            }

            // Add the company to the database
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            // Retrieve the user's email to set as the admin email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId);

            if (user == null)
            {
                return BadRequest("User not found.");
            }

            // Create the CompanyEmployee entry, making the user an admin
            var companyEmployee = new CompanyEmployee
            {
                UserId = request.UserId, // The current user's ID
                CompanyId = company.Id,  // The newly created company's ID
                CompanyAdminEmail = user.EmailAdress, // Set the admin email to the user's email
                CompanyPositionId = companyPosition.Id, // Link to the default 'Admin' position
                WorkingHourId = workingHour.Id // Link the newly created working hours to the employee
            };

            // Add the employee to the CompanyEmployee table
            _context.CompanyEmployees.Add(companyEmployee);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCompanyByUserId), new { userId = company.UserId }, company);
        }

        [HttpDelete("deleteByUser/{userId}")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<IActionResult> DeleteCompanyByUserId(int userId)
        {
            // Fetch the company associated with the user/owner
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
            {
                return NotFound("Company not found for this user.");
            }

            int companyId = company.Id;

            // Fetch related CompanyEmployees
            var companyEmployees = await _context.CompanyEmployees
                .Where(ce => ce.CompanyId == companyId)
                .ToListAsync();

            // Step 1: Delete WorkingHours related to CompanyEmployee
            var workingHoursIds = companyEmployees.Select(ce => ce.WorkingHourId).ToList();
            var workingHoursToDelete = await _context.WorkingHours
                .Where(wh => workingHoursIds.Contains(wh.Id))
                .ToListAsync();

            _context.WorkingHours.RemoveRange(workingHoursToDelete);

            // Step 2: Delete CompanyPositions related to CompanyEmployee
            var companyPositionIds = companyEmployees.Select(ce => ce.CompanyPositionId).ToList();
            var companyPositionsToDelete = await _context.CompanyPositions
                .Where(cp => companyPositionIds.Contains(cp.Id))
                .ToListAsync();

            _context.CompanyPositions.RemoveRange(companyPositionsToDelete);

            // Step 3: Delete all users related to the company, excluding the owner
            var usersToDelete = companyEmployees
                .Where(ce => ce.UserId != userId) // Exclude the owner
                .Select(ce => ce.User)
                .ToList();

            _context.Users.RemoveRange(usersToDelete);

            // Step 4: Delete CompanyEmployees
            _context.CompanyEmployees.RemoveRange(companyEmployees);

            // Step 5: Delete the company itself
            _context.Companies.Remove(company);

            // Save changes to the database
            await _context.SaveChangesAsync();

            return NoContent();
        }






        [HttpPut("updateByUser/{userId}")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<IActionResult> UpdateCompanyByUserId(int userId, [FromForm] CompanyUpdateRequest request)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
            {
                return NotFound("Company not found for this user.");
            }

            // Update the company details
            company.CompanyName = request.CompanyName ?? company.CompanyName;
            company.CompanyPhone = request.CompanyPhone ?? company.CompanyPhone;
            company.CompanyEmail = request.CompanyEmail ?? company.CompanyEmail;
            company.CompanyDescription = request.CompanyDescription ?? company.CompanyDescription;
            company.CompanyAddress = request.CompanyAddress ?? company.CompanyAddress;

            // Handle avatar update if provided
            if (request.CompanyAvatar != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await request.CompanyAvatar.CopyToAsync(memoryStream);
                    company.CompanyAvatar = memoryStream.ToArray();
                }
            }

            await _context.SaveChangesAsync();

            return NoContent(); // Return 204 No Content
        }



    }
}
