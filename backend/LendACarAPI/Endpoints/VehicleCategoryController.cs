using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using LendACarAPI.Migrations;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleCategoryController(ApplicationDbContext db) : ControllerBase
    {
        [HttpGet("get")]
        public async Task<ActionResult<VehicleCategory[]>> GetAllCategories()
        {
            var categories = await db.VehicleCategories.ToArrayAsync();
            return Ok(categories);
        }

        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetVehicleCategoryById(int id)
        {
            var vehicleCategory = await db.VehicleCategories.FirstOrDefaultAsync(vc => vc.Id == id);

            if (vehicleCategory == null) return NotFound("Vehicle category not found");

            var vehicleCategoryDto = new VehicleCategoryDto
            {
                Id = vehicleCategory.Id,
                Name = vehicleCategory.Name,
                Description = vehicleCategory.Description,
                Icon = vehicleCategory.Icon,
            };

            return Ok(vehicleCategoryDto);
        }

        [HttpPost("addNew")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<IActionResult> AddVehicleCategory([FromBody] VehicleCategoryDto vehicleCategoryDto)
        {
            if (await VehicleCategoryExists(vehicleCategoryDto.Name))
                return BadRequest("Vehicle category already exists!");

            var newVehicleCategory = new VehicleCategory
            {
                Name = vehicleCategoryDto.Name,
                Description = vehicleCategoryDto.Description,
                Icon = vehicleCategoryDto.Icon,
            };

            db.VehicleCategories.Add(newVehicleCategory);
            await db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVehicleCategoryById), new { id = newVehicleCategory.Id }, vehicleCategoryDto);
        }

        [HttpPut("update/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<IActionResult> EditVehicleCategory(int id, [FromBody] VehicleCategoryDto updatedCategoryDto)
        {
            var vehicleCategory = await db.VehicleCategories.FirstOrDefaultAsync(vc => vc.Id == id);

            if (vehicleCategory == null) return NotFound("Vehicle category not found");

            vehicleCategory.Name = updatedCategoryDto.Name;
            vehicleCategory.Description = updatedCategoryDto.Description;
            vehicleCategory.Icon = updatedCategoryDto.Icon;

            await db.SaveChangesAsync();

            return Ok(new VehicleCategoryDto
            {
                Id = vehicleCategory.Id,
                Name = vehicleCategory.Name,
                Description = vehicleCategory.Description,
                Icon = vehicleCategory.Icon,
            });
        }

        [HttpDelete("remove/{id}")]
        [MyAuthorization(IsAdmin: true, IsEmployee: false, isAppUser: false)]
        public async Task<IActionResult> RemoveVehicleCategory(int id)
        {
            var vehicleCategory = await db.VehicleCategories.FirstOrDefaultAsync(vc => vc.Id == id);

            if (vehicleCategory == null) return NotFound("Vehicle category not found");

            db.VehicleCategories.Remove(vehicleCategory);
            await db.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> VehicleCategoryExists(string categoryName)
        {
            return await db.VehicleCategories.AnyAsync(vc => vc.Name.ToLower() == categoryName.ToLower());
        }
    }

}
