using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class SecurityQuestionFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserSecurityQuestionAnswerId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SecurityQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityQuestions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserSecurityQuestionAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SecurityQuestionId = table.Column<int>(type: "int", nullable: false),
                    AnswerHash = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    AnswerSalt = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    AnswerAttempts = table.Column<int>(type: "int", nullable: false),
                    IsDisabled = table.Column<bool>(type: "bit", nullable: false),
                    DisabledUntil = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSecurityQuestionAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSecurityQuestionAnswers_SecurityQuestions_SecurityQuestionId",
                        column: x => x.SecurityQuestionId,
                        principalTable: "SecurityQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserSecurityQuestionAnswerId",
                table: "Users",
                column: "UserSecurityQuestionAnswerId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSecurityQuestionAnswers_SecurityQuestionId",
                table: "UserSecurityQuestionAnswers",
                column: "SecurityQuestionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_UserSecurityQuestionAnswers_UserSecurityQuestionAnswerId",
                table: "Users",
                column: "UserSecurityQuestionAnswerId",
                principalTable: "UserSecurityQuestionAnswers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_UserSecurityQuestionAnswers_UserSecurityQuestionAnswerId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "UserSecurityQuestionAnswers");

            migrationBuilder.DropTable(
                name: "SecurityQuestions");

            migrationBuilder.DropIndex(
                name: "IX_Users_UserSecurityQuestionAnswerId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserSecurityQuestionAnswerId",
                table: "Users");
        }
    }
}
