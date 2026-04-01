using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using LendACarAPI.Helper;

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

        [HttpGet("check/{userId}")]
        public async Task<ActionResult<bool>> CheckIfCompanyExists(int userId)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
            {
                return false;  
            }

            return true;  
        }

        [HttpGet("get/{userId}")]
        public async Task<ActionResult<Company>> GetCompanyByUserId(int userId)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
            {
                return Ok(new { message = "No company found for this user." });
            }

            return company;
        }

        [HttpPost("create")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<ActionResult<Company>> CreateCompany([FromForm] CompanyCreateRequest request)
        {
            var existingCompany = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == request.UserId);

            if (existingCompany != null)
            {
                return Ok("This user already has a company.");
            }

            var workingHour = await _context.WorkingHours
                .FirstOrDefaultAsync(wh => wh.StartTime == new TimeOnly(9, 0) && wh.EndTime == new TimeOnly(17, 0));

            if (workingHour == null)
            {
                workingHour = new WorkingHour
                {
                    StartTime = new TimeOnly(9, 0),
                    EndTime = new TimeOnly(17, 0), 
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

            var company = new Company
            {
                CompanyName = request.CompanyName,
                CompanyPhone = request.CompanyPhone,
                CompanyDescription = request.CompanyDescription,
                CompanyEmail = request.CompanyEmail,
                CompanyAddress = request.CompanyAddress,
                UserId = request.UserId,
                AverageRating = 0.0,
                FileName = request.FileName
            };

            try
            {
                if (request.CompanyAvatar != null)
                {
                    FileValidator.ValidateImage(request.CompanyAvatar);
                    using (var memoryStream = new MemoryStream())
                    {
                        await request.CompanyAvatar.CopyToAsync(memoryStream);
                        company.CompanyAvatar = memoryStream.ToArray();
                    }
                }

                if (request.File != null)
                {
                    // For the general document 'File', we'll allow 5MB but limit extensions to safe ones (docs, pdf, images)
                    FileValidator.ValidateFile(request.File, 5 * 1024 * 1024, new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" }, null);
                    using (var memoryStream = new MemoryStream())
                    {
                        await request.File.CopyToAsync(memoryStream);
                        company.File = memoryStream.ToArray();
                    }
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId);

            if (user == null)
            {
                return Ok("User not found.");
            }

            var companyEmployee = new CompanyEmployee
            {
                UserId = request.UserId, 
                CompanyId = company.Id,  
                CompanyAdminEmail = user.EmailAdress, 
                CompanyPositionId = companyPosition.Id, 
                WorkingHourId = workingHour.Id,
            };

            _context.CompanyEmployees.Add(companyEmployee);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCompanyByUserId), new { userId = company.UserId }, company);
        }

        [HttpDelete("deleteByUser/{userId}")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<IActionResult> DeleteCompanyByUserId(int userId)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound("Company not found for this user.");

            int companyId = company.Id;

            var companyEmployees = await _context.CompanyEmployees
                .Include(ce => ce.User)
                .Where(ce => ce.CompanyId == companyId)
                .ToListAsync();

            var usersToDelete = companyEmployees
                .Where(ce => ce.UserId != userId && ce.User != null)
                .Select(ce => ce.User)
                .Distinct()
                .ToList();

            _context.Users.RemoveRange(usersToDelete);

            _context.CompanyEmployees.RemoveRange(companyEmployees);

            _context.Companies.Remove(company);

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
                return Ok("Company not found for this user.");
            }

            company.CompanyName = request.CompanyName ?? company.CompanyName;
            company.CompanyPhone = request.CompanyPhone ?? company.CompanyPhone;
            company.CompanyEmail = request.CompanyEmail ?? company.CompanyEmail;
            company.CompanyDescription = request.CompanyDescription ?? company.CompanyDescription;
            company.CompanyAddress = request.CompanyAddress ?? company.CompanyAddress;
            company.FileName = request.FileName ?? company.FileName;

            try
            {
                if (request.CompanyAvatar != null)
                {
                    FileValidator.ValidateImage(request.CompanyAvatar);
                    using (var memoryStream = new MemoryStream())
                    {
                        await request.CompanyAvatar.CopyToAsync(memoryStream);
                        company.CompanyAvatar = memoryStream.ToArray();
                    }
                }

                if (request.File != null)
                {
                    FileValidator.ValidateFile(request.File, 5 * 1024 * 1024, new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" }, null);
                    using (var memoryStream = new MemoryStream())
                    {
                        await request.File.CopyToAsync(memoryStream);
                        company.File = memoryStream.ToArray();
                    }
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }



    }
}
