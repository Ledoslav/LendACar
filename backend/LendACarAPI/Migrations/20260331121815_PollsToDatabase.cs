using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class PollsToDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_UserSecurityQuestionAnswers_UserSecurityQuestionAnswerId",
                table: "Users");

            migrationBuilder.AddColumn<bool>(
                name: "IsClosed",
                table: "Polls",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "VotedUserIds",
                table: "Polls",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_UserSecurityQuestionAnswers_UserSecurityQuestionAnswerId",
                table: "Users",
                column: "UserSecurityQuestionAnswerId",
                principalTable: "UserSecurityQuestionAnswers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_UserSecurityQuestionAnswers_UserSecurityQuestionAnswerId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsClosed",
                table: "Polls");

            migrationBuilder.DropColumn(
                name: "VotedUserIds",
                table: "Polls");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_UserSecurityQuestionAnswers_UserSecurityQuestionAnswerId",
                table: "Users",
                column: "UserSecurityQuestionAnswerId",
                principalTable: "UserSecurityQuestionAnswers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
