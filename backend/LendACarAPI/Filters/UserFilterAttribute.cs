using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.DTOs;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace LendACarAPI.Filters
{
    public class UserFilterAttribute(ApplicationDbContext db):ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var queryParams= context.HttpContext.Request.Query;

            var filter = new UserFilterDto()
            {
                Name = queryParams["name"],
                AgeFrom = int.TryParse(queryParams["ageFrom"], out var ageFrom) ? ageFrom : null,
                AgeTo = int.TryParse(queryParams["ageTo"], out var ageTo) ? ageTo : null,
                CityId = int.TryParse(queryParams["cityId"], out var cityId) ? cityId : null,
                CountryId = int.TryParse(queryParams["countryId"], out var countryId) ? countryId : null,
                IsVerified = bool.TryParse(queryParams["isVerified"], out var isVerified) ? isVerified : null
            };

            var query = db.Users
                       .Include(u => u.City)
                       .Include(u => u.City != null ? u.City.Country : null)
                       .AsQueryable();


            if (string.IsNullOrEmpty(filter.Name) && filter.CityId == null && filter.CountryId==null && filter.AgeFrom == null && filter.AgeTo == null && filter.IsVerified == null)
            {
                var users = db.Users
                    .Include(u => u.City)
                    .Include(u => u.City != null ? u.City.Country : null)
                    .Select(user => new UserDto()
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
                        IsVerified = user.IsVerified
                    });
                   

                context.HttpContext.Items["users"]=users;
                return;

            }


            if (!string.IsNullOrWhiteSpace(filter.Name))
            {
                query=query.Where(u=>u.FirstName.ToLower().Contains(filter.Name.ToLower()) 
                || u.LastName.ToLower().Contains(filter.Name.ToLower()) || u.Username.ToLower().Contains(filter.Name.ToLower()));
            }

            if (filter.CityId != null)
            {
                query=query.Where(u=>u.CityId== filter.CityId);
            }

            if (filter.CountryId != null)
            {
                query = query.Where(u => u.City.CountryId == filter.CountryId);
            }

            if(filter.IsVerified != null)
            {
                query=query.Where(u=>u.IsVerified == filter.IsVerified);
            }

            if (filter.AgeFrom != null)
            {
                query = query.Where(u =>
                    DateTime.Today.Year - u.BirthDate.Year
                    - (DateTime.Today < u.BirthDate.AddYears(DateTime.Today.Year - u.BirthDate.Year) ? 1 : 0)
                    >= filter.AgeFrom);

            }

            if (filter.AgeTo != null)
            {
                query = query.Where(u =>
                    DateTime.Today.Year - u.BirthDate.Year
                    - (DateTime.Today < u.BirthDate.AddYears(DateTime.Today.Year - u.BirthDate.Year) ? 1 : 0)
                    <= filter.AgeTo);


            }

            var result = query
                     .Select(user => new UserDto()
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
                         IsVerified = user.IsVerified
                     });
                  

            context.HttpContext.Items["users"] = result;
        }
    }
}
