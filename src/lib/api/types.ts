// ============= Auth Types =============
export interface User {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============= Habit Types =============
export type HabitType = "BOOLEAN" | "QUANTITY" | "PERCENTAGE";
export type HabitFrequency = "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM";
export type HabitStatus = "ACTIVE" | "ARCHIVED" | "PAUSED";
export type CategoryType = "PERSONAL" | "WORK" | "HEALTH" | "SOCIAL" | "OTHER";

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
  userId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  type: HabitType;
  frequency: HabitFrequency;
  categoryId: string | null;
  icon: string | null;
  color: string | null;
  targetValue: number | null;
  unit: string | null;
  customSchedule: Record<string, unknown> | null;
  reminderEnabled: boolean;
  reminderTime: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  sortOrder: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  type: HabitType;
  frequency: HabitFrequency;
  categoryId?: string;
  icon?: string;
  color?: string;
  targetValue?: number;
  unit?: string;
  customSchedule?: Record<string, unknown>;
  reminderEnabled?: boolean;
  reminderTime?: string;
  sortOrder?: number;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  targetValue?: number;
  unit?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  sortOrder?: number;
}

export interface ListHabitsParams {
  type?: HabitType;
  frequency?: HabitFrequency;
  categoryId?: string;
  isArchived?: boolean;
}

export interface ArchiveHabitRequest {
  archive: boolean;
}

// ============= Entry Types =============
export interface ToggleHabitRequest {
  habitId: string;
  date?: string; // Optional, defaults to today
  completed?: boolean; // Optional, toggles if not provided
}

export interface BulkToggleUpdate {
  habitId: string;
  completed: boolean;
  date?: string; // Optional, defaults to today
}

export interface BulkToggleRequest {
  updates: BulkToggleUpdate[];
}

export type Mood = "HAPPY" | "NEUTRAL" | "SAD" | "ANXIOUS" | "ENERGETIC" | "TIRED";
export type Energy = "HIGH" | "MEDIUM" | "LOW";

export interface Entry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value: number | null;
  notes: string | null;
  mood: Mood | null;
  energy: Energy | null;
  location: string | null;
  weather: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryRequest {
  date: string;
  completed?: boolean;
  value?: number;
  notes?: string;
  mood?: Mood;
  energy?: Energy;
  location?: string;
  weather?: string;
}

export interface UpdateEntryRequest {
  completed?: boolean;
  value?: number;
  notes?: string;
  mood?: Mood;
  energy?: Energy;
  location?: string;
  weather?: string;
}

export interface ListEntriesParams {
  startDate?: string;
  endDate?: string;
}

export interface BulkEntryRequest {
  habitId: string;
  date: string;
  completed?: boolean;
  value?: number;
  notes?: string;
  mood?: Mood;
  energy?: Energy;
}

export interface BulkEntriesRequest {
  entries: BulkEntryRequest[];
}

export interface BulkEntriesResponse {
  created: number;
  entries: Entry[];
}

// ============= Stats Types =============
export type StatsPeriod = "week" | "month" | "year";

export interface HabitStreak {
  id: string;
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  updatedAt: string;
}

export interface OverviewStats {
  totalHabits: number;
  activeHabits: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

export interface TrendDataPoint {
  date: string;
  completionRate: number;
  totalCompleted: number;
}

export interface HabitStats {
  completionRate: number;
  totalEntries: number;
  completedEntries: number;
  currentStreak: number;
  bestStreak: number;
  averageValue?: number;
}

export interface StatsParams {
  period?: StatsPeriod;
  habitId?: string;
  startDate?: string;
  endDate?: string;
}

export interface WeeklyProgressDay {
  date: string; // YYYY-MM-DD
  dayName: string; // "Monday", "Tuesday", etc.
  dayShort: string; // "M", "T", "W", etc.
  total: number;
  completed: number;
  completionRate: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface WeeklySummary {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  totalPossible: number;
  totalCompleted: number;
  completionRate: number;
  activeHabits: number;
}

export interface WeeklyProgressData {
  weekData: WeeklyProgressDay[];
  summary: WeeklySummary;
}

// ============= Heatmap Types =============
export interface HeatmapDay {
  date: string;
  count: number;
  intensity: number;
}

export interface HeatmapStats {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  averagePerDay: string;
}

export interface HeatmapData {
  year: number;
  habitId: string | null;
  habits: Habit[];
  heatmap: HeatmapDay[];
  stats: HeatmapStats;
}

// ============= Category Types =============
export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  type: CategoryType;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
}

// ============= Settings Types =============
export type Theme = "LIGHT" | "DARK" | "AUTO";

export interface UserSettings {
  id: string;
  userId: string;
  weekStartDay: number; // 0-6, where 0 = Sunday
  theme: Theme;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  language: string;
  dateFormat: string;
  timeFormat: string;
}

export interface UpdateSettingsRequest {
  weekStartDay?: number;
  theme?: Theme;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  language?: string;
  dateFormat?: string;
  timeFormat?: string;
}

// ============= Integration Types =============
export interface SheetsIntegration {
  id: string;
  spreadsheetId: string;
  spreadsheetName: string;
  worksheetName: string;
  autoSync: boolean;
  syncFrequency?: number;
  lastSyncAt?: string;
  status: "CONNECTED" | "ERROR" | "SYNCING";
}

export interface ConnectSheetsRequest {
  spreadsheetId: string;
  spreadsheetName: string;
  worksheetName: string;
  accessToken: string;
  refreshToken: string;
  autoSync?: boolean;
  syncFrequency?: number;
}

export interface SyncStatusResponse {
  status: "IDLE" | "SYNCING" | "ERROR";
  lastSyncAt?: string;
  nextSyncAt?: string;
  error?: string;
}

// ============= API Response Wrappers =============
export interface ListResponse<T> {
  items: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

// ============= Dashboard Types =============
export interface TodayProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface BestStreak {
  days: number;
}

export interface ThisWeek {
  completions: number;
  change: number;
}

export interface TotalCompletions {
  count: number;
}

export interface DailyEntry {
  completed: boolean;
  value: number | null;
}

export interface WeekStats {
  completedDays: number;
  totalDays: number;
  completionRate: number;
}

export interface WeekHabit {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: HabitType;
  completed: boolean; // Today's status
  value: number | null;
  currentStreak: number;
  weekStats: WeekStats;
  dailyEntries: Record<string, DailyEntry>; // Date string -> entry
}

export interface TodayHabit {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: HabitType;
  completed: boolean;
  value: number | null;
  currentStreak: number;
}

export interface DashboardData {
  todayProgress: TodayProgress;
  bestStreak: BestStreak;
  thisWeek: ThisWeek;
  totalCompletions: TotalCompletions;
  todayHabits?: TodayHabit[]; // Legacy - for backward compatibility
  weekHabits?: WeekHabit[]; // New structure with daily entries
}

export interface ToggleHabitRequest {
  habitId: string;
  date?: string; // YYYY-MM-DD format, defaults to today
  completed?: boolean; // If omitted, it will toggle
}

export interface CalendarHabitInfo {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: HabitType;
}

export interface CalendarHabitEntry {
  habitId: string;
  habitName: string;
  completed: boolean;
  value: number | null;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  habits: CalendarHabitEntry[];
  completedCount: number;
  totalHabits: number;
  completionRate: number;
}

export interface CalendarData {
  habits: CalendarHabitInfo[];
  calendar: CalendarDay[];
}

export interface CalendarParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

// ============= Todo Types =============
export type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Todo {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateTodoRequest {
  title: string;
  priority?: TodoPriority;
  tags?: string[];
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
  priority?: TodoPriority;
  tags?: string[];
}

export interface TodosResponse {
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TodoSortBy = "createdAt" | "updatedAt" | "priority" | "title";
export type TodoSortOrder = "asc" | "desc";

export interface TodoFilters {
  completed?: boolean;
  priority?: TodoPriority;
  tags?: string[];
  sortBy?: TodoSortBy;
  sortOrder?: TodoSortOrder;
  page?: number;
  limit?: number;
}
