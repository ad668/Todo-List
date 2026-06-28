using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetTasks([FromQuery] string? status, [FromQuery] string? taskType, [FromQuery] string? shift, [FromQuery] string? search)
    {
        var userName = User.Identity?.Name ?? string.Empty;
        var role = User.FindFirstValue(ClaimTypes.Role);
        IQueryable<TaskItem> query = _context.Tasks;

        if (role != "Admin")
        {
            query = query.Where(t => t.UserName == userName);
        }

        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(t => t.Status == status);
        if (!string.IsNullOrWhiteSpace(taskType)) query = query.Where(t => t.TaskType == taskType);
        if (!string.IsNullOrWhiteSpace(shift)) query = query.Where(t => t.ShiftTime == shift);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(t => t.Title.Contains(search) || t.Description.Contains(search));

        var tasks = await query.OrderByDescending(t => t.CreatedDate).Select(t => new TaskResponse(
            t.Id,
            t.Title,
            t.Description,
            t.TaskType,
            t.Status,
            t.ShiftTime,
            t.CreatedDate,
            t.UpdatedDate,
            t.CompletedDate,
            t.ResolutionTimeInMinutes,
            t.IsCompleted,
            t.UserId,
            t.UserName,
            t.AuditDescr)).ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("mytasks")]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetMyTasks()
    {
        var userName = User.Identity?.Name ?? string.Empty;
        var tasks = await _context.Tasks.Where(t => t.UserName == userName).OrderByDescending(t => t.CreatedDate).Select(t => new TaskResponse(
            t.Id,
            t.Title,
            t.Description,
            t.TaskType,
            t.Status,
            t.ShiftTime,
            t.CreatedDate,
            t.UpdatedDate,
            t.CompletedDate,
            t.ResolutionTimeInMinutes,
            t.IsCompleted,
            t.UserId,
            t.UserName,
            t.AuditDescr)).ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskResponse>> GetTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Admin" && task.UserName != User.Identity?.Name)
        {
            return Forbid();
        }

        return Ok(new TaskResponse(task.Id, task.Title, task.Description, task.TaskType, task.Status, task.ShiftTime, task.CreatedDate, task.UpdatedDate, task.CompletedDate, task.ResolutionTimeInMinutes, task.IsCompleted, task.UserId, task.UserName, task.AuditDescr));
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> CreateTask([FromBody] TaskCreateRequest request)
    {
        var userName = User.Identity?.Name ?? string.Empty;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == userName);
        if (user == null) return Unauthorized();

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            TaskType = request.TaskType,
            Status = request.Status,
            ShiftTime = request.ShiftTime,
            CreatedDate = DateTime.UtcNow,
            UserId = user.Id,
            UserName = user.Username,
            IsCompleted = false,
            ResolutionTimeInMinutes = 0,
            AuditDescr = string.Empty
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, new TaskResponse(task.Id, task.Title, task.Description, task.TaskType, task.Status, task.ShiftTime, task.CreatedDate, task.UpdatedDate, task.CompletedDate, task.ResolutionTimeInMinutes, task.IsCompleted, task.UserId, task.UserName, task.AuditDescr));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskResponse>> UpdateTask(int id, [FromBody] TaskUpdateRequest request)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Admin" && task.UserName != User.Identity?.Name)
        {
            return Forbid();
        }


        var oldStatus = task.Status;
        var newStatus = request.Status ?? task.Status;
        var currentDate = DateTime.UtcNow.ToString("yyyy-MM-dd");

        task.Title = request.Title ?? task.Title;
        task.Description = request.Description ?? task.Description;
        task.TaskType = request.TaskType ?? task.TaskType;
        task.ShiftTime = request.ShiftTime ?? task.ShiftTime;
        task.UpdatedDate = DateTime.UtcNow;

        if (request.Status != null)
        {
            task.Status = request.Status;
        }
        if(request.Status == "Complete")
        {
            task.IsCompleted=true;
            task.CompletedDate=DateTime.UtcNow;
        }
        // Completion is irreversible: once completed, it can never be reverted.
        if (request.IsCompleted.HasValue)
        {
            if (task.IsCompleted && request.IsCompleted.Value == false)
            {
                return BadRequest("Completed task cannot be reverted.");
            }

            task.IsCompleted = request.IsCompleted.Value;
        }

        
        

        // Capture audit transitions
        if (request.Status != null && !string.Equals(oldStatus, newStatus, StringComparison.Ordinal))
        {
            // TCS Pending -> WIP
            if (oldStatus == "TCS Pending" && newStatus == "WIP")
            {
                task.AuditDescr = string.IsNullOrWhiteSpace(task.AuditDescr)
                    ? $"Task is move from pending -> WIP --{currentDate}"
                    : $"{task.AuditDescr}Task is move from pending -> WIP --{currentDate}";
            }

            // WIP -> ECU Pending
            if (oldStatus == "WIP" && newStatus == "ECU Pending")
            {
                task.AuditDescr = string.IsNullOrWhiteSpace(task.AuditDescr)
                    ? $"task is move from WIP -> ECU pending -- {currentDate}"
                    : $"{task.AuditDescr} || task is move from WIP -> ECU pending -- {currentDate}";
            }
            if (oldStatus == "ECU Pending" && newStatus == "WIP")
            {
                task.AuditDescr = string.IsNullOrWhiteSpace(task.AuditDescr)
                    ? $"task is move from ECU Pending -> WIP -- {currentDate}"
                    : $"{task.AuditDescr} || task is move from ECU Pending -> WIP -- {currentDate}";
            }
            if (oldStatus == "ECU Pending" && newStatus == "Complete")
            {
                task.AuditDescr = string.IsNullOrWhiteSpace(task.AuditDescr)
                    ? $"task is move from ECU Pending -> Completed -- {currentDate}"
                    : $"{task.AuditDescr} || task is move from ECU Pending -> Completed -- {currentDate}";
            }
        }

        // Set completion metadata only once.
        // if (task.IsCompleted)
        // {
            if (task.CompletedDate is not null)
            {
                // task.CompletedDate = DateTime.UtcNow;
                task.ResolutionTimeInMinutes = (int)((task.CompletedDate.Value - task.CreatedDate).TotalMinutes);
            }
        // }
        // else
        // {
        //     // Not completed => ensure completion metadata is empty.
        //     if (task.CompletedDate is not null)
        //     {
        //         task.CompletedDate = null;
        //         task.ResolutionTimeInMinutes = 0;
        //     }
        // }

        await _context.SaveChangesAsync();
        return Ok(new TaskResponse(task.Id, task.Title, task.Description, task.TaskType, task.Status, task.ShiftTime, task.CreatedDate, task.UpdatedDate, task.CompletedDate, task.ResolutionTimeInMinutes, task.IsCompleted, task.UserId, task.UserName, task.AuditDescr));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Admin" && task.UserName != User.Identity?.Name)
        {
            return Forbid();
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetTasksByStatus(string status)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var userName = User.Identity?.Name ?? string.Empty;
        IQueryable<TaskItem> query = _context.Tasks.Where(t => t.Status == status);
        if (role != "Admin")
        {
            query = query.Where(t => t.UserName == userName);
        }

        var tasks = await query.OrderByDescending(t => t.CreatedDate).Select(t => new TaskResponse(
            t.Id,
            t.Title,
            t.Description,
            t.TaskType,
            t.Status,
            t.ShiftTime,
            t.CreatedDate,
            t.UpdatedDate,
            t.CompletedDate,
            t.ResolutionTimeInMinutes,
            t.IsCompleted,
            t.UserId,
            t.UserName,
            t.AuditDescr)).ToListAsync();

        return Ok(tasks);
    }
}

