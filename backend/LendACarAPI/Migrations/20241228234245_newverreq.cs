using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LendACarAPI.Migrations
{
    /// <inheritdoc />
    public partial class newverreq : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsApproved",
                table: "VerificationRequests",
                newName: "RevievedByAdmin");

            migrationBuilder.RenameColumn(
                name: "EmployeeId",
                table: "VerificationRequests",
                newName: "RequestStatus");

            migrationBuilder.AddColumn<int>(
                name: "EmpAdmId",
                table: "VerificationRequests",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmpAdmId",
                table: "VerificationRequests");

            migrationBuilder.RenameColumn(
                name: "RevievedByAdmin",
                table: "VerificationRequests",
                newName: "IsApproved");

            migrationBuilder.RenameColumn(
                name: "RequestStatus",
                table: "VerificationRequests",
                newName: "EmployeeId");
        }
    }
}
