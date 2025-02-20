using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Http;

namespace LendACarAPI.Endpoints{
    [ApiController]
    [Route("api/[controller]")]
    public class VehicleModelAndBrandController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VehicleModelAndBrandController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("getModel/all")]
        public async Task<ActionResult<IEnumerable<VehicleModel>>> GetAllVehicleModels()
        {
            var VehicleModels = await _context.VehicleModels
                .Include(ce => ce.VehicleBrand)
                .ToListAsync();

            if (VehicleModels.Count<1)
                return NotFound(new { message = "No vehicle models found!" });

            return Ok(VehicleModels);
        
        }

        [HttpGet("getBrand/all")]
        public async Task<ActionResult<IEnumerable<VehicleModel>>> GetAllVehicleBrands()
        {
            var VehicleBrands = await _context.VehicleBrands
            .ToListAsync();

            if (VehicleBrands.Count < 1)
                return NotFound(new { message = "No vehicle brands found!" });

            return Ok(VehicleBrands);

        }

        [HttpGet("getModel/{vehicleId}")]
        public async Task<ActionResult<VehicleModel>> GetVehicleModelById(int vehicleId)
        {
            var VehicleModels = await _context.VehicleModels
                .Where(ce => ce.Id == vehicleId)
                .ToListAsync();

            if (VehicleModels.Count < 1)
                return NotFound(new { message = "No vehicle models found!" });

            return Ok(VehicleModels);
        }

        [HttpGet("getModelsByBrandId/{brandId}")]
        public async Task<ActionResult<VehicleModel>> GetVehicleModelByBrandId(int brandId)
        {
            var VehicleModels = await _context.VehicleModels
                .Where(vm => vm.VehicleBrandId == brandId)
                .ToListAsync();

            if (VehicleModels.Count < 1)
                return NotFound(new { message = "No vehicle models found!" });

            return Ok(VehicleModels);
        }

        [HttpGet("getBrand/{brandId}")]
        public async Task<ActionResult<VehicleModel>> GetVehicleBrandById(int brandId)
        {
            var VehicleBrands = await _context.VehicleBrands
                .Where(ce => ce.Id == brandId)
                .ToListAsync();

            if (VehicleBrands.Count<1)
                return NotFound(new { message = "No vehicle brands found!" });

            return Ok(VehicleBrands);
        }

        [HttpPost("add")]
        public async Task<ActionResult<VehicleModel>> AddVehicleModel([FromBody] AddVehicleModelRequest request)
        {
            // Check if the brand already exists
            var existingBrand = await _context.VehicleBrands
                .FirstOrDefaultAsync(e => e.BrandName == request.BrandName);

            VehicleBrand brand;

            if (existingBrand == null)
            {
                // Create a new brand if it doesn't exist
                brand = new VehicleBrand
                {
                    BrandName = request.BrandName,
                    Icon = request.Icon
                };

                _context.VehicleBrands.Add(brand);
                await _context.SaveChangesAsync(); // Ensure the ID is generated
            }
            else
            {
                brand = existingBrand;
            }

            // Create a new vehicle model
            var newVehicleModel = new VehicleModel
            {
                ModelName = request.ModelName,
                VehicleBrandId = brand.Id // Use the existing or newly created brand ID
            };

            _context.VehicleModels.Add(newVehicleModel);
            await _context.SaveChangesAsync();

            var VehicleModelWithBrand = await _context.VehicleModels
                .Include(c => c.VehicleBrand)
                .FirstOrDefaultAsync(c => c.Id == newVehicleModel.Id);

            return Ok(VehicleModelWithBrand);
        }

        [HttpDelete("deleteModel/{vehicleModelId}")]

        public async Task<ActionResult> DeleteVehicleModelById(int vehicleModelId)
        {
            var vehicleModelToDelete = await _context.VehicleModels
                .FirstOrDefaultAsync(c => c.Id == vehicleModelId);

            if(vehicleModelToDelete == null)
            {
                return NotFound(new { message = "Vehicle model is not found!" });
            }

            _context.VehicleModels.Remove(vehicleModelToDelete);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Succesfully deleted vehicle model!" });
        }

        [HttpDelete("deleteBrand/{vehicleBrandId}")]

        public async Task<ActionResult> DeleteVehicleBrandById(int vehicleBrandId)
        {
            var vehicleBrandToDelete = await _context.VehicleBrands
                .FirstOrDefaultAsync(c => c.Id == vehicleBrandId);

            var vehicleModelsToDelete = await _context.VehicleModels
                .Where(c => c.VehicleBrandId == vehicleBrandId)
                .ToListAsync();

            if(vehicleBrandToDelete == null)
            {
                return NotFound(new { message = "Vehicle brand is not found!" });
            }

            if (vehicleModelsToDelete == null)
            {
                return NotFound(new { message = "Vehicle models are not found!" });
            }

            foreach (var vehicleModel in vehicleModelsToDelete)
            {
                _context.VehicleModels.Remove(vehicleModel);
                await _context.SaveChangesAsync();
            }

            _context.VehicleBrands.Remove(vehicleBrandToDelete);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Succesfully deleted vehicle brand!" });
        }

        [HttpPut("update/vehicle")]
        public async Task<IActionResult> UpdateModelById([FromBody] UpdateVehicleRequest request)
        {
            var vehicleModelToUpdate = await _context.VehicleModels
                .FirstOrDefaultAsync(c => c.ModelName.ToUpper() == request.ModelName.ToUpper());

            var vehicleBrandToUpdate = await _context.VehicleBrands
                .FirstOrDefaultAsync(c => c.BrandName.ToUpper() == request.BrandName.ToUpper());

            if (vehicleModelToUpdate == null)
            {
                return NotFound(new { message = "Model not found, update aborted" });
            }

            if (vehicleBrandToUpdate == null)
            {
                return NotFound(new { message = "Model not found, update aborted" });
            }

            vehicleModelToUpdate.ModelName = request.newModelName;
            vehicleBrandToUpdate.BrandName = request.newBrandName;
            vehicleBrandToUpdate.Icon = request.Icon;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Update of vehicle is successful!" });
        }
    }

}