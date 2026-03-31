using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Filters;
using LendACarAPI.Helper;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Newtonsoft.Json.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(ApplicationDbContext db,IAuthService authService,IPhotoService photoService) : ControllerBase
    {

        [HttpGet("getById/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: true)]
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            var user= await db.Users
                .Include(u => u.City)
                .ThenInclude(c => c.Country)
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
                IsVerified = user.IsVerified,
                ProfilePhotoUrl= user.ProfilePhotoUrl,
            };

            return Ok(userDto);
        }


        [HttpGet("getAll")]
        [TypeFilter(typeof(UserFilterAttribute))]
        public async Task<ActionResult<MyPagedList<UserDto[]>>> GetAllUsers([FromQuery]MyPagingRequest pagedParams, CancellationToken cancellationToken)
        {
            var query = HttpContext.Items["users"] as IQueryable<UserDto>;

            var users = await MyPagedList<UserDto>.CreateAsync(query, pagedParams, cancellationToken);

            Response.AddPaginationHeader(users);

            if (users.DataItems.Length==0) return BadRequest();

            return Ok(users.DataItems);
        }

        [HttpPost("register")]
        public async Task<ActionResult<string>> RegisterUser([FromBody]RegisterUserDto user,CancellationToken cancellationToken)
        {
            if (await UserExists(user.Username, user.EmailAdress,cancellationToken)) return BadRequest("Username or email is taken");

            using var hmac=new HMACSHA256();

            User createdUser;



            if (user.SecurityQuestionId != null)
            {
                var questionAnswer = new UserSecurityQuestionAnswer
                {
                    SecurityQuestionId = user.SecurityQuestionId.Value,
                    AnswerHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(user.QuestionAnswer)),
                    AnswerSalt = hmac.Key,
                    AnswerAttempts = 0,
                    IsDisabled = false
                };

                db.UserSecurityQuestionAnswers.Add(questionAnswer);
                await db.SaveChangesAsync(cancellationToken);

                createdUser = new User()
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
                    CreatedDate = DateTime.UtcNow,
                    UserSecurityQuestionAnswerId = questionAnswer.Id,
                    IsVerified = false,
                    IsAppUser = true,
                };
            }

            else
            {
                createdUser = new User()
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
                    CreatedDate = DateTime.UtcNow,
                    IsVerified = false,
                    IsAppUser = true
                };
            }

            db.Users.Add(createdUser);
            await db.SaveChangesAsync(cancellationToken);    

            return Created();
        }


        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> LoginUser([FromBody] LoginUserDto userLogin,CancellationToken cancellationToken)
        {
            var user = await db.Users
                .Include(u => u.City)
                .ThenInclude(c => c.Country)
                .FirstOrDefaultAsync(u => u.Username.ToLower() == userLogin.Username.ToLower(),cancellationToken);

            if (user == null) return Unauthorized("Invalid credentials");

            using var hmac=new HMACSHA256(user.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(userLogin.Password));

            for(var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid credentials");
            }

            var token = authService.CreatToken(user);

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
                IsVerified = user.IsVerified,
                Token= token,
                UserSecurityQuestionAnswerId = user.UserSecurityQuestionAnswerId,
                ProfilePhotoUrl = user.ProfilePhotoUrl,
            });
        }



        [HttpPut("update/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false,isAppUser:true)]
        public async Task<IActionResult> EditUser([FromBody]UserDto updatedUser,int id, CancellationToken cancellationToken)
        {
            var user = await db.Users
                .Include(u => u.City)
                .ThenInclude(c => c.Country)
                .FirstOrDefaultAsync(u => u.Id == id,cancellationToken);


            if (user == null) return NotFound("User not found");

            user.FirstName = updatedUser.FirstName; 
            user.LastName = updatedUser.LastName;
            user.EmailAdress = updatedUser.EmailAddress;
            user.PhoneNumber= updatedUser.PhoneNumber;
            user.CityId = updatedUser.CityId;
            user.BirthDate =DateTime.Parse(updatedUser.BirthDate);
            user.Username = updatedUser.Username;
            user.EmailAdress = updatedUser.EmailAddress;
            user.IsVerified = updatedUser.IsVerified;

            // Handle verified status change
            if (updatedUser.isUserVerifiedStatusChanged)
            {
                if (updatedUser.IsVerified)
                {
                    var claims= authService.GetAuthInfoFromRequest();
                    var newVerificationRequest = new VerificationRequest
                    {
                        RequestDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                        UserId = id,
                        RequestComment = "",
                        RequestReviewDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                        RequestStatus = 1,
                        DenialComment = "",
                        EmpAdmId = claims.UserId, // this is the admins id
                        RevievedByAdmin = true,
                };

                   db.VerificationRequests.Add(newVerificationRequest);
                }

                else
                {
                    // User is now unverified, remove verification request if exists
                    var UserVerificationRequest = db.VerificationRequests.FirstOrDefault(u => u.UserId == id);
                    if (UserVerificationRequest != null)
                    {
                        db.VerificationRequests.Remove(UserVerificationRequest);
                    }
                }
            }

            await db.SaveChangesAsync(cancellationToken);

            return Ok(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                BirthDate = user.BirthDate.ToString("dd.MM.yyyy"),
                City = updatedUser.City,
                CityId = user.CityId,
                EmailAddress = user.EmailAdress,
                Username = user.Username,
                AverageRating = user.AverageRating,
                IsVerified = user.IsVerified,
                UserSecurityQuestionAnswerId = user.UserSecurityQuestionAnswerId,
                ProfilePhotoUrl = user.ProfilePhotoUrl,

            });
        }


        [HttpPut("verifyUser/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
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
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: true)]
        public async Task<ActionResult<string>> RemoveUser(int id,CancellationToken cancellationToken)
        {
            var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("User not found");

            var companyEmployee = await db.CompanyEmployees
                .Where(ce => ce.UserId == user.Id)
                .ToListAsync(cancellationToken);


            if (companyEmployee.Count > 0) 
                 db.RemoveRange(companyEmployee);

            var userSecurityQuestionAnswer = user.UserSecurityQuestionAnswer;
            if(userSecurityQuestionAnswer != null)
                db.UserSecurityQuestionAnswers.Remove(userSecurityQuestionAnswer);


            db.Remove(user);
            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }

        [HttpGet("filter")]
        [TypeFilter(typeof(UserFilterAttribute))]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: true)]
        public async Task<ActionResult<MyPagedList<UserDto[]>>> FilterUser([FromQuery] UserFilterDto filterDto,[FromQuery]MyPagingRequest pagingRequest, CancellationToken token)
        {
            var query = HttpContext.Items["users"] as IQueryable<UserDto>;

           
            var users = await MyPagedList<UserDto>.CreateAsync(query, pagingRequest, token);
            Response.AddPaginationHeader(users);


            return Ok(users.DataItems);
        }


        [HttpPost("add-profile-pic/{id}")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<ActionResult<UserDto>> AddUserProfilePic(int id,IFormFile file ,CancellationToken cancellationToken)
        {
            var user = await db.Users
                .Include(u => u.City)
                .Include(u => u.City != null ? u.City.Country : null)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

            if (user == null) return BadRequest();

            var result = await photoService.AddPhotoAsync(file);

            user.ProfilePhotoPublicId = result.PublicId;
            user.ProfilePhotoUrl = result.SecureUrl.AbsoluteUri;


            await db.SaveChangesAsync(cancellationToken);

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
                UserSecurityQuestionAnswerId = user.UserSecurityQuestionAnswerId,
                ProfilePhotoUrl = user.ProfilePhotoUrl,
            });
        }

        [HttpDelete("remove-profile-pic/{id}")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<ActionResult<UserDto>> RemoveUserProfilePic(int id, CancellationToken cancellationToken)
        {
            var user = await db.Users
                .Include(u => u.City)
                .Include(u => u.City != null ? u.City.Country : null)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

            if (user == null) return BadRequest();

            user.ProfilePhotoPublicId = null;
            user.ProfilePhotoUrl = null;


            await db.SaveChangesAsync(cancellationToken);

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
                UserSecurityQuestionAnswerId = user.UserSecurityQuestionAnswerId,
                ProfilePhotoUrl = user.ProfilePhotoUrl,
            });
        }




        private async Task<bool> UserExists(string username,string email,CancellationToken cancellation)
        {
            return await db.Users.AnyAsync(user => user.Username.ToLower() == username.ToLower()
            || user.EmailAdress.ToLower()==email.ToLower(),cancellation);

        }
    }
}
