// Export all API modules
export * from "./client";
export * from "./types";
export * from "./auth.api";
export * from "./habits.api";
export * from "./entries.api";
export * from "./stats.api";
export * from "./categories.api";
export * from "./settings.api";
export * from "./integrations.api";
export * from "./dashboard.api";
export * from "./todos.api";

// Re-export for convenience
export { authApi } from "./auth.api";
export { habitsApi } from "./habits.api";
export { entriesApi } from "./entries.api";
export { statsApi } from "./stats.api";
export { categoriesApi } from "./categories.api";
export { settingsApi } from "./settings.api";
export { integrationsApi } from "./integrations.api";
export { dashboardApi } from "./dashboard.api";
export { todosApi } from "./todos.api";
