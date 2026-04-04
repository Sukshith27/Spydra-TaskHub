# Task Manager App

A production-grade React Native CLI task management app with clean architecture, offline support, dark mode, and animations.

## Screenshots

| Login | Task List | Task Detail | Create Task |
|---|---|---|---|
| Clean login with validation | Tasks with search, filter, sort | Edit title, toggle status, share | Create with validation |

## Features

### Core
- ✅ Auth flow with form validation
- ✅ Persistent login state via AsyncStorage
- ✅ Task listing from JSONPlaceholder API
- ✅ Search with 400ms debounce
- ✅ Filter by All / Pending / Completed
- ✅ Filter count badges
- ✅ Sort by Default / Title / Status
- ✅ Pull to refresh
- ✅ Infinite scroll / load more
- ✅ Task detail with inline title edit
- ✅ Status toggle (Pending ↔ Completed)
- ✅ Create new task with validation
- ✅ Swipe left to delete task
- ✅ Mark all tasks as complete
- ✅ Share task via native share sheet

### Technical
- ✅ Offline-first — tasks cached to AsyncStorage
- ✅ Shows cached data when API fails
- ✅ Network status banner
- ✅ Dark mode support
- ✅ Skeleton loading cards
- ✅ Fade + slide animations on task cards
- ✅ Haptic feedback
- ✅ Safe area handling
- ✅ Error boundary
- ✅ Unit tests (validators + Redux slice)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native CLI 0.74 |
| Language | TypeScript |
| State | Redux Toolkit |
| Navigation | React Navigation v6 |
| Storage | AsyncStorage |
| API | JSONPlaceholder |
| Testing | Jest |

## Project Structure
```
src/
├── api/
│   └── todoApi.ts              # API service layer
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Loader.tsx
│   │   ├── NetworkBanner.tsx
│   │   └── SkeletonCard.tsx
│   └── tasks/
│       └── TaskCard.tsx        # Animated + swipeable card
├── hooks/
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   └── useTasks.ts
├── navigation/
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── RootNavigator.tsx
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx
│   └── tasks/
│       ├── TaskListScreen.tsx
│       ├── TaskDetailScreen.tsx
│       └── CreateTaskScreen.tsx
├── store/
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       └── tasksSlice.ts
├── theme/
│   ├── colors.ts               # Light + dark color tokens
│   ├── typography.ts
│   └── index.ts                # useTheme hook
├── types/
│   └── index.ts                # TypeScript interfaces
└── utils/
    ├── haptics.ts
    ├── storage.ts              # AsyncStorage service
    └── validators.ts
```

## Setup & Run

### Prerequisites
- Node.js 18+
- Android Studio + Android SDK
- Java 17
- Android device or emulator

### Steps
```bash
# 1. Clone the repo
git clone <https://github.com/Sukshith27/Spydra-TaskHub.git>
cd TaskApp

# 2. Install dependencies
npm install

# 3. Start Metro (Terminal 1)
yarn start --reset-cache

# 4. Run on Android (Terminal 2)
yarn android
```

### Run Tests
```bash
npx jest --watchAll=false
```

## API

Uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/todos) — free fake REST API.
- Fetches 20 tasks per page
- Pages load automatically on scroll
- Tasks cached locally after first fetch

## Offline Behaviour

1. First launch — fetches from API and caches to AsyncStorage
2. Subsequent launches — loads from cache instantly while fetching fresh data
3. No internet — loads from cache, shows offline banner
4. All local edits (title, status, delete, create) persist immediately

## Login

No real backend. Any credentials matching these rules work:
- Username: 3+ characters
- Password: 6+ characters

Login state persists across app restarts via AsyncStorage.