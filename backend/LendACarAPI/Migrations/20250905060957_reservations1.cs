using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class reservations1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Cities_CityID",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "DropoffLatitude",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "DropoffLongitude",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "PickupLatitude",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "PickupLongitude",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "CityID",
                table: "Reservations",
                newName: "PickUpCityID");

            migrationBuilder.RenameIndex(
                name: "IX_Reservations_CityID",
                table: "Reservations",
                newName: "IX_Reservations_PickUpCityID");

            migrationBuilder.AddColumn<int>(
                name: "DropOffCityID",
                table: "Reservations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_DropOffCityID",
                table: "Reservations",
                column: "DropOffCityID");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Cities_DropOffCityID",
                table: "Reservations",
                column: "DropOffCityID",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Cities_PickUpCityID",
                table: "Reservations",
                column: "PickUpCityID",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Cities_DropOffCityID",
                table: "Reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Cities_PickUpCityID",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_DropOffCityID",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "DropOffCityID",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "PickUpCityID",
                table: "Reservations",
                newName: "CityID");

            migrationBuilder.RenameIndex(
                name: "IX_Reservations_PickUpCityID",
                table: "Reservations",
                newName: "IX_Reservations_CityID");

            migrationBuilder.AddColumn<double>(
                name: "DropoffLatitude",
                table: "Reservations",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DropoffLongitude",
                table: "Reservations",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "PickupLatitude",
                table: "Reservations",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "PickupLongitude",
                table: "Reservations",
                type: "float",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Cities_CityID",
                table: "Reservations",
                column: "CityID",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
