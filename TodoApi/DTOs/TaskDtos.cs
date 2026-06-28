namespace TodoApi.DTOs;

public record TaskCreateRequest(string Title, string Description, string TaskType, string Status, string ShiftTime);

public record TaskUpdateRequest(string? Title, string? Description, string? TaskType, string? Status, string? ShiftTime, bool? IsCompleted);

public record TaskResponse(int Id, string Title, string Description, string TaskType, string Status, string ShiftTime, DateTime CreatedDate, DateTime? UpdatedDate, DateTime? CompletedDate, int ResolutionTimeInMinutes, bool IsCompleted, int UserId, string UserName, string AuditDescr);

