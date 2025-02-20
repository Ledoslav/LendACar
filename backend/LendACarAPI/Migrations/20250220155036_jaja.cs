using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class jaja : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaximumLoad",
                table: "Vehicles");

            migrationBuilder.AddColumn<int>(
                name: "ProductionYear",
                table: "Vehicles",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductionYear",
                table: "Vehicles");

            migrationBuilder.AddColumn<int>(
                name: "MaximumLoad",
                table: "Vehicles",
                type: "int",
                nullable: true);
        }
    }
}
