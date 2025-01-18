using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class IconBrand : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Icon",
                table: "VehicleBrands",
                type: "varbinary(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Icon",
                table: "VehicleBrands");
        }
    }
}
