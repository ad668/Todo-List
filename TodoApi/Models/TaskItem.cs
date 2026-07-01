namespace TodoApi.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TaskType { get; set; } = "Other";
    public string Status { get; set; } = "TCS Pending";
    public string ShiftTime { get; set; } = "General";
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public int ResolutionTimeInMinutes { get; set; }
    public bool IsCompleted { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string AssignedToUserName { get; set; } = string.Empty;

    // Captures state transitions like:
    // "Task is move from pending -> WIP --2026-... || task is move from WIP -> ECU pending -- ..."
    public string AuditDescr { get; set; } = string.Empty;
}

