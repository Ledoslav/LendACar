using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class helpMeGod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DenialComment",
                table: "VerificationRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "VerificationRequests",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RequestReviewDate",
                table: "VerificationRequests",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DenialComment",
                table: "VerificationRequests");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "VerificationRequests");

            migrationBuilder.DropColumn(
                name: "RequestReviewDate",
                table: "VerificationRequests");
        }
    }
}
