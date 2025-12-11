using LendACarAPI.Data;
using Microsoft.AspNetCore.Mvc;
using LendACarAPI.Data;
using LendACarAPI.Data.Models;
using LendACarAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class BookmarkController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BookmarkController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> ToggleBookmark([FromBody] BookmarkRequest request)
    {
        var existing = await _context.Bookmarks
            .FirstOrDefaultAsync(b => b.UserId == request.UserId && b.VehicleId == request.VehicleId);

        if (existing != null)
        {
            _context.Bookmarks.Remove(existing);
        }
        else
        {
            _context.Bookmarks.Add(new Bookmark
            {
                UserId = request.UserId,
                VehicleId = request.VehicleId,
                DateCreated = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Bookmark>>> GetBookmarks([FromQuery] int userId)
    {
        var bookmarks = await _context.Bookmarks
            .Where(b => b.UserId == userId)
            .ToListAsync();

        return Ok(bookmarks);
    }
}


public class BookmarkRequest
{
    public int UserId { get; set; }
    public int VehicleId { get; set; }
}
