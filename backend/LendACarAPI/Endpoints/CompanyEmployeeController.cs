using System.Security.Cryptography;
using System.Text;
using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
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
                .Include(ce => ce.User)              
                .Include(ce => ce.CompanyPosition)   
                .Include(ce => ce.Company)           
                .Include(ce => ce.WorkingHour)       
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
            var currentUserEmail = Request.Headers["EmailAddress"].ToString();

            if (string.IsNullOrEmpty(currentUserEmail))
            {
                return Unauthorized(new { message = "User is not authenticated." });
            }

            var companyAdmin = await _context.CompanyEmployees
                .Include(ce => ce.User)
                .FirstOrDefaultAsync(ce => ce.CompanyAdminEmail == currentUserEmail);

            if (companyAdmin == null)
            {
                return Ok(new { message = "Company admin not found." });
            }

            var companyId = companyAdmin.CompanyId;

            var companyEmployees = await _context.CompanyEmployees
                .Include(ce => ce.User)              
                .Include(ce => ce.CompanyPosition)   
                .Include(ce => ce.Company)           
                .Include(ce => ce.WorkingHour)       
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
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var employee = await _context.CompanyEmployees
                    .Include(ce => ce.WorkingHour)
                    .Include(ce => ce.User)
                    .FirstOrDefaultAsync(ce => ce.UserId == userId);

                if (employee == null)
                    return NotFound(new { message = "Employee not found." });

                if (employee.WorkingHour != null)
                    _context.WorkingHours.Remove(employee.WorkingHour);

                _context.CompanyEmployees.Remove(employee);

                if (employee.User != null)
                    _context.Users.Remove(employee.User);

                await _context.SaveChangesAsync();

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

            if (string.IsNullOrEmpty(request.FirstName) ||
                string.IsNullOrEmpty(request.LastName) ||
                string.IsNullOrEmpty(request.Email) ||
                string.IsNullOrEmpty(request.Title))
            {
                return BadRequest(new { message = "Required fields are missing." });
            }


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

            var companyPosition = await _context.CompanyPositions
                .FirstOrDefaultAsync(p => p.Name == request.Title);

            if (companyPosition == null)
            {
                companyPosition = new CompanyPosition { Name = request.Title };
                _context.CompanyPositions.Add(companyPosition);
                await _context.SaveChangesAsync();
            }

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

            if (employee.CompanyPosition != null)
                employee.CompanyPosition.Name = employeeDto.Title;
            else
                return BadRequest(new { message = "Employee does not have a valid company position." });

            employee.User.FirstName = employeeDto.FirstName;
            employee.User.LastName = employeeDto.LastName;
            employee.User.EmailAdress = employeeDto.Email;
            employee.User.PhoneNumber = employeeDto.PhoneNumber;
            employee.User.BirthDate = DateTime.Parse(employeeDto.BirthDate);

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