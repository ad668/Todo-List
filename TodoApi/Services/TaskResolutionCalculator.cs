namespace TodoApi.Services;

public static class TaskResolutionCalculator
{
    public static int CalculateResolutionTimeInMinutes(DateTime createdDate, DateTime? completedDate)
    {
        if (completedDate is null) return 0;
        return Math.Max(0, (int)(completedDate.Value - createdDate).TotalMinutes);
    }
}
