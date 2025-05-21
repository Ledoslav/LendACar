using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using System.Net;

namespace LendACarAPI.Filters
{
    public class EmployeeFilterAttribute(ApplicationDbContext db) : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var queryParam = context.HttpContext.Request.Query;

            var empFilter=new EmployeeFilterDto()
            {
                Name = queryParam["name"],
                AgeFrom = int.TryParse(queryParam["ageFrom"], out var ageFrom) ? ageFrom : null,
                AgeTo= int.TryParse(queryParam["ageTo"], out var ageTo) ? ageTo : null,
                CountryId = int.TryParse(queryParam["countryId"], out var countryId) ? countryId : null,
                CityId = int.TryParse(queryParam["cityId"],out var cityId)? cityId:null,
                JobTitle = queryParam["jobTitle"],
            };

            var query = db.Employees
                .Include(e => e.City)
                .ThenInclude(c => c.Country)
                .AsQueryable();

             
            if(string.IsNullOrEmpty(empFilter.Name)&& empFilter.CountryId == null && empFilter.CityId == null && string.IsNullOrEmpty(empFilter.JobTitle) && empFilter.AgeFrom == null && empFilter.AgeTo == null)
            {
                var result = db.Employees
                    .Include(e => e.City)
                    .ThenInclude(c => c.Country)
                    .Select(e => new EmployeeDto
                    {
                        Id = e.Id,
                        FirstName = e.FirstName,
                        LastName = e.LastName,
                        PhoneNumber = e.PhoneNumber,
                        BirthDate = e.BirthDate.ToString("dd.MM.yyyy"),
                        City = e.City,
                        CityId = e.CityId,
                        EmailAddress = e.EmailAdress,
                        Username = e.Username,
                        JobTitle = e.JobTitle,
                        WorkingHour = e.WorkingHour,
                        WorkingHourId = e.WorkingHourId,

                    });

                context.HttpContext.Items["result"]=result;
                return;
            }


            if (!string.IsNullOrEmpty(empFilter.Name))
                query = query
                    .Where(e => e.FirstName.ToLower().Contains(empFilter.Name.ToLower()) || e.LastName.ToLower().Contains(empFilter.Name.ToLower()));
            

            if(empFilter.CityId!=null)
               query=query.Where(e=>e.CityId==empFilter.CityId);

            if (empFilter.CountryId != null)
                query = query.Where(e => e.City.CountryId == empFilter.CountryId);

            if (!string.IsNullOrEmpty(empFilter.JobTitle))
            {
                query=query.Where(e=>e.JobTitle.ToLower().Contains(empFilter.JobTitle.ToLower()));
            }


            if (empFilter.AgeFrom != null)
            {
                query = query.Where(e =>
                     DateTime.Today.Year - e.BirthDate.Year
                     - (DateTime.Today < e.BirthDate.AddYears(DateTime.Today.Year - e.BirthDate.Year) ? 1 : 0)
                     >= empFilter.AgeFrom);

            }

            if (empFilter.AgeTo != null)
            {
                query = query.Where(e =>
                     DateTime.Today.Year - e.BirthDate.Year
                     - (DateTime.Today < e.BirthDate.AddYears(DateTime.Today.Year - e.BirthDate.Year) ? 1 : 0)
                     <= empFilter.AgeTo);
            }

            var filteredResults = query
                .Select(e => new EmployeeDto
                {
                    Id = e.Id,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    PhoneNumber = e.PhoneNumber,
                    BirthDate = e.BirthDate.ToString("dd.MM.yyyy"),
                    City = e.City,
                    CityId = e.CityId,
                    EmailAddress = e.EmailAdress,
                    Username = e.Username,
                    JobTitle = e.JobTitle,
                    WorkingHour = e.WorkingHour,
                    WorkingHourId = e.WorkingHourId,

                });

            context.HttpContext.Items["result"]= filteredResults;

        }

    }
}
