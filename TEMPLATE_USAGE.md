# Template Usage Guide

This guide covers what you need to do after cloning this template for a new project.

## Quick Start Checklist

### 1. Environment Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Update values:
  - `API_URL`: Your backend URL
  - `SERVICE_PROVIDER`: `http`, `firebase`, or `mock`
  - `ROOT_USERNAME`/`ROOT_PASSWORD`: Remove or change for mock auth

### 2. Firebase (if using Firebase provider)

- [ ] Create Firebase project at [Firebase Console](https://console.firebase.google.com)
- [ ] Download `google-services.json` → `android/app/`
- [ ] Download `GoogleService-Info.plist` → `ios/`
- [ ] Both files are gitignored - add them locally

### 3. Security

- [ ] The MMKV encryption key is now managed via Keychain/Keystore
- [ ] For production, ensure `initSecureStorage()` is called before auth
- [ ] Review `ROOT_CREDENTIALS` - they should be removed for production

### 4. Clean Up

- [ ] Remove example modules if not needed:
  - `src/modules/examples/`
  - `src/navigation/stacks/ExampleStackNavigator.tsx`
  - Update navigation routes
- [ ] Remove or update mock services for production
- [ ] Update `CLAUDE.md` and `AGENTS.md` with your project details

## Tasks

[ ] Firebase (iOS/Android)
[ ] Clean Up
[ ] Splash screen (iOS/Android)

## Need Help?

- Check `CLAUDE.md` for project-specific guidelines
- Check `AGENTS.md` for AI agent configuration
- Check `.factory/rules/` for architectural rules
