---
alwaysApply: true
description: Available commands for development, testing, and building. Reference for AI agents.
---

# Commands

```bash
# Development
npm start                 # Start Metro bundler
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator

# Linting & Formatting
npm run lint             # Run ESLint
npm run prettier         # Format all source files

# Testing
npm test                 # Run all tests
npm test -- --testPathPattern="Text"          # Run tests matching pattern
npm test -- __tests__/Text.test.tsx           # Run specific test file
npm test -- --coverage  # Run with coverage

# Cleaning
npm run clean-android    # Clean Android build
npm run clean-ios        # Clean iOS build
npm run clean-watch      # Clean watchman cache
npm run clean-node       # Remove node_modules
```
