using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;

namespace LendACarAPI.Endpoints.DataSeedEndpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataSeedGenerateEndpoint(ApplicationDbContext db):ControllerBase
    {

        [HttpPost("generateReferalData")]
        public async Task<string> ReferalDataSeedGeneration(CancellationToken cancellationToken = default)
        {


            //Kreiranje država
            var countries = new List<Country>
            {
                new Country { Name = "Bosnia and Herzegovina" },
                new Country { Name = "Croatia" },
                new Country { Name = "Germany" },
                new Country { Name = "Austria" },
                new Country { Name = "USA" }
            };

            //// Kreiranje gradova
            var cities = new List<City>
            {
                new City { Name = "Sarajevo", Country = countries[0] },
                new City { Name = "Mostar", Country = countries[0] },
                new City { Name = "Tuzla", Country = countries[0] },
                new City { Name = "Konjic", Country = countries[0] },
                new City { Name = "Jablanica", Country = countries[0] },
                new City { Name = "Zagreb", Country = countries[1] },
                new City { Name = "Berlin", Country = countries[2] },
                new City { Name = "Vienna", Country = countries[3] },
                new City { Name = "Klagenfurt", Country = countries[3] },
                new City { Name = "Graz", Country = countries[3] },
                new City { Name = "New York", Country = countries[4] },
                new City { Name = "Los Angeles", Country = countries[4] }
            };


            var vehicleCategories = new List<VehicleCategory>
            {
                new VehicleCategory { Name = "Sedan" , Description = "Perfect blend of style, comfort and sportiness."},
                new VehicleCategory { Name = "Hatchback" , Description = "Compact vehicle perfect for urban places."},
            };

            var workingHours = new List<WorkingHour>
            {
                new WorkingHour { StartTime = new TimeOnly(9, 00), EndTime = new TimeOnly(17, 00), Saturday = false, Sunday = false },
                new WorkingHour { StartTime = new TimeOnly(8, 00), EndTime = new TimeOnly(16, 00), Saturday = false, Sunday = false },
                new WorkingHour { StartTime = new TimeOnly(9, 30), EndTime = new TimeOnly(18, 00), Sunday = false },
            };


            // Dodavanje podataka u bazu
            await db.WorkingHours.AddRangeAsync(workingHours, cancellationToken);
            await db.Countries.AddRangeAsync(countries, cancellationToken);
            await db.Cities.AddRangeAsync(cities, cancellationToken);
            await db.VehicleCategories.AddRangeAsync(vehicleCategories, cancellationToken);

            await db.SaveChangesAsync(cancellationToken);

            return "Data generation completed successfully.";
        }

        [HttpPost("generatePersonData")]
        public async Task<string> PersonDataSeedGeneration(CancellationToken cancellationToken = default)
        {


            var adminController = new AdministratorController(db);
            await adminController.RegisterAdministrator(new DTOs.AdministratorRegisterDto
            {
                FirstName = "LendACar",
                LastName = "Administrator",
                BirthDate = new DateTime(2003, 11, 11).ToString("dd.MM.yyyy"),
                PhoneNumber = "123-456-7890",
                CityId = 1,
                EmailAdress = "admin.main@lendacar.ba",
                Username = "admin",
                Password = "admin"
            });

            var controller = new UserController(db);
            await controller.RegisterUser(new DTOs.RegisterUserDto
            {
                Username = "KalloX",
                Password = "password",
                FirstName = "Denis",
                LastName = "Kundo",
                BirthDate = new DateTime(2003, 11, 11).ToString("dd.MM.yyyy"),
                CityId = 2,
                PhoneNumber = "123-456-7890",
                EmailAdress = "denis@edu.fit.ba",
                IsVerified = true
            });
            await controller.RegisterUser(new DTOs.RegisterUserDto
            {
                Username = "LedoSlav",
                Password = "password",
                FirstName = "Edin",
                LastName = "Tabak",
                BirthDate = new DateTime(2003, 11, 10).ToString("dd.MM.yyyy"),
                CityId = 3,
                PhoneNumber = "123-456-7890",
                EmailAdress = "edin@edu.fit.ba",
                IsVerified = true
            });

            await controller.RegisterUser(new DTOs.RegisterUserDto
            {
                Username = "Vaha",
                Password = "password",
                FirstName = "Emin",
                LastName = "Brankovic",
                BirthDate = new DateTime(2002, 10, 31).ToString("dd.MM.yyyy"),
                CityId = 7,
                PhoneNumber = "123-456-7890",
                EmailAdress = "emin@edu.fit.ba",
                IsVerified = false
            });

            

            await db.SaveChangesAsync(cancellationToken);

            return "Data generation completed successfully.";
        }
    }

}

