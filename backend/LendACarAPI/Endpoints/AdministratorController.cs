using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Security;
using System.Reflection.Metadata.Ecma335;
using System.Security.Cryptography;
using System.Text;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdministratorController(ApplicationDbContext db, IAuthService authService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<string>> RegisterAdministrator([FromBody] AdministratorRegisterDto registerAdmin,CancellationToken cancellationToken)
        {
            var hmac = new HMACSHA256();

            if(await AdminExists(registerAdmin.Username, registerAdmin.EmailAdress)) { return BadRequest("Username or email is taken"); }

            var newAdmin = new Administrator
            {
                FirstName = registerAdmin.FirstName,
                LastName = registerAdmin.LastName,
                BirthDate = DateTime.Parse(registerAdmin.BirthDate),
                PhoneNumber = registerAdmin.PhoneNumber,
                CityId = registerAdmin.CityId,
                EmailAdress = registerAdmin.EmailAdress,
                Username = registerAdmin.Username,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerAdmin.Password)),
                PasswordSalt = hmac.Key,
                IsAdmin=true
            };

            db.Administrators.Add(newAdmin);
           await db.SaveChangesAsync(cancellationToken);

            return Created();
        }

        [HttpPost("login")]

        public async Task<ActionResult<AdministratorDto>> LoginAdmin([FromBody] AdministratorLoginDto adminLogin, CancellationToken cancellationToken)
        {
            var admin = await db.Administrators
            .Include(e => e.City)
            .Include(e => e.City != null ? e.City.Country : null)
            .FirstOrDefaultAsync(e => e.EmailAdress.ToLower() == adminLogin.EmailAddress.ToLower(),cancellationToken);

            if(admin == null)
                return Unauthorized("Invalid credentials");

            var hmac = new HMACSHA256(admin.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(adminLogin.Password));

            var token = authService.CreatToken(admin);

            for (var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != admin.PasswordHash[i]) 
                    return Unauthorized("Invalid credentials");
            }

            return Ok(new AdministratorDto
            {
                Id = admin.Id,
                FirstName = admin.FirstName,
                LastName = admin.LastName,
                PhoneNumber = admin.PhoneNumber,
                BirthDate = admin.BirthDate.ToString("dd.MM.yyyy"),
                City = admin.City,
                CityId = admin.CityId,
                EmailAddress = admin.EmailAdress,
                Username = admin.Username,
                Token=token

            });

        }

        [HttpPut("update/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<IActionResult> EditAdministrator(int id, [FromBody] AdministratorDto adminDto, CancellationToken cancellationToken)
        {
            var admin = await db.Administrators
                .Include(e => e.City)
                .Include(u => u.City != null ? u.City.Country : null)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (admin == null) return NotFound("Administrator not found");

            admin.PhoneNumber = adminDto.PhoneNumber;
            admin.CityId = adminDto.CityId;

            await db.SaveChangesAsync(cancellationToken);

            var returnAdmin = await db.Administrators
               .Include(a => a.City)
               .Include(u => u.City != null ? u.City.Country : null)
               .Select(a => new AdministratorDto
               {
                   Id = a.Id,
                   FirstName = a.FirstName,
                   LastName = a.LastName,
                   PhoneNumber = a.PhoneNumber,
                   BirthDate = a.BirthDate.ToString("dd.MM.yyyy"),
                   City = a.City,
                   CityId = a.CityId,
                   EmailAddress = a.EmailAdress,
                   Username = a.Username,
               })
               .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            return Ok(returnAdmin);

        }


        [HttpDelete("remove/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<ActionResult<string>> RemoveAdmin(int id, CancellationToken cancellationToken)
        {
            var admin = await db.Administrators
            .FirstOrDefaultAsync(a => a.Id == id,cancellationToken);

            if (admin == null) return NotFound("Administrator not found");

            db.Remove(admin);
            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }


        [HttpGet("dashboard")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<ActionResult<DashboardTotalCountsDto>> DashBoardData(CancellationToken cancellationToken)
        {
            var monthNames = new List<string>()
            {
               "", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            };


            var userCountsByMonth=await db.Users
                    .Where(u=>u.CreatedDate.Year == DateOnly.FromDateTime(DateTime.Now).Year)
                    .GroupBy(u => u.CreatedDate.Month)
                    .Select(g => new
                    {
                        Month = g.Key,
                        UserCount = g.Count()
                    })
                    .ToListAsync(cancellationToken);


            var userCountByMonth = Enumerable.Range(1, 12)
                        .Select(month => new UserCountByMonth
                        {
                            MonthName = monthNames[month],
                            UserCount = userCountsByMonth.FirstOrDefault(x => x.Month == month)?.UserCount ?? 0
                        })
                        .ToList();


            var userCount=await db.Users.CountAsync(cancellationToken);
            var vehicleCount = await db.Vehicles.CountAsync(cancellationToken);
            var employeeCount=await db.Employees.CountAsync(cancellationToken);


            return Ok(new DashboardTotalCountsDto
            {
                UserCount = userCount,
                VehicleCount = vehicleCount,
                EmployeeCount = employeeCount,
                UserCountByMonth = userCountByMonth
            });
        }


        private async Task<bool> AdminExists(string username, string email)
        {
            return await db.Administrators.AnyAsync(user => user.Username.ToLower() == username.ToLower()
            && user.EmailAdress.ToLower() == email.ToLower());
        }

    }

    public class UserCountByMonth
    {
        public string MonthName { get; set; }
        public int UserCount { get; set; }
    }
}
