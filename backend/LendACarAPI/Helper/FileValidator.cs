using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;

namespace LendACarAPI.Helper
{
    public static class FileValidator
    {
        private const long MaxImageSize = 5 * 1024 * 1024; // 5 MB
        private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private static readonly string[] AllowedImageMimeTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };

        public static void ValidateImage(IFormFile file)
        {
            ValidateFile(file, MaxImageSize, AllowedImageExtensions, AllowedImageMimeTypes);

            // Magic Bytes Check for Images
            using var stream = file.OpenReadStream();
            using var reader = new BinaryReader(stream);
            var headerBytes = reader.ReadBytes(8);

            if (!IsValidImageHeader(headerBytes))
                throw new ArgumentException("File content does not match common image formats.");
        }

        public static void ValidateFile(IFormFile file, long maxSize, string[] allowedExtensions, string[] allowedMimeTypes)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or not provided.");

            if (file.Length > maxSize)
                throw new ArgumentException($"File size exceeds the limit of {maxSize / 1024 / 1024}MB.");

            // 1. Extension check
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (allowedExtensions != null && !allowedExtensions.Contains(extension))
                throw new ArgumentException("Unsupported file extension.");

            // 2. MIME type check
            if (allowedMimeTypes != null && !allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                throw new ArgumentException("Unsupported MIME type.");

            // 3. Filename sanitization (Path Traversal protection)
            var fileName = Path.GetFileName(file.FileName); 
            if (string.IsNullOrEmpty(fileName) || fileName.Contains("/") || fileName.Contains("\\") || fileName.Contains("..") || fileName.Any(c => Path.GetInvalidFileNameChars().Contains(c)))
                throw new ArgumentException("Invalid filename characters detected.");
        }

        private static bool IsValidImageHeader(byte[] header)
        {
            if (header.Length < 4) return false;

            // JPEG: FF D8 FF
            if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) return true;

            // PNG: 89 50 4E 47
            if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) return true;

            // GIF: 47 49 46 38
            if (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38) return true;

            // WebP (RIFF + WEBP): RIFF (52 49 46 46) + WEBP (57 45 42 50)
            if (header.Length >= 4 && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46)
            {
                return true; 
            }

            return false;
        }
    }
}
