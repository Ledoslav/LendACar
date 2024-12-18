using LendACarAPI.Data;
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
                CityId = int.TryParse(queryParam["cityId"],out var cityId)? cityId:null,
                JobTitle = queryParam["jobTitle"],
            };

            var query = db.Employees
                .Include(e => e.City)
                .Include(u => u.City != null ? u.City.Country : null)
                .AsQueryable();

             
            if(string.IsNullOrEmpty(empFilter.Name) && empFilter.CityId == null && string.IsNullOrEmpty(empFilter.JobTitle) && empFilter.AgeFrom == null && empFilter.AgeTo == null)
            {
                var result=db.Employees
                    .Include(e => e.City)
                    .Include(u => u.City != null ? u.City.Country : null)
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

                    }).ToArray();

                context.HttpContext.Items["result"]=result;
                return;
            }


            if (!string.IsNullOrEmpty(empFilter.Name))
                query = query
                    .Where(e => e.FirstName.ToLower().Contains(empFilter.Name.ToLower()) || e.LastName.ToLower().Contains(empFilter.Name.ToLower()));
            

            if(empFilter.CityId!=null)
               query=query.Where(e=>e.CityId==empFilter.CityId);

            if (!string.IsNullOrEmpty(empFilter.JobTitle))
            {
                query=query.Where(e=>e.JobTitle.ToLower().Contains(empFilter.JobTitle.ToLower()));
            }


            if (empFilter.AgeFrom != null)
            {
                query=query.Where(e=>EF.Functions.DateDiffYear(e.BirthDate,DateTime.Today) >= empFilter.AgeFrom);
            }

            if (empFilter.AgeTo != null)
            {
                query = query.Where(e => EF.Functions.DateDiffYear(e.BirthDate, DateTime.Today) >= empFilter.AgeTo);
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

                }).ToArray();

            context.HttpContext.Items["result"]= filteredResults;

        }
    }
}
