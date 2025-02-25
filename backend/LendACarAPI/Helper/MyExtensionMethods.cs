using System.Text.Json;
using System.Text.RegularExpressions;

namespace LendACarAPI.Helper;

public static class MyExtensionMethods
{
    public static string RemoveTags(this string input)
    {
        return Regex.Replace(input, "<.*?>", string.Empty);
    }

    public static List<T> GetRandomElements<T>(this IEnumerable<T> list, int elementsCount)
    {
        return list.OrderBy(arg => Guid.NewGuid()).Take(elementsCount).ToList();
    }

    public static string RandomString(int size)
    {
        const string characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_?";
        string result = string.Empty;
        int charactersLength = characters.Length;

        Random random = new Random();
        for (int i = 0; i < size; i++)
        {
            int randomIndex = random.Next(charactersLength);
            result += characters[randomIndex];
        }

        return result;
    }

    public static byte[] MyParseBase64(this string base64string)
    {
        base64string = base64string.Split(',')[1];
        return Convert.FromBase64String(base64string);
    }

    public static void AddPaginationHeader<T>(this HttpResponse response, MyPagedList<T> data)
    {
        var paginationHeader=new PaginationHeader(data.CurrentPage,data.PageSize,data.TotalCount,data.TotalPages,data.HasPrevious,data.HasNext);

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        response.Headers.Append("Pagination", JsonSerializer.Serialize(paginationHeader, options));
        response.Headers.Append("Access-Control-Expose-Headers", "Pagination");
    }
}