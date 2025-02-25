namespace LendACarAPI.Services
{
    public interface IRenderPDFReport
    {
        public byte[] RednderEmployeeRegitserPDF(string email, string password,string name);
    }
}
