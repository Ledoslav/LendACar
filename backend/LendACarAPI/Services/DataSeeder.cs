using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LendACarAPI.Services
{
    public static class DataSeeder
    {
        public static async Task SeedReferalDataAsync(ApplicationDbContext db)
        {
            var countries = new List<Country>
            {
                new Country { Name = "Bosnia and Herzegovina" },
                new Country { Name = "Croatia" },
                new Country { Name = "Germany" },
                new Country { Name = "Austria" },
                new Country { Name = "USA" }
            };
            await db.Countries.AddRangeAsync(countries);

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
            await db.Cities.AddRangeAsync(cities);

            var vehicleCategories = new List<VehicleCategory>
            {
                new VehicleCategory { Name = "Other", Description = "No specific vehicle category was chosen." },
            };
            await db.VehicleCategories.AddRangeAsync(vehicleCategories);

            var workingHours = new List<WorkingHour>
            {
                new WorkingHour { StartTime = new TimeOnly(9, 00), EndTime = new TimeOnly(17, 00), Saturday = false, Sunday = false },
                new WorkingHour { StartTime = new TimeOnly(8, 00), EndTime = new TimeOnly(16, 00), Saturday = false, Sunday = false },
                new WorkingHour { StartTime = new TimeOnly(9, 30), EndTime = new TimeOnly(18, 00), Sunday = false },
            };
            await db.WorkingHours.AddRangeAsync(workingHours);

            var vehicleBrands = new List<VehicleBrand> { new VehicleBrand { BrandName = "Other" } };
            await db.VehicleBrands.AddRangeAsync(vehicleBrands);

            var vehicleModels = new List<VehicleModel> { new VehicleModel { ModelName = "Other", VehicleBrand = vehicleBrands[0] } };
            await db.VehicleModels.AddRangeAsync(vehicleModels);

            await db.SaveChangesAsync();
        }

        public static async Task SeedPersonDataAsync(ApplicationDbContext db, IAuthService authService, IPhotoService photoService, IRenderPDFReport renderPDFReport)
        {
            var adminController = new Endpoints.AdministratorController(db, authService);
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

            var controller = new Endpoints.UserController(db, authService, photoService);
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
                IsVerified = false
            }, default);
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
                IsVerified = false
            }, default);
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
            }, default);

            await db.SaveChangesAsync();

            // Seed Employees (Jane Doe and John Doe)
            var employeeController = new Endpoints.EmployeeController(
                db,
                renderPDFReport,
                authService,
                photoService
            );

            await employeeController.RegisterEmployee(new DTOs.RegisterEmployeeDto
            {
                FirstName = "Jane",
                LastName = "Doe",
                PhoneNumber = "+387 61 111 111",
                BirthDate = "1995-05-15",
                CityId = 1,
                EmailAddress ="jane.doe@lendacar.ba",
                Username = "jane.doe",
                JobTitle = "Customer Support",
                WorkingHourId = 1,
                DateOfHire = DateOnly.FromDateTime(DateTime.Now.Date)
            });

            await employeeController.RegisterEmployee(new DTOs.RegisterEmployeeDto
            {
                FirstName = "John",
                LastName = "Doe",
                PhoneNumber = "+387 61 222 222",
                BirthDate = "1990-08-20",
                CityId = 1,
                EmailAddress = "john.doe@lendacar.ba",
                Username = "john.doe",
                JobTitle = "Customer Support",
                WorkingHourId = 1,
                DateOfHire = DateOnly.FromDateTime(DateTime.Now.Date)
            });
        }
    }
} 