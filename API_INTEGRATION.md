# ✅ Habit + Notes + Streaks — UI Integration Guide

This system supports:

* Daily habit completion
* Optional daily notes (up to ~500 words)
* Streak tracking
* Milestone-based celebration messages only

---

## 1️⃣ Dashboard / Daily View API

### 🔹 Purpose

Used to render:

* Today's habits
* Whether a habit is active (completed) today
* Notes for today (if any)
* Weekly view (per-day completion + notes)

### 🔹 Endpoint

```
GET /api/v1/stats/dashboard
```

### 🔹 What UI gets (important fields only)

```json
{
  "data": {
    "todayEntries": [
      {
        "habitId": "habit-uuid",
        "completed": true,
        "value": null,
        "notes": "Felt great after workout",
        "date": "2026-01-19T00:00:00.000Z"
      }
    ],
    "weeklyStats": [
      {
        "habitId": "habit-uuid",
        "dailyEntries": [
          {
            "date": "2026-01-19",
            "completed": true,
            "notes": "Morning run"
          },
          {
            "date": "2026-01-18",
            "completed": false,
            "notes": ""
          }
        ]
      }
    ]
  }
}
```

### 🔹 UI usage

* Checkbox state → `completed`
* Notes textarea → `notes`
* Show weekly grid with notes tooltip / modal

---

## 2️⃣ Toggle Habit (Checkbox Click)

### 🔹 Purpose

* User clicks the habit checkbox
* Optionally adds notes at the same time
* Backend updates streak + milestones

### 🔹 Endpoint

```
POST /api/v1/stats/toggle-habit
```

### 🔹 Request

```json
{
  "habitId": "habit-uuid",
  "date": "2026-01-19",     // optional (defaults to today)
  "notes": "Did 20 pushups" // optional
}
```

### 🔹 Response (important structure)

```json
{
  "data": {
    "entry": {
      "habitId": "habit-uuid",
      "completed": true,
      "notes": "Did 20 pushups"
    },
    "streak": {
      "habitId": "habit-uuid",
      "currentStreak": 7,
      "longestStreak": 7,
      "milestones": {
        "milestone": true,
        "streakMessage": "🎉 Congratulations! You've hit a 7-day streak!"
      }
    },
    "streakMessage": "🎉 Congratulations! You've hit a 7-day streak!"
  }
}
```

### 🔹 UI rules

* ✅ If `streak.milestones.milestone === true` → show celebration
* ❌ If false → do nothing (no toast, no animation)

---

## 3️⃣ Save / Edit Notes (Without Toggling)

### 🔹 Purpose

* User writes or edits notes without changing completion
* Still returns streak info (in case completion is included)

### 🔹 Endpoint

```
POST /api/v1/stats/save-note
```

### 🔹 Request

```json
{
  "habitId": "habit-uuid",
  "date": "2026-01-19",
  "notes": "Struggled today but showed up",
  "completed": true   // optional
}
```

### 🔹 Response

```json
{
  "data": {
    "entry": {
      "habitId": "habit-uuid",
      "notes": "Struggled today but showed up"
    },
    "streak": {
      "milestones": {
        "milestone": false,
        "streakMessage": ""
      }
    }
  }
}
```

### 🔹 UI rules

* Use this endpoint for **notes-only saves**
* Show celebration **only if milestone === true**

---

## 4️⃣ Bulk Toggle (Multi-Habit Save)

### 🔹 Purpose

* "Save" button on daily checklist
* Supports notes per habit
* Returns streaks per habit

### 🔹 Endpoint

```
POST /api/v1/stats/bulk-toggle-habits
```

### 🔹 Request

```json
{
  "updates": [
    {
      "habitId": "h1",
      "date": "2026-01-19",
      "completed": true,
      "notes": "Morning yoga"
    },
    {
      "habitId": "h2",
      "date": "2026-01-19",
      "completed": false
    }
  ]
}
```

### 🔹 Response (key part)

```json
{
  "data": {
    "streaks": [
      {
        "habitId": "h1",
        "currentStreak": 7,
        "longestStreak": 7,
        "milestones": {
          "milestone": true,
          "streakMessage": "🎉 You activated a 7-day milestone!"
        }
      },
      {
        "habitId": "h2",
        "currentStreak": 0,
        "longestStreak": 8,
        "milestones": {
          "milestone": false,
          "streakMessage": ""
        }
      }
    ],
    "streakMessages": [
      {
        "habitId": "h1",
        "message": "🎉 You activated a 7-day milestone!"
      }
    ]
  }
}
```

### 🔹 UI rules

* Loop through `streaks`
* Celebrate only habits where:

```ts
streak.milestones.milestone === true
```

* If multiple → show stacked toast or summary modal

---

## 5️⃣ Milestone Engine (What triggers celebration)

### 🎯 Milestones supported

* **Personal longest streak**
* **Fixed thresholds**

  * 7 days
  * 15 days
  * 30 days
  * 50 days
  * 75 days
  * 100 days
  * After 100 → every +25 (125, 150, 175…)

### 🚨 Important rule

> ❗ **No milestone → no streakMessage → no UI celebration**

---

## 6️⃣ Delete Habit

### 🔹 Endpoint

```
DELETE /api/v1/habits/:id
```

### 🔹 UI usage

* Permanently deletes habit
* Entries, streaks, notes are removed (cascade)

---

## 🧠 UI Integration Summary (Cheat Sheet)

| Feature             | API                              |
| ------------------- | -------------------------------- |
| Dashboard + notes   | `GET /stats/dashboard`           |
| Toggle habit        | `POST /stats/toggle-habit`       |
| Save/edit notes     | `POST /stats/save-note`          |
| Bulk save           | `POST /stats/bulk-toggle-habits` |
| Celebration trigger | `milestones.milestone === true`  |
| Delete habit        | `DELETE /habits/:id`             |

---

## 🎨 Frontend Implementation Notes

### Notes Feature (Already Implemented)

* **Character limit**: 3000 characters (~500 words)
* **Location**: Inline with checkbox (horizontal layout)
* **Visibility**: 
  - Always visible when note exists
  - Shows on hover for current day
  - Icon: `MessageSquare` from lucide-react
* **Color**: Muted foreground color for consistency
* **API**: Uses `entriesApi.bulkUpsert()` for save/update

### Celebration System

* Uses `MilestoneBadge` component with confetti
* Triggered by `useMilestoneTracker` hook
* Only shows when `milestones.milestone === true`
* Displays custom `streakMessage` from API

### State Management

* Uses TanStack Query for API calls
* Optimistic UI updates with local toggle state
* Debounced bulk save (300ms delay)
* Auto-refetch dashboard after mutations

### Key Files

* `src/lib/api/types.ts` - TypeScript interfaces
* `src/lib/api/dashboard.api.ts` - Dashboard API client
* `src/lib/api/entries.api.ts` - Entry/notes API client
* `src/hooks/api/useBulkToggleHabits.ts` - Bulk toggle with milestones
* `src/components/habits/HabitNoteDialog.tsx` - Note editor
* `src/components/habits/HabitTableGrid.tsx` - Grid with note icons
* `src/components/milestones/MilestoneBadge.tsx` - Celebration dialog

---

## 🔧 Base URL Configuration

All API calls use the base URL from environment:

```
http://localhost:8787/api/v1
```

Make sure your `.env` file includes:

```
VITE_API_BASE_URL=http://localhost:8787/api/v1
```

---

## 🚀 Quick Start

1. **Dashboard load**: `useDashboard()` hook auto-fetches
2. **Toggle habit**: Click checkbox → `handleToggle()` → debounced bulk save
3. **Add note**: Click note icon → opens `HabitNoteDialog` → saves via `entriesApi.bulkUpsert()`
4. **Milestone celebration**: Auto-triggered by `useMilestoneTracker` when API returns `milestone: true`

That's it! The system handles streaks, notes, and celebrations automatically.
