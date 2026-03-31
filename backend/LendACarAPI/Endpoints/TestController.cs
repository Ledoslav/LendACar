using LendACarAPI.Data;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class TestController(IRenderPDFReport renderPDF, IWebHostEnvironment env) : ControllerBase
    {
        [HttpGet]
        public IActionResult TestEndpoint()
        {
            if (!env.IsDevelopment()) return NotFound("Disabled in production.");
            var email = "john.doe@gmail.com";
            var password = "password";
            var name = "John Doe";
            var pdf = renderPDF.RednderEmployeeRegitserPDF(email, password,name);


            return File(pdf, "application/pdf", $"employee_{name}_info.pdf");
        }


        [HttpGet("env-test")]
        public IActionResult TestEndpoint2()
        {
            if (!env.IsDevelopment()) return NotFound("Disabled in production.");
            var test=Environment.GetEnvironmentVariable("SecretKey");

            return Ok(test);
        }


    }
}
