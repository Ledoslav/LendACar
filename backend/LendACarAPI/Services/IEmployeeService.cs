using LendACarAPI.DTOs;
using System.Linq;

namespace LendACarAPI.Services
{
    public interface IEmployeeService
    {
        IQueryable<EmployeeDto> GetFilteredEmployees(EmployeeFilterDto filter);
    }
}
