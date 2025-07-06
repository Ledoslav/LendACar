using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

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

            var securityQuestions = new List<SecurityQuestion>
            {
                new SecurityQuestion { QuestionText = "What is your mother's maiden name?" },
                new SecurityQuestion { QuestionText = "What is your childhood nickname?" },
                new SecurityQuestion { QuestionText = "What is the name of your best friend from childhood?" },
                new SecurityQuestion { QuestionText = "What was the first video game you played?" },
                new SecurityQuestion { QuestionText = "What is the name of your favorite childhood toy?" },
                new SecurityQuestion { QuestionText = "Who was your first celebrity crush?" },
                new SecurityQuestion { QuestionText = "What is the name of your favorite teacher from school?" },
                new SecurityQuestion { QuestionText = "Where did you go on your first vacation?" }
            };
            await db.SecurityQuestions.AddRangeAsync(securityQuestions);

            var vehicleCategories = new List<VehicleCategory>
            {
                new VehicleCategory { Name = "Sedan", Description = "Passenger cars with a three-box configuration." },
                new VehicleCategory { Name = "SUV", Description = "Sport Utility Vehicles, larger and often four-wheel drive." },
                new VehicleCategory { Name = "Hatchback", Description = "Small to medium-sized cars with a rear door that swings upward." },
                new VehicleCategory { Name = "Convertible", Description = "Cars with a roof structure that can be 'converted' to allow open-air or enclosed driving." },
                new VehicleCategory { Name = "Coupe", Description = "Two-door cars with a fixed roof." },
                new VehicleCategory { Name = "Wagon", Description = "Cars with an extended rear cargo area." },
                new VehicleCategory { Name = "Pickup", Description = "Light-duty trucks with an enclosed cab and open cargo area." },
                new VehicleCategory { Name = "Van", Description = "Vehicles used for transporting goods or people." },
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

            var vehicleBrands = new List<VehicleBrand>
            {
                new VehicleBrand { BrandName = "Toyota" },
                new VehicleBrand { BrandName = "BMW" },
                new VehicleBrand { BrandName = "Volkswagen" },
                new VehicleBrand { BrandName = "Ford" },
                new VehicleBrand { BrandName = "Mercedes-Benz" },
                new VehicleBrand { BrandName = "Audi" },
                new VehicleBrand { BrandName = "Hyundai" },
                new VehicleBrand { BrandName = "Kia" },
                new VehicleBrand { BrandName = "Other" },
            };
            await db.VehicleBrands.AddRangeAsync(vehicleBrands);

            var vehicleModels = new List<VehicleModel>
            {
                // Toyota
                new VehicleModel { ModelName = "Corolla", VehicleBrand = vehicleBrands[0] },
                new VehicleModel { ModelName = "Camry", VehicleBrand = vehicleBrands[0] },
                new VehicleModel { ModelName = "RAV4", VehicleBrand = vehicleBrands[0] },
                // BMW
                new VehicleModel { ModelName = "3 Series", VehicleBrand = vehicleBrands[1] },
                new VehicleModel { ModelName = "5 Series", VehicleBrand = vehicleBrands[1] },
                new VehicleModel { ModelName = "X5", VehicleBrand = vehicleBrands[1] },
                // Volkswagen
                new VehicleModel { ModelName = "Golf", VehicleBrand = vehicleBrands[2] },
                new VehicleModel { ModelName = "Passat", VehicleBrand = vehicleBrands[2] },
                new VehicleModel { ModelName = "Tiguan", VehicleBrand = vehicleBrands[2] },
                // Ford
                new VehicleModel { ModelName = "Focus", VehicleBrand = vehicleBrands[3] },
                new VehicleModel { ModelName = "Fiesta", VehicleBrand = vehicleBrands[3] },
                new VehicleModel { ModelName = "Mustang", VehicleBrand = vehicleBrands[3] },
                // Mercedes-Benz
                new VehicleModel { ModelName = "C-Class", VehicleBrand = vehicleBrands[4] },
                new VehicleModel { ModelName = "E-Class", VehicleBrand = vehicleBrands[4] },
                new VehicleModel { ModelName = "GLC", VehicleBrand = vehicleBrands[4] },
                // Audi
                new VehicleModel { ModelName = "A3", VehicleBrand = vehicleBrands[5] },
                new VehicleModel { ModelName = "A4", VehicleBrand = vehicleBrands[5] },
                new VehicleModel { ModelName = "Q5", VehicleBrand = vehicleBrands[5] },
                // Hyundai
                new VehicleModel { ModelName = "Elantra", VehicleBrand = vehicleBrands[6] },
                new VehicleModel { ModelName = "Tucson", VehicleBrand = vehicleBrands[6] },
                new VehicleModel { ModelName = "Santa Fe", VehicleBrand = vehicleBrands[6] },
                // Kia
                new VehicleModel { ModelName = "Ceed", VehicleBrand = vehicleBrands[7] },
                new VehicleModel { ModelName = "Sportage", VehicleBrand = vehicleBrands[7] },
                new VehicleModel { ModelName = "Sorento", VehicleBrand = vehicleBrands[7] },
                // Other
                new VehicleModel { ModelName = "Other", VehicleBrand = vehicleBrands[8] },
            };
            await db.VehicleModels.AddRangeAsync(vehicleModels);

            await db.SaveChangesAsync();
        }

        public static async Task SeedPersonDataAsync(ApplicationDbContext db)
        {
            // Hash password helper
            string password = "password";

            // Admin
            using var hmacAdmin = new System.Security.Cryptography.HMACSHA256();
            var admin = new Administrator
            {
                FirstName = "LendACar",
                LastName = "Administrator",
                BirthDate = new DateTime(2003, 11, 11),
                PhoneNumber = "123-456-7890",
                CityId = 1,
                EmailAdress = "admin.main@lendacar.ba",
                Username = "admin",
                PasswordHash = hmacAdmin.ComputeHash(System.Text.Encoding.UTF8.GetBytes("admin")),
                PasswordSalt = hmacAdmin.Key,
                IsAdmin = true,
                IsEmployee = false,
                IsAppUser = false,
            };
            await db.Administrators.AddAsync(admin);

            // Users
            var users = new List<User>
            {
                new User
                {
                    FirstName = "Denis",
                    LastName = "Kundo",
                    BirthDate = new DateTime(2003, 11, 11),
                    CityId = 2,
                    PhoneNumber = "123-456-7890",
                    EmailAdress = "denis.kundo@edu.fit.ba",
                    Username = "KalloX",
                    IsVerified = false,
                    IsBanned = false,
                    IsAdmin = false,
                    IsEmployee = false,
                    IsAppUser = true,
                    CreatedDate = DateTime.Now
                },
                new User
                {
                    FirstName = "Edin",
                    LastName = "Tabak",
                    BirthDate = new DateTime(2003, 11, 10),
                    CityId = 3,
                    PhoneNumber = "123-456-7890",
                    EmailAdress = "edin.tabak@edu.fit.ba",
                    Username = "LedoSlav",
                    IsVerified = false,
                    IsBanned = false,
                    IsAdmin = false,
                    IsEmployee = false,
                    IsAppUser = true,
                    CreatedDate = DateTime.Now
                },
                new User
                {
                    FirstName = "Emin",
                    LastName = "Brankovic",
                    BirthDate = new DateTime(2002, 10, 31),
                    CityId = 7,
                    PhoneNumber = "123-456-7890",
                    EmailAdress = "emin.brankovic@edu.fit.ba",
                    Username = "Vaha",
                    IsVerified = false,
                    IsBanned = false,
                    IsAdmin = false,
                    IsEmployee = false,
                    IsAppUser = true,
                    CreatedDate = DateTime.Now
                },
                // 17 additional users scattered over the months of the current year
                new User { FirstName = "Amir", LastName = "Hadžić", BirthDate = new DateTime(1998, 2, 15), CityId = 1, PhoneNumber = "111-222-3333", EmailAdress = "amir.hadzic@gmail.com", Username = "amirh", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 1, 10) },
                new User { FirstName = "Lejla", LastName = "Mehić", BirthDate = new DateTime(1995, 5, 20), CityId = 2, PhoneNumber = "222-333-4444", EmailAdress = "lejla.mehic@gmail.com", Username = "lejlameh", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 2, 12) },
                new User { FirstName = "Adnan", LastName = "Delić", BirthDate = new DateTime(1997, 7, 8), CityId = 3, PhoneNumber = "333-444-5555", EmailAdress = "adnan.delic@gmail.com", Username = "adnand", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 3, 5) },
                new User { FirstName = "Selma", LastName = "Smajić", BirthDate = new DateTime(1994, 9, 30), CityId = 4, PhoneNumber = "444-555-6666", EmailAdress = "selma.smajic@gmail.com", Username = "selmas", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 4, 18) },
                new User { FirstName = "Faruk", LastName = "Softić", BirthDate = new DateTime(1996, 11, 22), CityId = 5, PhoneNumber = "555-666-7777", EmailAdress = "faruk.softic@gmail.com", Username = "faruks", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 5, 9) },
                new User { FirstName = "Amina", LastName = "Zukić", BirthDate = new DateTime(1993, 3, 14), CityId = 6, PhoneNumber = "666-777-8888", EmailAdress = "amina.zukic@gmail.com", Username = "aminaz", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 6, 21) },
                new User { FirstName = "Haris", LastName = "Mujić", BirthDate = new DateTime(1992, 6, 3), CityId = 7, PhoneNumber = "777-888-9999", EmailAdress = "haris.mujic@gmail.com", Username = "harism", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 6, 14) },
                new User { FirstName = "Ajla", LastName = "Karić", BirthDate = new DateTime(1991, 8, 25), CityId = 8, PhoneNumber = "888-999-0000", EmailAdress = "ajla.karic@gmail.com", Username = "ajlak", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 7, 3) },
                new User { FirstName = "Tarik", LastName = "Begić", BirthDate = new DateTime(1990, 10, 17), CityId = 9, PhoneNumber = "999-000-1111", EmailAdress = "tarik.begic@gmail.com", Username = "tarikb", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 8, 27) },
                new User { FirstName = "Emina", LastName = "Šabanović", BirthDate = new DateTime(1989, 12, 29), CityId = 10, PhoneNumber = "000-111-2222", EmailAdress = "emina.sabanovic@gmail.com", Username = "eminas", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 8, 6) },
                new User { FirstName = "Nedim", LastName = "Alić", BirthDate = new DateTime(1988, 4, 11), CityId = 11, PhoneNumber = "111-222-3334", EmailAdress = "nedim.alic@gmail.com", Username = "nedima", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 9, 15) },
                new User { FirstName = "Lamija", LastName = "Dizdarević", BirthDate = new DateTime(1987, 5, 23), CityId = 12, PhoneNumber = "222-333-4445", EmailAdress = "lamija.dizdarevic@gmail.com", Username = "lamijad", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 9, 2) },
                new User { FirstName = "Mirza", LastName = "Kapić", BirthDate = new DateTime(1986, 7, 7), CityId = 1, PhoneNumber = "333-444-5556", EmailAdress = "mirza.kapic@gmail.com", Username = "mirzak", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 1, 22) },
                new User { FirstName = "Dženita", LastName = "Osmanović", BirthDate = new DateTime(1985, 9, 19), CityId = 2, PhoneNumber = "444-555-6667", EmailAdress = "dzenita.osmanovic@gmail.com", Username = "dzenitao", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 2, 28) },
                new User { FirstName = "Elvedin", LastName = "Halilović", BirthDate = new DateTime(1984, 11, 1), CityId = 3, PhoneNumber = "555-666-7778", EmailAdress = "elvedin.halilovic@gmail.com", Username = "elvedinh", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 3, 16) },
                new User { FirstName = "Sabina", LastName = "Memić", BirthDate = new DateTime(1983, 1, 13), CityId = 4, PhoneNumber = "666-777-8889", EmailAdress = "sabina.memics@gmail.com", Username = "sabinam", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 4, 25) },
                new User { FirstName = "Ismar", LastName = "Suljić", BirthDate = new DateTime(1982, 3, 30), CityId = 5, PhoneNumber = "777-888-9990", EmailAdress = "ismar.suljic@gmail.com", Username = "ismars", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 5, 12) },
                new User { FirstName = "Ajsa", LastName = "Karić", BirthDate = new DateTime(1981, 6, 5), CityId = 6, PhoneNumber = "888-999-0001", EmailAdress = "ajsa.karic@gmail.com", Username = "ajsak", IsVerified = false, IsBanned = false, IsAdmin = false, IsEmployee = false, IsAppUser = true, CreatedDate = new DateTime(DateTime.Now.Year, 6, 30) }
            };
            await db.Users.AddRangeAsync(users);

            // Employees
            var employees = new List<Employee>
            {
                new Employee
                {
                    FirstName = "Jane",
                    LastName = "Doe",
                    PhoneNumber = "+387 61 111 111",
                    BirthDate = new DateTime(1995, 5, 15),
                    CityId = 1,
                    EmailAdress = "jane.doe@lendacar.ba",
                    Username = "jane.doe",
                    JobTitle = "Customer Support",
                    WorkingHourId = 1,
                    DateOfHire = DateOnly.FromDateTime(DateTime.Now.Date),
                    IsAdmin = false,
                    IsEmployee = true,
                    IsAppUser = false
                },
                new Employee
                {
                    FirstName = "John",
                    LastName = "Doe",
                    PhoneNumber = "+387 61 222 222",
                    BirthDate = new DateTime(1990, 8, 20),
                    CityId = 1,
                    EmailAdress = "john.doe@lendacar.ba",
                    Username = "john.doe",
                    JobTitle = "Customer Support",
                    WorkingHourId = 1,
                    DateOfHire = DateOnly.FromDateTime(DateTime.Now.Date),
                    IsAdmin = false,
                    IsEmployee = true,
                    IsAppUser = false
                },
                new Employee
                {
                    FirstName = "Ana",
                    LastName = "Kovač",
                    PhoneNumber = "+385 91 333 3333",
                    BirthDate = new DateTime(1992, 3, 12),
                    CityId = 6,
                    EmailAdress = "ana.kovac@lendacar.ba",
                    Username = "ana.kovac",
                    JobTitle = "Fleet Manager",
                    WorkingHourId = 2,
                    DateOfHire = DateOnly.FromDateTime(DateTime.Now.Date),
                    IsAdmin = false,
                    IsEmployee = true,
                    IsAppUser = false
                },
                new Employee
                {
                    FirstName = "Marko",
                    LastName = "Horvat",
                    PhoneNumber = "+385 91 444 4444",
                    BirthDate = new DateTime(1988, 7, 22),
                    CityId = 6,
                    EmailAdress = "marko.horvat@lendacar.ba",
                    Username = "marko.horvat",
                    JobTitle = "Sales Representative",
                    WorkingHourId = 2,
                    DateOfHire = DateOnly.FromDateTime(DateTime.Now.Date),
                    IsAdmin = false,
                    IsEmployee = true,
                    IsAppUser = false
                },
                new Employee
                {
                    FirstName = "Emily",
                    LastName = "Smith",
                    PhoneNumber = "+1 212-555-1234",
                    BirthDate = new DateTime(1993, 11, 5),
                    CityId = 11,
                    EmailAdress = "emily.smith@lendacar.ba",
                    Username = "emily.smith",
                    JobTitle = "Marketing Specialist",
                    WorkingHourId = 3,
                    DateOfHire = DateOnly.FromDateTime(DateTime.Now.Date),
                    IsAdmin = false,
                    IsEmployee = true,
                    IsAppUser = false
                },
                new Employee
                {
                    FirstName = "Hans",
                    LastName = "Müller",
                    PhoneNumber = "+49 30 1234567",
                    BirthDate = new DateTime(1985, 2, 17),
                    CityId = 7,
                    EmailAdress = "hans.muller@lendacar.ba",
                    Username = "hans.muller",
                    JobTitle = "Technical Support",
                    WorkingHourId = 1,
                    DateOfHire = DateOnly.FromDateTime(DateTime.Now.Date),
                    IsAdmin = false,
                    IsEmployee = true,
                    IsAppUser = false
                }
            };
            await db.Employees.AddRangeAsync(employees);

            // Apply password hashing
            foreach (var user in users)
            {
                using (var hmac = new System.Security.Cryptography.HMACSHA256())
                {
                    user.PasswordSalt = hmac.Key;
                    user.PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                }
            }

            foreach (var employee in employees)
            {
                using (var hmac = new System.Security.Cryptography.HMACSHA256())
                {
                    employee.PasswordSalt = hmac.Key;
                    employee.PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                }
            }

            await db.SaveChangesAsync();

            // Vehicles
            var vehicleModels = db.VehicleModels.ToList();
            var vehicleCategories = db.VehicleCategories.ToList();
            var cities = db.Cities.ToList();
            var usersFromDb = db.Users.ToList();

            var vehicles = new List<Vehicle>
            {
                new Vehicle
                {
                    Title = "Toyota Corolla 2020",
                    EngineDisplacement = 1.8f,
                    EnginePower = 140,
                    TransmissionType = 1, // Automatic
                    FuelType = 0, // Petrol
                    AirConditioning = 2, // Double-Zone
                    NumberOfSeats = 5,
                    TowingHitch = false,
                    Description = "Reliable and fuel-efficient sedan.",
                    ProductionYear = 2020,
                    Avaliable = true,
                    PricePerDay = 45.0,
                    VehicleModelID = vehicleModels.First(m => m.ModelName == "Corolla").Id,
                    VehicleCategoryID = vehicleCategories.First(c => c.Name == "Sedan").Id,
                    UserID = usersFromDb.First(u => u.Username == "KalloX").Id,
                    CityID = cities.First(c => c.Name == "Sarajevo").Id
                },
                new Vehicle
                {
                    Title = "BMW X5 2019",
                    EngineDisplacement = 3.0f,
                    EnginePower = 265,
                    TransmissionType = 1, // Automatic
                    FuelType = 1, // Diesel
                    AirConditioning = 3, // Triple-Zone
                    NumberOfSeats = 5,
                    TowingHitch = true,
                    Description = "Luxury SUV with advanced features.",
                    ProductionYear = 2019,
                    Avaliable = true,
                    PricePerDay = 90.0,
                    VehicleModelID = vehicleModels.First(m => m.ModelName == "X5").Id,
                    VehicleCategoryID = vehicleCategories.First(c => c.Name == "SUV").Id,
                    UserID = usersFromDb.First(u => u.Username == "LedoSlav").Id,
                    CityID = cities.First(c => c.Name == "Zagreb").Id
                },
                new Vehicle
                {
                    Title = "Volkswagen Golf 2018",
                    EngineDisplacement = 1.4f,
                    EnginePower = 125,
                    TransmissionType = 0, // Manual
                    FuelType = 0, // Petrol
                    AirConditioning = 1, // Single-Zone
                    NumberOfSeats = 5,
                    TowingHitch = false,
                    Description = "Compact hatchback, perfect for city driving.",
                    ProductionYear = 2018,
                    Avaliable = true,
                    PricePerDay = 35.0,
                    VehicleModelID = vehicleModels.First(m => m.ModelName == "Golf").Id,
                    VehicleCategoryID = vehicleCategories.First(c => c.Name == "Hatchback").Id,
                    UserID = usersFromDb.First(u => u.Username == "Vaha").Id,
                    CityID = cities.First(c => c.Name == "Berlin").Id
                }
            };
            await db.Vehicles.AddRangeAsync(vehicles);

            await db.SaveChangesAsync();
        }
    }
} 