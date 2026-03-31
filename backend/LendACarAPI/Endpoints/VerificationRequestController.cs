using Azure.Core;
using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Migrations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using LendACarAPI.Services;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class VerificationRequestController(ApplicationDbContext db, IAuthService authService) : ControllerBase
    {
        [HttpGet("get")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
        public async Task<ActionResult<IEnumerable<VerificationRequest>>> GetAllVerificationRequests()
        {
            var requests = await db.VerificationRequests
                .Include(vr => vr.User)
                .ThenInclude(u => u.City)
                .ToListAsync();



            return Ok(requests);
        }

        [HttpGet("getFiltered")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
        public async Task<IActionResult> GetFilteredVerificationRequests(
            [FromQuery] int? status, 
            [FromQuery] string? searchQuery, 
            [FromQuery] int? cityId)
        {
            var query = db.VerificationRequests
                .Include(vr => vr.User)
                .AsQueryable();

            if (status.HasValue && status.Value != -1)
            {
                query = query.Where(vr => vr.RequestStatus == status.Value);
            }

            if (!string.IsNullOrEmpty(searchQuery))
            {
                query = query.Where(vr => vr.User.Username.Contains(searchQuery));
            }

            if (cityId.HasValue && cityId.Value != 0)
            {
                query = query.Where(vr => vr.User.CityId == cityId.Value);
            }

            var requests = await query.ToListAsync();



            return Ok(requests);
        }

        [HttpGet("getById/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> GetVerificationRequestById(int id)
        {
            var authInfo = authService.GetAuthInfoFromRequest();
            var request = await db.VerificationRequests.FirstOrDefaultAsync(vr => vr.Id == id);

            if (request == null) return NotFound("Verification request not found");

            if (request.UserId != authInfo.UserId && !authInfo.IsAdmin && !authInfo.IsEmployee)
                return Unauthorized("Not authorized");

            var verificationRequest = new VerificationDto
            {
                Id = request.Id,
                RequestDate = request.RequestDate,
                UserId = request.UserId,
                RequestComment = request.RequestComment,
                RequestReviewDate = request.RequestReviewDate,
                RequestStatus = request.RequestStatus,
                DenialComment = request.DenialComment,
                EmpAdmId = request.EmpAdmId,
                RevievedByAdmin = request.RevievedByAdmin,
            };

            return Ok(verificationRequest);
        }

        [HttpGet("getByUsername/{username}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> GetVerificationRequestByUsername(string username)
        {
            var authInfo = authService.GetAuthInfoFromRequest();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return NotFound("Username doesn't exist.");

            if (user.Id != authInfo.UserId && !authInfo.IsAdmin && !authInfo.IsEmployee)
                return Unauthorized("Not authorized");

            var request = await db.VerificationRequests.FirstOrDefaultAsync(vr => vr.UserId == user.Id);
            if (request == null) return NotFound("User hasn't submited a request.");


            var verificationRequest = new VerificationDto
            {
                Id = request.Id,
                RequestDate = request.RequestDate,
                UserId = request.UserId,
                RequestComment = request.RequestComment,
                RequestReviewDate = request.RequestReviewDate,
                RequestStatus = request.RequestStatus,
                DenialComment = request.DenialComment,
                EmpAdmId = request.EmpAdmId,
                RevievedByAdmin = request.RevievedByAdmin,
            };

            return Ok(verificationRequest);
        }

        [HttpGet("getByUserId/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> GetVerificationRequestByUserId(int id)
        {
            var authInfo = authService.GetAuthInfoFromRequest();
            if (id != authInfo.UserId && !authInfo.IsAdmin && !authInfo.IsEmployee)
                return Unauthorized("Not authorized");

            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound("User doesn't exist.");

            var request = await db.VerificationRequests.FirstOrDefaultAsync(vr => vr.UserId == user.Id);
            if (request == null) return BadRequest("User hasn't submited a request.");

            var verificationRequest = new VerificationDto
            {
                Id = request.Id,
                RequestDate = request.RequestDate,
                UserId = request.UserId,
                RequestComment = request.RequestComment,
                RequestReviewDate = request.RequestReviewDate,
                RequestStatus = request.RequestStatus,
                DenialComment = request.DenialComment,
                EmpAdmId = request.EmpAdmId,
                RevievedByAdmin = request.RevievedByAdmin,
            };

            return Ok(verificationRequest);
        }

        [HttpPost("addNew")]
        [MyAuthorization(IsAdmin: false, IsEmployee: false, isAppUser: true)]
        public async Task<IActionResult> AddVerificationRequest([FromBody] VerificationSubmitDto verificationSubmitDto)
        {
            var authInfo = authService.GetAuthInfoFromRequest();
            verificationSubmitDto.UserId = authInfo.UserId; // Ensure user creates request for themselves

            if (await VerificationRequestExists(verificationSubmitDto.UserId))
                return BadRequest("User already submited a verification request!");

            var newVerificationRequest = new VerificationRequest
            {
                RequestDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                UserId = verificationSubmitDto.UserId,
                RequestComment = verificationSubmitDto.RequestComment,
            };

            db.VerificationRequests.Add(newVerificationRequest);
            await db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVerificationRequestById), new { id = newVerificationRequest.Id }, verificationSubmitDto);
        }

        [HttpPut("approve/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
        public async Task<IActionResult> ApproveVerificationRequest(int id, [FromBody] VerificationDto approvedVerificationRequest)
        {
            var verificationRequest = await db.VerificationRequests.FirstOrDefaultAsync(vr => vr.Id == id);
            if (verificationRequest == null) return NotFound("Verification request not found");

            var userGettingVerified = await db.Users.FirstOrDefaultAsync(u => u.Id == verificationRequest.UserId);
            if (userGettingVerified == null) return NotFound("User not found");

            userGettingVerified.IsVerified = true;

            verificationRequest.RequestReviewDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
            verificationRequest.RequestStatus = 1;
            verificationRequest.DenialComment = approvedVerificationRequest.DenialComment;
            verificationRequest.EmpAdmId = approvedVerificationRequest.EmpAdmId;
            verificationRequest.RevievedByAdmin = approvedVerificationRequest.RevievedByAdmin;

            await db.SaveChangesAsync();

            return Ok(new VerificationDto
            {
                Id = verificationRequest.Id,
                RequestDate = DateTime.SpecifyKind(verificationRequest.RequestDate, DateTimeKind.Utc),
                UserId = verificationRequest.UserId,
                RequestComment = verificationRequest.RequestComment,
                RequestReviewDate = verificationRequest.RequestReviewDate.HasValue ? 
                    DateTime.SpecifyKind(verificationRequest.RequestReviewDate.Value, DateTimeKind.Utc) : null,
                RequestStatus = verificationRequest.RequestStatus,
                DenialComment = verificationRequest.DenialComment,
                EmpAdmId = verificationRequest.EmpAdmId,
                RevievedByAdmin = verificationRequest.RevievedByAdmin,
            });
        }

        [HttpPut("deny/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: false)]
        public async Task<IActionResult> DenyVerificationRequest(int id, [FromBody] VerificationDto approvedVerificationRequest)
        {
            var verificationRequest = await db.VerificationRequests.FirstOrDefaultAsync(vr => vr.Id == id);
            if (verificationRequest == null) return NotFound("Verification request not found");

            var userGettingVerified = await db.Users.FirstOrDefaultAsync(u => u.Id == verificationRequest.UserId);
            if (userGettingVerified == null) return NotFound("User not found");

            userGettingVerified.IsVerified = false;

            verificationRequest.RequestReviewDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
            verificationRequest.RequestStatus = 0;
            verificationRequest.DenialComment = approvedVerificationRequest.DenialComment;
            verificationRequest.EmpAdmId = approvedVerificationRequest.EmpAdmId;
            verificationRequest.RevievedByAdmin = approvedVerificationRequest.RevievedByAdmin;

            await db.SaveChangesAsync();

            return Ok(new VerificationDto
            {
                Id = verificationRequest.Id,
                RequestDate = DateTime.SpecifyKind(verificationRequest.RequestDate, DateTimeKind.Utc),
                UserId = verificationRequest.UserId,
                RequestComment = verificationRequest.RequestComment,
                RequestReviewDate = verificationRequest.RequestReviewDate.HasValue ? 
                    DateTime.SpecifyKind(verificationRequest.RequestReviewDate.Value, DateTimeKind.Utc) : null,
                RequestStatus = verificationRequest.RequestStatus,
                DenialComment = verificationRequest.DenialComment,
                EmpAdmId = verificationRequest.EmpAdmId,
                RevievedByAdmin = verificationRequest.RevievedByAdmin,
            });
        }

        [HttpDelete("remove/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: true, isAppUser: true)]
        public async Task<IActionResult> DeleteVerificationRequest(int id)
        {
            var authInfo = authService.GetAuthInfoFromRequest();
            var verificationRequest = await db.VerificationRequests.FirstOrDefaultAsync(vr => vr.Id == id);

            if (verificationRequest == null) return NotFound("Verification request not found");

            if (verificationRequest.UserId != authInfo.UserId && !authInfo.IsAdmin && !authInfo.IsEmployee)
                return Unauthorized("Not authorized");

            db.VerificationRequests.Remove(verificationRequest);
            await db.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> VerificationRequestExists(int userId)
        {
            return await db.VerificationRequests.AnyAsync(vr => vr.UserId == userId);
        }
    }

}
