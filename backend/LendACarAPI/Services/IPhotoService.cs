using CloudinaryDotNet.Actions;

namespace LendACarAPI.Services
{
    public interface IPhotoService
    {
        Task<ImageUploadResult> AddPhotoAsync(IFormFile file);
        Task<ImageUploadResult> AddVehiclePhotoAsync(IFormFile file);
        Task<DeletionResult> DeletePhotoAsync(string publicId);
    }
}
