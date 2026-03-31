using LendACarAPI.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Reflection.Metadata.Ecma335;
using System.Text.Json;



namespace LendACarAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
        DbContextOptions options) : base(options)
        { }

        public DbSet<City> Cities { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<CompanyEmployee> CompanyEmployees { get; set; }
        public DbSet<CompanyReview> CompanyReviews { get; set; }
        public DbSet<CompanyPosition> CompanyPositions { get; set; }
        public DbSet<Person> Person { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserReview> UserReviews { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<VehicleCategory> VehicleCategories { get; set; }
        public DbSet<VehicleModel> VehicleModels { get; set; }
        public DbSet<VehicleReview> VehicleReviews { get; set; }
        public DbSet<VehicleImage> VehicleImages { get; set; }
        public DbSet<WorkingHour> WorkingHours { get; set; }
        public DbSet<VehicleBrand> VehicleBrands { get; set; }
        public DbSet<DriversLicense> DriversLicense { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Administrator> Administrators { get; set; }
        public DbSet<VerificationRequest> VerificationRequests { get; set; }
        public DbSet<Poll> Polls { get; set; }
        public DbSet<SecurityQuestion> SecurityQuestions { get; set; }
        public DbSet<UserSecurityQuestionAnswer> UserSecurityQuestionAnswers { get; set; }
        public DbSet<Reservation> Reservations {  get; set; }
        public DbSet<Activity> Activitys { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CompanyReview>()
                .HasKey(x => new { x.ReviewerId, x.CompanyId });
            modelBuilder.Entity<UserReview>()
                .HasKey(x => new { x.ReviewerId, x.UserId });
            modelBuilder.Entity<VehicleReview>()
                .HasKey(x => new { x.ReviewerId, x.VehicleId });

            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Person>().UseTpcMappingStrategy();

            var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
                v => v.ToUniversalTime(),
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
                v => v.HasValue ? v.Value.ToUniversalTime() : v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (entityType.IsKeyless) continue;

                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                        property.SetValueConverter(dateTimeConverter);
                    else if (property.ClrType == typeof(DateTime?))
                        property.SetValueConverter(nullableDateTimeConverter);
                }
            }

            // Cascade delete for the relationship between User and CompanyEmployee
            modelBuilder.Entity<CompanyEmployee>()
                .HasOne(ce => ce.User)
                .WithOne()  // If it's a one-to-one relationship, adjust as necessary
                .HasForeignKey<CompanyEmployee>(ce => ce.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cascade delete for the relationship between Company and CompanyEmployee
            modelBuilder.Entity<CompanyEmployee>()
                .HasOne(ce => ce.Company)
                .WithMany()  // If it's a one-to-many relationship, adjust as necessary
                .HasForeignKey(ce => ce.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);

            // opcija kod nasljeđivanja
            // modelBuilder.Entity<NekaBaznaKlasa>().UseTpcMappingStrategy();

            // glasanje
            var dictionaryComparer = new ValueComparer<Dictionary<string, int>>(
                (d1, d2) => JsonSerializer.Serialize(d1, (JsonSerializerOptions)null) == JsonSerializer.Serialize(d2, (JsonSerializerOptions)null),
                d => JsonSerializer.Serialize(d, (JsonSerializerOptions)null).GetHashCode(),
                d => JsonSerializer.Deserialize<Dictionary<string, int>>(JsonSerializer.Serialize(d, (JsonSerializerOptions)null), (JsonSerializerOptions)null)
            );

            modelBuilder.Entity<Poll>()
                .Property(p => p.Votes)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null), // Serialize to JSON string
                    v => JsonSerializer.Deserialize<Dictionary<string, int>>(v, (JsonSerializerOptions)null) // Deserialize back to Dictionary
                )
                .Metadata
                .SetValueComparer(dictionaryComparer);

            modelBuilder.Entity<Reservation>()
                    .Property(r => r.Price)
                    .HasPrecision(18, 2);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Renter)
                .WithMany()
                .HasForeignKey(r => r.RenterId)
                .OnDelete(DeleteBehavior.Restrict); // prevent cascade

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Owner)
                .WithMany()
                .HasForeignKey(r => r.OwnerId)
                .OnDelete(DeleteBehavior.Restrict); // prevent cascade

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Vehicle)
                .WithMany()
                .HasForeignKey(r => r.VehicleID)
                .OnDelete(DeleteBehavior.Restrict); // safe

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.DropOffCity)
                .WithMany()
                .HasForeignKey(r => r.DropOffCityID)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.PickUpCity)
                .WithMany()
                .HasForeignKey(r => r.PickUpCityID)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
