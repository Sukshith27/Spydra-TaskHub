# Task Manager App

A production-grade React Native task management app built with clean architecture.

## Features

- Auth flow with validation and persistent login (AsyncStorage)
- Task listing with search, filter, pagination, pull-to-refresh
- Task detail with inline title editing and status toggle
- Create new tasks with validation
- Offline support — tasks cached locally, shown on API failure
- Redux Toolkit for state management
- Clean folder structure with separation of UI, logic, and API

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native CLI 0.74 |
| Language | TypeScript |
| State | Redux Toolkit |
| Navigation | React Navigation v6 |
| Storage | AsyncStorage |
| API | JSONPlaceholder |

## Project Structure
src/
├── api/          # API service layer
├── components/   # Reusable UI components
├── hooks/        # Custom hooks (useAuth, useTasks, useDebounce)
├── navigation/   # Stack navigators
├── screens/      # Screen components
├── store/        # Redux store + slices
├── theme/        # Colors and typography
├── types/        # TypeScript interfaces
└── utils/        # Storage service and validators

## Setup & Run

### Prerequisites
- Node.js 18+
- Android Studio + Android SDK
- Java 17

### Steps
```bash
# 1. Clone the repo
git clone <https://github.com/Sukshith27/Spydra-TaskHub.git>
cd TaskApp

# 2. Install dependencies
npm install

# 3. Start Metro
yarn start --reset-cache

# 4. Run on Android (new terminal)
yarn android
```

### Login
Use any username (3+ characters) and any password (6+ characters).

## API

Uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/todos) — a free fake REST API for testing.

## Offline Behaviour

- Tasks are saved to AsyncStorage after every successful API fetch
- If the API fails on launch, cached tasks are loaded automatically
- Login state persists across app restarts