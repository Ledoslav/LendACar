using LendACarAPI.Endpoints;

namespace LendACarAPI.DTOs
{
    public class DashboardTotalCountsDto
    {
        public int UserCount { get; set; }
        public int VehicleCount { get; set; }
        public int EmployeeCount { get; set; }
        public List<UserCountByMonth> UserCountByMonth { get; set; }
    }
}
