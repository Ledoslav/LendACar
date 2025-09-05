using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;

namespace LendACarAPI.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary cloudinary;
        public PhotoService(IConfiguration config)
        {
            var cloudinaryCloudName = Environment.GetEnvironmentVariable("CloudinaryCloudName");

            var cloudinaryAPIKey = Environment.GetEnvironmentVariable("CloudinaryAPIKey");

            var cloudinaryAPISecret = Environment.GetEnvironmentVariable("CloudinaryAPISecret");

            //var cloudinaryCloudName = config["CloudinarySettings:CloudinaryCloudName"];
            //var cloudinaryAPIKey = config["CloudinarySettings:CloudinaryAPIKey"];
            //var cloudinaryAPISecret = config["CloudinarySettings:CloudinaryAPISecret"];

            var acc = new Account(cloudinaryCloudName, cloudinaryAPIKey, cloudinaryAPISecret);

            cloudinary = new Cloudinary(acc);
        }
        public async Task<ImageUploadResult> AddPhotoAsync(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            if(file.Length > 0)
            {
                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Transformation=new Transformation()
                    .Height(300).Width(300).Crop("fill").Gravity("face").Quality("auto:good"),
                    Folder="profile-pics"
                };

                uploadResult=await cloudinary.UploadAsync(uploadParams);
            }

            return uploadResult;

        }

        public async Task<ImageUploadResult> AddVehiclePhotoAsync(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Transformation = new Transformation()
                    .Height(450).Width(900).Crop("fill").Gravity("face").Quality("auto:good"),
                    Folder = "vehicle-pics"
                };

                uploadResult = await cloudinary.UploadAsync(uploadParams);
            }

            return uploadResult;

        }
        public async Task<DeletionResult> DeletePhotoAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);

            return await cloudinary.DestroyAsync(deleteParams);
        }
    }
}
