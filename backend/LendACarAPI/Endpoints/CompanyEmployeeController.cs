using System.Security.Cryptography;
using System.Text;
using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Cms;

namespace LendACarAPI.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: true)]

    public class CompanyEmployeeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompanyEmployeeController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("get/{compEmpId}")]
        public async Task<ActionResult<CompanyEmployee>> GetCompanyEmployeeById(int compEmpId)
        {
            var companyEmployees = await _context.CompanyEmployees
                .Include(ce => ce.User)              // Include User
                .Include(ce => ce.CompanyPosition)   // Include CompanyPosition
                .Include(ce => ce.Company)           // Include Company
                .Include(ce => ce.WorkingHour)       // Include WorkingHour
                .FirstOrDefaultAsync(e => e.UserId == compEmpId);

            if (companyEmployees == null)
            {
                return null;
            }

            return companyEmployees;
        }

        [HttpGet("get/all")]
        public async Task<ActionResult<IEnumerable<CompanyEmployee>>> GetAllEmployeesForAdmin()
        {
            // Get the current user's email from the request headers
            var currentUserEmail = Request.Headers["EmailAddress"].ToString();

            if (string.IsNullOrEmpty(currentUserEmail))
            {
                return Unauthorized(new { message = "User is not authenticated." });
            }

            // Step 1: Find the company admin using their email
            var companyAdmin = await _context.CompanyEmployees
                .Include(ce => ce.User)  // Include User
                .FirstOrDefaultAsync(ce => ce.CompanyAdminEmail == currentUserEmail);

            if (companyAdmin == null)
            {
                return Ok(new { message = "Company admin not found." });
            }

            // Step 2: Get the company ID from the admin
            var companyId = companyAdmin.CompanyId;

            // Step 3: Get all employees of the same company except the one with the company admin email
            var companyEmployees = await _context.CompanyEmployees
                .Include(ce => ce.User)              // Include User
                .Include(ce => ce.CompanyPosition)   // Include CompanyPosition
                .Include(ce => ce.Company)           // Include Company
                .Include(ce => ce.WorkingHour)       // Include WorkingHour
                .Where(ce => ce.CompanyId == companyId && ce.CompanyAdminEmail != currentUserEmail) // Exclude the company admin
                .ToListAsync();

            if (companyEmployees == null || !companyEmployees.Any())
            {
                return Ok(new { message = "No employees found for this company." });
            }

            return Ok(companyEmployees);
        }

        [HttpDelete("delete/{userId}")]
        public async Task<IActionResult> DeleteEmployee(int userId)
        {
            // Use a transaction to ensure all deletions succeed together
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Step 1: Find the employee with related entities
                var employee = await _context.CompanyEmployees
                    .Include(ce => ce.WorkingHour)
                    .Include(ce => ce.User)
                    .FirstOrDefaultAsync(ce => ce.UserId == userId);

                if (employee == null)
                    return NotFound(new { message = "Employee not found." });

                // Step 2: Remove related working hours if exists
                if (employee.WorkingHour != null)
                    _context.WorkingHours.Remove(employee.WorkingHour);

                // Step 3: Remove the CompanyEmployee record
                _context.CompanyEmployees.Remove(employee);

                // Step 4: Remove the User record
                if (employee.User != null)
                    _context.Users.Remove(employee.User);

                // Step 5: Save changes
                await _context.SaveChangesAsync();

                // Commit transaction
                await transaction.CommitAsync();

                return Ok(new { message = "Employee successfully deleted." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error deleting employee.", details = ex.Message });
            }
        }


        [HttpPost("add")]
        public async Task<ActionResult> AddEmployee([FromBody] AddEmployeeRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid employee data." });
            }

            // Step 1: Find the company admin using their email
            var companyAdmin = await _context.CompanyEmployees
                .Include(ce => ce.User)
                .FirstOrDefaultAsync(ce => ce.CompanyAdminEmail == request.CompanyAdminEmail);

            if (companyAdmin == null)
            {
                return NotFound(new { message = "Company admin not found." });
            }

            var companyId = companyAdmin.CompanyId;

            using var hmac = new HMACSHA256();

            var newUser = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                EmailAdress = request.Email,
                PhoneNumber = request.PhoneNumber,
                Username = request.FirstName + request.LastName,
                CityId = 1,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.EmployeePassword)),
                PasswordSalt = hmac.Key,
                CreatedDate = DateTime.UtcNow,
                IsVerified = false,
                IsAppUser = true,
                BirthDate = DateTime.Parse(request.BirthDate)
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Step 4: Handle position
            var companyPosition = await _context.CompanyPositions
                .FirstOrDefaultAsync(p => p.Name == request.Title);

            if (companyPosition == null)
            {
                companyPosition = new CompanyPosition { Name = request.Title };
                _context.CompanyPositions.Add(companyPosition);
                await _context.SaveChangesAsync();
            }

            // Step 5: Create working hours
            var newWorkingHour = new WorkingHour
            {
                StartTime = TimeOnly.Parse(request.StartTime),
                EndTime = TimeOnly.Parse(request.EndTime),
                Monday = request.Monday,
                Tuesday = request.Tuesday,
                Wednesday = request.Wednesday,
                Thursday = request.Thursday,
                Friday = request.Friday,
                Saturday = request.Saturday,
                Sunday = request.Sunday
            };

            _context.WorkingHours.Add(newWorkingHour);
            await _context.SaveChangesAsync();

            var companyEmployee = new CompanyEmployee
            {
                UserId = newUser.Id,
                CompanyPositionId = companyPosition.Id,
                CompanyId = companyId,
                CompanyAdminEmail = null,
                WorkingHourId = newWorkingHour.Id,
                BirthDate = DateTime.Parse(request.BirthDate),
            };

            _context.CompanyEmployees.Add(companyEmployee);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Employee added successfully.", username = newUser.Username, id=newUser.Id });
        }

        [HttpPut("UpdateEmployee")]
        public async Task<IActionResult> UpdateEmployee([FromBody] UpdateEmployeeDto employeeDto)
        {
            if (employeeDto == null)
                return BadRequest(new { message = "Invalid data." });

            if (string.IsNullOrEmpty(employeeDto.FirstName) ||
                string.IsNullOrEmpty(employeeDto.LastName) ||
                string.IsNullOrEmpty(employeeDto.Email))
            {
                return BadRequest(new { message = "Required fields are missing." });
            }

            var employee = await _context.CompanyEmployees
                                         .Include(e => e.User)
                                         .Include(e => e.CompanyPosition)
                                         .Include(e => e.WorkingHour)
                                         .FirstOrDefaultAsync(e => e.UserId == employeeDto.UserId);

            if (employee == null)
                return NotFound(new { message = "Employee not found." });

            // Update company position
            if (employee.CompanyPosition != null)
                employee.CompanyPosition.Name = employeeDto.Title;
            else
                return BadRequest(new { message = "Employee does not have a valid company position." });

            // Update user info
            employee.User.FirstName = employeeDto.FirstName;
            employee.User.LastName = employeeDto.LastName;
            employee.User.EmailAdress = employeeDto.Email;
            employee.User.PhoneNumber = employeeDto.PhoneNumber;
            employee.User.BirthDate = DateTime.Parse(employeeDto.BirthDate);

            // Update working hours
            if (employee.WorkingHour != null)
            {
                employee.WorkingHour.StartTime = TimeOnly.Parse(employeeDto.StartTime);
                employee.WorkingHour.EndTime = TimeOnly.Parse(employeeDto.EndTime);
                employee.WorkingHour.Monday = employeeDto.Monday;
                employee.WorkingHour.Tuesday = employeeDto.Tuesday;
                employee.WorkingHour.Wednesday = employeeDto.Wednesday;
                employee.WorkingHour.Thursday = employeeDto.Thursday;
                employee.WorkingHour.Friday = employeeDto.Friday;
                employee.WorkingHour.Saturday = employeeDto.Saturday;
                employee.WorkingHour.Sunday = employeeDto.Sunday;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Employee updated successfully.", employee.UserId });
        }


        [HttpGet("admin-email/{userId}")]
        public IActionResult GetCompanyAdminEmail(int userId)
        {
            var companyEmployee = _context.CompanyEmployees
                                          .FirstOrDefault(e => e.UserId == userId && e.CompanyAdminEmail != null);

            if (companyEmployee != null)
            {
                return Ok(new { companyAdminEmail = companyEmployee.CompanyAdminEmail });
            }
            else
            {
                return Ok(new { error = "Company Admin Email hasn't been found for this user!" });
            }
        }




    }
}