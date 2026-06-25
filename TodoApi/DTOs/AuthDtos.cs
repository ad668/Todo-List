namespace TodoApi.DTOs;

public record RegisterRequest(string Username, string Email, string Password, string ConfirmPassword);

public record LoginRequest(string UsernameOrEmail, string Password);

public record AuthResponse(string Token, string Role, string Username, string Email);
