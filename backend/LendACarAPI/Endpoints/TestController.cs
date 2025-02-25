using LendACarAPI.Data;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController(IRenderPDFReport renderPDF) : ControllerBase
    {
        [HttpGet]
        public IActionResult TestEndpoint()
        {
            var email = "john.doe@gmail.com";
            var password = "password";
            var name = "John Doe";
            var pdf = renderPDF.RednderEmployeeRegitserPDF(email, password,name);


            return File(pdf, "application/pdf", $"employee_{name}_info.pdf");
        }


        [HttpGet("env-test")]
        public IActionResult TestEndpoint2()
        {
            var test=Environment.GetEnvironmentVariable("SecretKey");

            return Ok(test);
        }


    }
}
