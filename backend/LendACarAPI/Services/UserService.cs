using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace LendACarAPI.Services
{
    public class UserService(ApplicationDbContext db) : IUserService
    {
        public IQueryable<UserDto> GetFilteredUsers(UserFilterDto filter)
        {
            var query = db.Users
                       .Include(u => u.City)
                       .ThenInclude(c => c.Country)
                       .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Name))
            {
                var search = filter.Name.ToLower();
                query = query.Where(u => u.FirstName.ToLower().Contains(search)
                || u.LastName.ToLower().Contains(search) 
                || u.Username.ToLower().Contains(search));
            }

            if (filter.CityId != null)
            {
                query = query.Where(u => u.CityId == filter.CityId);
            }

            if (filter.CountryId != null)
            {
                query = query.Where(u => u.City.CountryId == filter.CountryId);
            }

            if (filter.IsVerified != null)
            {
                query = query.Where(u => u.IsVerified == filter.IsVerified);
            }

            if (filter.AgeFrom != null)
            {
                var maxBirthDate = DateTime.Today.AddYears(-filter.AgeFrom.Value);
                query = query.Where(u => u.BirthDate <= maxBirthDate);
            }

            if (filter.AgeTo != null)
            {
                var minBirthDate = DateTime.Today.AddYears(-filter.AgeTo.Value - 1).AddDays(1);
                query = query.Where(u => u.BirthDate >= minBirthDate);
            }

            return query.Select(user => new UserDto()
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                BirthDate = user.BirthDate.ToString("yyyy-MM-dd"),
                City = user.City,
                CityId = user.CityId,
                EmailAddress = user.EmailAdress,
                Username = user.Username,
                AverageRating = user.AverageRating,
                IsVerified = user.IsVerified,
                ProfilePhotoUrl = user.ProfilePhotoUrl
            });
        }
    }
}
