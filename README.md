# React Native Clean Architecture Starter 🚀

![React Native](https://img.shields.io/badge/react--native-0.83.4-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.8.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

[![Unit Tests](https://github.com/alejandro-technology/react-native-template/actions/workflows/unit-test.yml/badge.svg?branch=main)](https://github.com/alejandro-technology/react-native-template/actions/workflows/unit-test.yml)
[![APK Build](https://github.com/alejandro-technology/react-native-template/actions/workflows/android-apk.yml/badge.svg?branch=main)](https://github.com/alejandro-technology/react-native-template/actions/workflows/android-apk.yml)
[![iOS Build](https://github.com/alejandro-technology/react-native-template/actions/workflows/ios-build.yml/badge.svg?branch=main)](https://github.com/alejandro-technology/react-native-template/actions/workflows/ios-build.yml)

[![platform - android](https://img.shields.io/badge/platform-Android-3ddc84.svg?logo=android&style=for-the-badge)](https://www.android.com)
[![platform - ios](https://img.shields.io/badge/platform-iOS-000.svg?logo=apple&style=for-the-badge)](https://developer.apple.com/ios)

A **production-ready React Native starter** built with **Clean Architecture**, **TypeScript**, and **AI-First principles**.

Designed to help developers build **scalable mobile applications** with a modular architecture, real-world examples, and preconfigured tooling.

Perfect for:

- production apps
- scalable React Native projects
- teams adopting Clean Architecture
- AI-assisted development workflows

---

## 🎥 Demo

> Screenshots / GIFs coming soon

## ✨ Features

- 🧱 Clean Architecture modular structure
- 🔒 Authentication module (Firebase ready, Http)
- 🗂 Feature-based folder architecture
- ⚡ Zustand + React Query state management
- 💾 Data caching
- 📄 Forms with validations
- 🧰 Svg, Permissions, Image Picker 
- ⚙️ Environment variables
- 🔐 Security storage (Secrets, Keychain)
- 🎨 Design System with theme tokens
- 🧩 Reusable UI components (Button, Input, Select, Date, Checkbox, etc...)
- 🔄 Example CRUD module
- 🧪 Jest testing setup
- 🧹 ESLint + Prettier
- 🤖 AI-friendly architecture for code agents

## 🤔 Why this template?

Most React Native starters are either:

- too minimal
- too opinionated
- missing real-world examples

This template focuses on:

✔ scalable architecture  
✔ modular feature development  
✔ production-ready setup  
✔ real example modules  
✔ compatibility with AI developer tools

# ⚡ Quick Start (CLI Tool)

This template will have a companion CLI to extract modules:

```bash
npm init react-native-init-app
```
or
```bash
bunx create-react-native-init-app
# or
npx create-react-native-init-app
```

# 🚀 Manual Installation

## Prerequisites
- Node.js (v22+ recommended)
- Ruby (for CocoaPods)
- JDK 17+
- Android Studio & Xcode (for iOS)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/alejandro-technology/react-native-template.git
    cd react-native-template
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Install iOS Pods:**
    ```bash
    cd ios && bundle install && bundle exec pod install && cd ..
    # or
    npm run pod-cocoa && npm run pod-install
    ```

## Running the App

- **Start Metro Bundler:**
  ```bash
  npm start
  ```

- **Run on iOS:**
  ```bash
  npm run ios
  ```

- **Run on Android:**
  ```bash
  npm run android
  ```


# 📂 Project Structure

The project follows a **Modular Architecture**. Each feature is a self-contained module in `src/modules/` containing its own layers:

```
src/
├── assets/               # Shared UI assets (Core & Form)
├── components/           # Shared UI components (Core & Form)
├── config/               # App-wide configuration (API, Storage)
├── modules/              # Feature Modules
│   ├── authentication/   # Auth module
│   ├── products/         # Example CRUD module
│   └── examples/         # UI Component Showcase
├── navigation/           # Root navigation configuration
├── providers/            # App-wide providers (Theme, Auth, QueryClient)
├── theme/                # Design tokens (Colors, Typography, Spacing)
└── utils/                # Utilities for testing
```

## 🧠 Module Anatomy (Clean Architecture)
Each module (e.g., `src/modules/products/`) is divided into:
1.  **Domain:** Entities, Repository Interfaces, Errors (Pure TS, no React/Lib dependencies).
2.  **Application:** Use Cases, State Management (Zustand/Query), Logic.
3.  **Infrastructure:** API calls, Database implementation, Third-party adapters.
4.  **UI:** Screens, Components, Navigation.

# 🛠 Available Scripts

- `npm run lint`: Run ESLint.
- `npm run test`: Run Jest tests.
- `npm run clean-android`: Deep clean Android build.
- `npm run clean-ios`: Deep clean iOS build (DerivedData + Pods).
- `npm run clean-watch`: Reset Watchman (fixes Metro issues).

# 🧩 Included Modules

- **Authentication:** Complete Sign In / Sign Up flow with Firebase integration.
- **Products:** A full CRUD example demonstrating the 4-layer architecture with listing, details, and creation forms.
- **Users:** A module for user profile management.
- **Examples:** A gallery of UI components to visualize the design system.

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Open a Pull Request

# 📄 License

MIT
