export interface UserCountByMonth {
  monthName: string;
  userCount: number;
}

export interface DashboardTotalCountsDto {
  userCount: number;
  vehicleCount: number;
  employeeCount: number;
  userCountByMonth: UserCountByMonth[];
}
