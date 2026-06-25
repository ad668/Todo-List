using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var role = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        var userName = User.Identity?.Name;
        var query = _context.Tasks.AsQueryable();

        if (role != "Admin")
        {
            query = query.Where(t => t.UserName == userName);
        }

        var total = await query.CountAsync();
        var pending = await query.CountAsync(t => t.Status == "TCS Pending");
        var wip = await query.CountAsync(t => t.Status == "WIP");
        var ecuPending = await query.CountAsync(t => t.Status == "ECU Pending");
        var completed = await query.CountAsync(t => t.Status == "Complete");

        return Ok(new
        {
            total,
            pending,
            wip,
            ecuPending,
            completed
        });
    }

    [HttpGet("charts")]
    public async Task<IActionResult> GetCharts()
    {
        var role = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        var userName = User.Identity?.Name;
        var query = _context.Tasks.AsQueryable();

        if (role != "Admin")
        {
            query = query.Where(t => t.UserName == userName);
        }

        var byStatus = await query.GroupBy(t => t.Status).Select(g => new { status = g.Key, count = g.Count() }).ToListAsync();
        var byUser = await query.GroupBy(t => t.UserName).Select(g => new { user = g.Key, count = g.Count() }).ToListAsync();
        var byShift = await query.GroupBy(t => t.ShiftTime).Select(g => new { shift = g.Key, count = g.Count() }).ToListAsync();
        var monthlyTrend = await query.Where(t => t.CreatedDate >= DateTime.UtcNow.AddMonths(-6)).GroupBy(t => new { t.CreatedDate.Year, t.CreatedDate.Month }).Select(g => new { month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("yyyy-MM"), count = g.Count() }).OrderBy(x => x.month).ToListAsync();

        return Ok(new
        {
            byStatus,
            byUser,
            byShift,
            monthlyTrend
        });
    }
}
