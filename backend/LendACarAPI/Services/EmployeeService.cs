using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace LendACarAPI.Services
{
    public class EmployeeService(ApplicationDbContext db) : IEmployeeService
    {
        public IQueryable<EmployeeDto> GetFilteredEmployees(EmployeeFilterDto filter)
        {
            var query = db.Employees
                .Include(e => e.City)
                .ThenInclude(c => c.Country)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filter.Name))
            {
                var search = filter.Name.ToLower();
                query = query.Where(e => e.FirstName.ToLower().Contains(search) || e.LastName.ToLower().Contains(search));
            }

            if (filter.CityId != null)
            {
                query = query.Where(e => e.CityId == filter.CityId);
            }

            if (filter.CountryId != null)
            {
                query = query.Where(e => e.City.CountryId == filter.CountryId);
            }

            if (!string.IsNullOrEmpty(filter.JobTitle))
            {
                var jobSearch = filter.JobTitle.ToLower();
                query = query.Where(e => e.JobTitle.ToLower().Contains(jobSearch));
            }

            if (filter.AgeFrom != null)
            {
                var maxBirthDate = DateTime.Today.AddYears(-filter.AgeFrom.Value);
                query = query.Where(e => e.BirthDate <= maxBirthDate);
            }

            if (filter.AgeTo != null)
            {
                var minBirthDate = DateTime.Today.AddYears(-filter.AgeTo.Value - 1).AddDays(1);
                query = query.Where(e => e.BirthDate >= minBirthDate);
            }

            return query.Select(e => new EmployeeDto
            {
                Id = e.Id,
                FirstName = e.FirstName,
                LastName = e.LastName,
                PhoneNumber = e.PhoneNumber,
                BirthDate = e.BirthDate.ToString("yyyy-MM-dd"),
                City = e.City,
                CityId = e.CityId,
                EmailAddress = e.EmailAdress,
                Username = e.Username,
                JobTitle = e.JobTitle,
                WorkingHour = e.WorkingHour,
                WorkingHourId = e.WorkingHourId,
                DateOfHire = e.DateOfHire,
                ProfilePhotoUrl = e.ProfilePhotoUrl
            });
        }
    }
}
