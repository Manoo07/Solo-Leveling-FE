# API Integration Examples

This document shows practical examples of how to use the newly integrated APIs.

## 1. Single Habit Toggle with Notes (Immediate Save)

Use this for instant habit toggling with optional notes and milestone celebrations:

```tsx
import { useToggleHabit } from '@/hooks/api';
import { useMilestoneTracker } from '@/components/milestones/MilestoneBadge';

function MyComponent() {
  const { addMilestone } = useMilestoneTracker();
  
  const toggleMutation = useToggleHabit((response, habitName) => {
    // This callback fires only when milestone === true
    addMilestone({
      habitName,
      message: response.streak.milestones.streakMessage,
      currentStreak: response.streak.currentStreak,
    });
  });

  const handleQuickToggle = (habitId: string, habitName: string) => {
    toggleMutation.mutate({
      habitId,
      date: '2026-01-19', // optional, defaults to today
      notes: 'Quick note', // optional
      habitName, // for milestone callback
    });
  };

  return (
    <button onClick={() => handleQuickToggle('habit-id', 'Morning Run')}>
      Toggle Habit
    </button>
  );
}
```

## 2. Save/Edit Notes Only (Without Toggling)

Use the `saveNote` API directly for note management:

```tsx
import { dashboardApi } from '@/lib/api/dashboard.api';
import { useMilestoneTracker } from '@/components/milestones/MilestoneBadge';

async function handleSaveNote(habitId: string, date: string, note: string) {
  const { addMilestone } = useMilestoneTracker();
  
  const response = await dashboardApi.saveNote({
    habitId,
    date,
    notes: note,
    completed: true, // optional - include current completion status
  });

  // Check for milestone
  if (response.streak?.milestones?.milestone) {
    addMilestone({
      habitName: 'Your Habit Name',
      message: response.streak.milestones.streakMessage,
      currentStreak: response.streak.currentStreak,
    });
  }
}
```

## 3. Bulk Toggle (Current Implementation)

This is already integrated in `Index.tsx`:

```tsx
import { useDebouncedBulkToggle } from '@/hooks/api/useBulkToggleHabits';
import { useMilestoneTracker } from '@/components/milestones/MilestoneBadge';

function Dashboard() {
  const { addMilestone } = useMilestoneTracker();
  
  const { queueUpdate, flush } = useDebouncedBulkToggle(
    undefined,
    (data) => {
      // Handle multiple milestones
      data.streaks.forEach(streak => {
        if (streak.milestones.milestone) {
          const habit = habits.find(h => h.id === streak.habitId);
          addMilestone({
            habitName: habit?.name || 'Unknown',
            message: streak.milestones.streakMessage,
            currentStreak: streak.currentStreak,
          });
        }
      });
    }
  );

  const handleToggle = (habitId: string, date: string, completed: boolean) => {
    queueUpdate({
      habitId,
      date,
      completed,
      notes: 'Optional note', // Add notes during toggle
    });
  };

  const handleSave = () => {
    flush(); // Sends all queued updates
  };

  return (
    <>
      <Checkbox onChange={() => handleToggle('id', '2026-01-19', true)} />
      <Button onClick={handleSave}>Save All</Button>
    </>
  );
}
```

## 4. API Response Structure

### Toggle Habit Response
```json
{
  "entry": {
    "id": "entry-uuid",
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
```

### Save Note Response
```json
{
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
```

### Bulk Toggle Response
```json
{
  "updated": 2,
  "results": [...],
  "streaks": [
    {
      "habitId": "h1",
      "currentStreak": 7,
      "longestStreak": 7,
      "milestones": {
        "milestone": true,
        "streakMessage": "🎉 You activated a 7-day milestone!"
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
```

## 5. Milestone Celebration Rules

✅ **Always check** `streak.milestones.milestone === true` before showing celebrations

❌ **Never show** toasts/animations if `milestone === false`

```tsx
// ✅ CORRECT
if (response.streak?.milestones?.milestone) {
  addMilestone({
    habitName: 'Running',
    message: response.streak.milestones.streakMessage,
    currentStreak: response.streak.currentStreak,
  });
}

// ❌ WRONG - Don't show celebrations without checking
addMilestone({
  habitName: 'Running',
  message: 'You completed a habit!', // Generic message, not from API
  currentStreak: 1,
});
```

## 6. TypeScript Types

All types are exported from `@/lib/api/types`:

```tsx
import type {
  ToggleHabitRequest,
  ToggleHabitResponse,
  SaveNoteRequest,
  SaveNoteResponse,
  BulkToggleUpdate,
  BulkToggleResponse,
  MilestoneInfo,
  StreakUpdate,
} from '@/lib/api/types';
```

## 7. Current Integration Status

| Feature | API Endpoint | Hook | Status |
|---------|-------------|------|--------|
| Dashboard load | `GET /stats/dashboard` | `useDashboard` | ✅ Integrated |
| Single toggle | `POST /stats/toggle-habit` | `useToggleHabit` | ✅ New hook created |
| Save notes | `POST /stats/save-note` | Direct API call | ✅ Integrated in Index.tsx |
| Bulk toggle | `POST /stats/bulk-toggle-habits` | `useBulkToggleHabits` | ✅ Already working |
| Delete habit | `DELETE /habits/:id` | `useDeleteHabit` | ✅ Already working |
| Milestone UI | - | `useMilestoneTracker` | ✅ Working with confetti |

## 8. Notes Feature

- **Character Limit**: 3000 characters (~500 words)
- **UI Location**: Inline note icon next to checkbox
- **Visibility**: Shows on hover, always visible when note exists
- **Save Method**: Uses `dashboardApi.saveNote()` API
- **Milestone Support**: Yes - triggers celebration if milestone achieved while saving notes

## 9. Migration Notes

### Before (Old way - using bulkUpsert)
```tsx
await entriesApi.bulkUpsert({
  entries: [{ habitId, date, notes: note }]
});
```

### After (New way - using saveNote)
```tsx
const response = await dashboardApi.saveNote({
  habitId,
  date,
  notes: note
});

// Plus milestone support!
if (response.streak?.milestones?.milestone) {
  // Show celebration
}
```

## 10. Key Files Modified

1. **Types**: `src/lib/api/types.ts`
   - Added `ToggleHabitResponse`, `SaveNoteRequest`, `SaveNoteResponse`
   - Updated `BulkToggleUpdate` to support notes

2. **API Client**: `src/lib/api/dashboard.api.ts`
   - Added `saveNote()` method
   - Updated `toggleHabit()` return type

3. **Hooks**: `src/hooks/api/useToggleHabit.ts` (NEW)
   - Single habit toggle with milestone callback

4. **UI**: `src/pages/Index.tsx`
   - Updated `handleSaveNote()` to use new API
   - Added milestone celebration support in note saves

That's it! All APIs from the documentation are now integrated and ready to use.
