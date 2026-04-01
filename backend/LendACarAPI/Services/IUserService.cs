using LendACarAPI.DTOs;
using System.Linq;

namespace LendACarAPI.Services
{
    public interface IUserService
    {
        IQueryable<UserDto> GetFilteredUsers(UserFilterDto filter);
    }
}
