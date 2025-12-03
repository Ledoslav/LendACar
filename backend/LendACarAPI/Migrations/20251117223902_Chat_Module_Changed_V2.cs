using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class Chat_Module_Changed_V2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Avatar",
                table: "Chats",
                newName: "DealerAvatar");

            migrationBuilder.AddColumn<string>(
                name: "CustomerAvatar",
                table: "Chats",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "Chats",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerAvatar",
                table: "Chats");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "Chats");

            migrationBuilder.RenameColumn(
                name: "DealerAvatar",
                table: "Chats",
                newName: "Avatar");
        }
    }
}
