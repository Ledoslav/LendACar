using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class vehicleImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VehicleImages_Vehicles_VehicleID",
                table: "VehicleImages");

            migrationBuilder.RenameColumn(
                name: "VehicleID",
                table: "VehicleImages",
                newName: "VehicleId");

            migrationBuilder.RenameIndex(
                name: "IX_VehicleImages_VehicleID",
                table: "VehicleImages",
                newName: "IX_VehicleImages_VehicleId");

            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                table: "VehicleImages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleImages_Vehicles_VehicleId",
                table: "VehicleImages",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VehicleImages_Vehicles_VehicleId",
                table: "VehicleImages");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "VehicleImages");

            migrationBuilder.RenameColumn(
                name: "VehicleId",
                table: "VehicleImages",
                newName: "VehicleID");

            migrationBuilder.RenameIndex(
                name: "IX_VehicleImages_VehicleId",
                table: "VehicleImages",
                newName: "IX_VehicleImages_VehicleID");

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleImages_Vehicles_VehicleID",
                table: "VehicleImages",
                column: "VehicleID",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
