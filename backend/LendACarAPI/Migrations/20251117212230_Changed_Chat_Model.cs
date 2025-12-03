using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class Changed_Chat_Model : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Sender",
                table: "ChatMessages");

            migrationBuilder.AddColumn<int>(
                name: "SenderId",
                table: "ChatMessages",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SenderId",
                table: "ChatMessages");

            migrationBuilder.AddColumn<string>(
                name: "Sender",
                table: "ChatMessages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
