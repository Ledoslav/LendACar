using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using System.Security.Cryptography;
using System.Text;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(ApplicationDbContext db) : ControllerBase
    {

        [HttpGet("getById/{id}")]
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            var user= await db.Users
                .Include(u=>u.City)
                .Include(u => u.City != null ? u.City.Country : null)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) throw new Exception("User not found");

            var userDto = new UserDto()
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                BirthDate = user.BirthDate.ToString("dd.MM.yyyy"),
                City = user.City,
                CityId = user.CityId,
                EmailAddress = user.EmailAdress,
                Username=user.Username,
                AverageRating = user.AverageRating,
                IsVerified = user.IsVerified
            };

            return Ok(userDto);
        }

        [HttpPost("register")]
        public async Task<ActionResult<string>> RegisterUser([FromBody]RegisterUserDto user)
        {
            if (await UserExists(user.Username, user.EmailAdress)) return BadRequest("Username or email is taken");

            using var hmac=new HMACSHA256();


            var createdUser = new User()
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                BirthDate = DateTime.Parse(user.BirthDate),
                CityId = user.CityId,
                EmailAdress = user.EmailAdress,
                Username = user.Username,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(user.Password)),
                PasswordSalt = hmac.Key,
                CreatedDate=DateTime.Now,
                IsVerified = false,
            };

            db.Users.Add(createdUser);
            await db.SaveChangesAsync();    

            return Created();
        }


        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> LoginUser([FromBody] LoginUserDto userLogin)
        {
            var user = await db.Users
                .Include(u=>u.City)
                .Include(u => u.City != null ? u.City.Country : null)
                .FirstOrDefaultAsync(u => u.Username.ToLower() == userLogin.Username.ToLower());

            if (user == null) return Unauthorized("Invalid credentials");

            using var hmac=new HMACSHA256(user.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(userLogin.Password));

            for(var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid credentials");
            }

            return Ok(new UserDto
            {
                Id= user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                BirthDate = user.BirthDate.ToString("dd.MM.yyyy"),
                City = user.City,
                CityId = user.CityId,
                EmailAddress = user.EmailAdress,
                Username = user.Username,
                AverageRating = user.AverageRating,
                IsVerified = user.IsVerified
            });
        }



        [HttpPut("update/{id}")]
        public async Task<IActionResult> EditUser([FromBody]UserDto updatedUser,int id)
        {
            var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("User not found");

            user.FirstName = updatedUser.FirstName; 
            user.LastName = updatedUser.LastName;
            user.EmailAdress = updatedUser.EmailAddress;
            user.PhoneNumber= updatedUser.PhoneNumber;
            user.CityId = updatedUser.CityId;

            await db.SaveChangesAsync();

            var returnUser = await db.Users
            .Include(u => u.City)
            .Include(u => u.City != null ? u.City.Country : null)
            .FirstOrDefaultAsync(u => u.Id == id);



            return Ok(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                BirthDate = user.BirthDate.ToString("dd.MM.yyyy"),
                City = user.City,
                CityId = user.CityId,
                EmailAddress = user.EmailAdress,
                Username = user.Username,
                AverageRating = user.AverageRating,
            });
        }


        [HttpPut("verifyUser/{id}")]
        public async Task<IActionResult> VerifyUser([FromBody] UserDto verifiedUser, int id)
        {
            var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("User not found");

            if (user.IsVerified == true) return BadRequest("The user is already verified!");

            user.IsVerified = true;

            await db.SaveChangesAsync();

            var returnUser = await db.Users
            .Include(u => u.City)
            .Include(u => u.City != null ? u.City.Country : null)
            .FirstOrDefaultAsync(u => u.Id == id);



            return Ok(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                BirthDate = user.BirthDate.ToString("dd.MM.yyyy"),
                City = user.City,
                CityId = user.CityId,
                EmailAddress = user.EmailAdress,
                Username = user.Username,
                AverageRating = user.AverageRating,
                IsVerified = user.IsVerified,
            });
        }


        [HttpDelete("remove/{id}")]
        public async Task<ActionResult<string>> RemoveUser(int id)
        {
            var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("User not found");

            db.Remove(user);
            await db.SaveChangesAsync();

            return Ok();
        }


        private async Task<bool> UserExists(string username,string email)
        {
            return await db.Users.AnyAsync(user => user.Username.ToLower() == username.ToLower()
            && user.EmailAdress.ToLower()==email.ToLower());

            // dodati i provjeru da li email ili username je koristen u admin, employee ili company employee tabeli
        }
    }
}
