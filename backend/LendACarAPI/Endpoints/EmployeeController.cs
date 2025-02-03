using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using LendACarAPI.Filters;
using LendACarAPI.Services;
using LendACarAPI.Helper;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController(ApplicationDbContext db, IRenderPDFReport renderPDF) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<string>> RegisterEmployee([FromBody] RegisterEmployeeDto registerEmployee)
        {
            using var hmac = new HMACSHA256();

            if (await EmployeeExists(registerEmployee.Username, registerEmployee.EmailAddress)) { return BadRequest("Username or email is taken"); }

            var password = MyExtensionMethods.RandomString(10);

            var employee = new Employee
            {
                FirstName = registerEmployee.FirstName,
                LastName = registerEmployee.LastName,
                BirthDate = DateTime.Parse(registerEmployee.BirthDate),
                PhoneNumber = registerEmployee.PhoneNumber,
                CityId = registerEmployee.CityId,
                EmailAdress = registerEmployee.EmailAddress,
                Username = registerEmployee.Username,
                JobTitle = registerEmployee.JobTitle,
                WorkingHourId = registerEmployee.WorkingHourId,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)),
                PasswordSalt = hmac.Key,
                DateOfHire = registerEmployee.DateOfHire
            };

            db.Employees.Add(employee);
            await db.SaveChangesAsync();

            var pdf =renderPDF.RednderEmployeeRegitserPDF(registerEmployee.EmailAddress,password,$"{registerEmployee.FirstName} {registerEmployee.LastName}");

            return File(pdf, "application/pdf", $"employee_{registerEmployee.FirstName}_{registerEmployee.LastName}.pdf");
        }

        [HttpPost("login")]

        public async Task<ActionResult<EmployeeDto>> LoginEmployee([FromBody] EmployeeLoginDto employeeLogin)
        {
            var employee = await db.Employees
            .Include(e => e.City)
            .Include(e => e.City != null ? e.City.Country : null)
            .Include(e => e.WorkingHour)
            .FirstOrDefaultAsync(e => e.EmailAdress.ToLower() == employeeLogin.EmailAddress.ToLower());

            if (employee == null)
                return Unauthorized("Invalid credentials");

            using var hmac = new HMACSHA256(employee.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(employeeLogin.Password));

            for (var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != employee.PasswordHash[i])
                    return Unauthorized("Invalid credentials");
            }

            return Ok(new EmployeeDto
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                PhoneNumber = employee.PhoneNumber,
                BirthDate = employee.BirthDate.ToString("dd.MM.yyyy"),
                City = employee.City,
                CityId = employee.CityId,
                EmailAddress = employee.EmailAdress,
                Username = employee.Username,
                JobTitle = employee.JobTitle,
                WorkingHour = employee.WorkingHour,
                WorkingHourId = employee.WorkingHourId,
            });

        }


        [HttpDelete("remove/{id}")]
        public async Task<ActionResult<string>> RemoveEmployee(int id)
        {
            var employee = await db.Employees
            .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null) return NotFound("Employee not found");

            db.Remove(employee);
            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> EditEmployee(int id, [FromBody] EmployeeDto employeeDto, CancellationToken cancellationToken)
        {
            var employee = await db.Employees
                .Include(e => e.City)
                .Include(u => u.City != null ? u.City.Country : null)
                .Include(e => e.WorkingHour)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (employee == null) return NotFound();

            employee.PhoneNumber = employeeDto.PhoneNumber;
            employee.CityId = employeeDto.CityId;
            employee.EmailAdress = employeeDto.EmailAddress;
            employee.FirstName = employeeDto.FirstName;
            employee.LastName = employeeDto.LastName;
            employee.Username = employeeDto.Username;
            employee.BirthDate = DateTime.Parse(employeeDto.BirthDate);
            employee.JobTitle = employeeDto.JobTitle;
            employee.DateOfHire = employeeDto.DateOfHire;

            await db.SaveChangesAsync(cancellationToken);

            var returnEmployee = await db.Employees
               .Include(e => e.City)
               .Include(u => u.City != null ? u.City.Country : null)
               .Include(e => e.WorkingHour)
               .Select(e => new EmployeeDto
               {
                   Id = e.Id,
                   FirstName = e.FirstName,
                   LastName = e.LastName,
                   PhoneNumber = e.PhoneNumber,
                   BirthDate = e.BirthDate.ToString("yyyy-MM-dd"),
                   City = e.City,
                   CityId = e.CityId,
                   EmailAddress = e.EmailAdress,
                   Username = e.Username,
                   JobTitle = e.JobTitle,
                   WorkingHour = e.WorkingHour,
                   WorkingHourId = e.WorkingHourId,
                   DateOfHire = e.DateOfHire
               })
               .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            return Ok(returnEmployee);

        }

        [HttpGet("getAll")]
        public async Task<ActionResult> GetAllEmployees(CancellationToken cancellationToken)
        {
            var employees = await db.Employees
                .Select(e => new EmployeeDto
                {
                    Id = e.Id,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    PhoneNumber = e.PhoneNumber,
                    BirthDate = e.BirthDate.ToString("yyyy-MM-dd"),
                    City = e.City,
                    CityId = e.CityId,
                    EmailAddress = e.EmailAdress,
                    Username = e.Username,
                    JobTitle = e.JobTitle,
                    WorkingHour = e.WorkingHour,
                    WorkingHourId = e.WorkingHourId,
                    DateOfHire = e.DateOfHire

                })
                .ToArrayAsync(cancellationToken);

            return Ok(employees);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDto>> GetEmployeeById(int id, CancellationToken cancellation)
        {
            var employee = await db.Employees
                .Select(e => new EmployeeDto
                {
                    Id = e.Id,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    PhoneNumber = e.PhoneNumber,
                    BirthDate = e.BirthDate.ToString("yyyy-MM-dd"),
                    City = e.City,
                    CityId = e.CityId,
                    EmailAddress = e.EmailAdress,
                    Username = e.Username,
                    JobTitle = e.JobTitle,
                    WorkingHour = e.WorkingHour,
                    WorkingHourId = e.WorkingHourId,
                    DateOfHire = e.DateOfHire

                })
                .FirstOrDefaultAsync(x => x.Id == id, cancellation);
            if (employee == null) return NotFound($"User with the given id:{id} was not found");

            return Ok(employee);
        }


        [HttpGet("filter")]
        [TypeFilter(typeof(EmployeeFilterAttribute))]
        public ActionResult<EmployeeDto[]> FilterEmployee([FromQuery] EmployeeFilterDto filterDto)
        {
            var result = HttpContext.Items["result"] as EmployeeDto[];

            return Ok(result);
        }



        private async Task<bool> EmployeeExists(string username, string email)
        {
            return await db.Employees.AnyAsync(user => user.Username.ToLower() == username.ToLower()
            && user.EmailAdress.ToLower() == email.ToLower());
        }

    }
}
