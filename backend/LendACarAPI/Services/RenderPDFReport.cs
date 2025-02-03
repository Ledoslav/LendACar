using QuestPDF.Companion;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Previewer;

namespace LendACarAPI.Services
{
    public class RenderPDFReport : IRenderPDFReport
    {
        public RenderPDFReport()
        {
            QuestPDF.Settings.License=QuestPDF.Infrastructure.LicenseType.Community;
        }

        public byte[] RednderEmployeeRegitserPDF(string email, string password,string name)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, QuestPDF.Infrastructure.Unit.Centimetre);

                    page.Header()
                        .AlignCenter() 
                        .Column(column =>
                        {
                            column.Spacing(0);

                            //Logo
                            column.Item().Width(100).AlignCenter().Image("Images\\LAC_logo.png");

                            //Company Name
                            column.Item().AlignCenter().PaddingBottom(25).Text("Lend A Car")
                                .FontSize(16)
                                .Bold();

                        });
                        

                    page.Content()
                        .AlignCenter()
                        .Column(column =>
                        {
                            column.Spacing(15);

                            column.Item().AlignCenter().PaddingBottom(10).Width(350).LineHorizontal(2);

                            column.Item().AlignCenter().PaddingBottom(20).Text("Employee System Access Data")
                                .Bold()
                                .FontSize(20);


                            //Employee Name
                            column.Item().AlignCenter().Text(name)
                                .FontSize(25);
                                

                            column.Item().AlignCenter().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(120); //Email Column 
                                    columns.ConstantColumn(120); //Password Column 
                                });

                                //Table Header
                                table.Header(header =>
                                {
                                    header.Cell().Background(Colors.LightBlue.Darken2).Border(1).AlignCenter().Text("Email").Bold();
                                    header.Cell().Background(Colors.LightBlue.Darken2).Border(1).AlignCenter().Text("Password").Bold();
                                });

                                //Table Rows 
                                table.Cell().Border(1).AlignCenter().Text(email);
                                table.Cell().Border(1).AlignCenter().Text(password);
                            });

                            //Warning message
                            column.Item().PaddingTop(20).AlignCenter().Text("Note that this password is temporary and you should change it immediately after receiving this paper!").FontColor(Colors.Red.Medium)
                            .FontSize(10);
                        });

                    page.Footer()
                    .Column(column =>
                    {
                        column.Item()
                        .PaddingVertical(10)
                        .Text(text =>
                        {
                            text.Span("Page ");
                            text.CurrentPageNumber();
                            text.Span(" of ");
                            text.TotalPages();
                            text.AlignCenter();
                        });
                    });
                });
            });

            //document.ShowInCompanion();

            return document.GeneratePdf();
        }
    }
}
