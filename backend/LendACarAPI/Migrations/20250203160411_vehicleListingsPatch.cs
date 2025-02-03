using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class vehicleListingsPatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Users_VehicleOwnerID",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Image",
                table: "VehicleImages");

            migrationBuilder.RenameColumn(
                name: "VehicleOwnerID",
                table: "Vehicles",
                newName: "UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Vehicles_VehicleOwnerID",
                table: "Vehicles",
                newName: "IX_Vehicles_UserID");

            migrationBuilder.AlterColumn<int>(
                name: "TransmissionType",
                table: "Vehicles",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "FuelType",
                table: "Vehicles",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "AirConditioning",
                table: "Vehicles",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "CityID",
                table: "Vehicles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "VehicleImages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_CityID",
                table: "Vehicles",
                column: "CityID");

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Cities_CityID",
                table: "Vehicles",
                column: "CityID",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Users_UserID",
                table: "Vehicles",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Cities_CityID",
                table: "Vehicles");

            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Users_UserID",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_CityID",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "CityID",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "VehicleImages");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "Vehicles",
                newName: "VehicleOwnerID");

            migrationBuilder.RenameIndex(
                name: "IX_Vehicles_UserID",
                table: "Vehicles",
                newName: "IX_Vehicles_VehicleOwnerID");

            migrationBuilder.AlterColumn<string>(
                name: "TransmissionType",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "FuelType",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "AirConditioning",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<byte[]>(
                name: "Image",
                table: "VehicleImages",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Users_VehicleOwnerID",
                table: "Vehicles",
                column: "VehicleOwnerID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
