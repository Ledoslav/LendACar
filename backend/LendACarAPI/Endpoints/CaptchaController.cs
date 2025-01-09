using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace LendACarAPI.Endpoints
{
    [Route("api/[controller]")]
    [ApiController]
    public class CaptchaController : ControllerBase
    {
        [HttpPost("verify")]

        public async Task<ActionResult> VerifyCaptcha([FromBody] CaptchaRequest captchaRequest)
        {
            if (string.IsNullOrEmpty(captchaRequest.ResponseToken))
            {
                return BadRequest("CAPTCHA response is required");
            }

            HttpClient client = new HttpClient();

            string secretKey = "secretKey";

            string verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

            var requestData = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("secret", secretKey),
                new KeyValuePair<string, string>("response", captchaRequest.ResponseToken)
            });


            var response = await client.PostAsync(verifyUrl, requestData);
            var result = await response.Content.ReadAsStringAsync();

           
            if (response.IsSuccessStatusCode && result.Contains("\"success\": true"))
            {
                return Ok();
            }

            return BadRequest("CAPTCHA verification failed");
        }
        public class CaptchaRequest
        {
            public string ResponseToken { get; set; }
        }
    }
}

