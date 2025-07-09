using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LendACarAPI.Services
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class MyAuthorizationAttribute(bool IsAdmin, bool IsEmployee,bool isAppUser) : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var authService=context.HttpContext.RequestServices.GetService<IAuthService>();


            bool isCurrentUserAppUser=false;
            bool isCurrentUserAdmin=false;
            bool isCurrentUserEmployee = false;


            if (authService == null)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var claims = authService.GetAuthInfoFromRequest();
            if (claims == null)
            {
                context.Result = new UnauthorizedResult();
                return;
            }



            if (isAppUser && claims.IsAppUser)
                isCurrentUserAppUser = true;


            if (IsAdmin && claims.IsAdmin)
                isCurrentUserAdmin= true;
            
            if (IsEmployee && claims.IsEmployee)
                isCurrentUserEmployee= true;


            if (!isCurrentUserEmployee && !isCurrentUserAdmin && !isCurrentUserAppUser)
            {
                context.Result = new ObjectResult(new { message = "You are not authorized to access this resource." })
                {
                    StatusCode = 403 
                };
                return;
            }
        }
    }
}
