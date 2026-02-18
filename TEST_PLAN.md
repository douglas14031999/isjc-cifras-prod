# Test Strategy & Infrastructure Plan

**Date:** 2026-02-16
**Author:** @[test-engineer]
**Status:** Planning

## Executive Summary
This document outlines the testing strategy for the "isjc-cifras" platform. Currently, no automated tests exist. The goal is to establish a robust testing framework using Vitest and React Testing Library to ensure application stability and prevent regressions.

## Proposed Stack
-   **Framework:** Vitest (Fast, compatible with Next.js/Vite config).
-   **Integration:** `@testing-library/react`.
-   **Environment:** `jsdom`.
-   **Assertions:** Built-in `vi` and standard `@testing-library/jest-dom`.

## Test Pyramid Implementation

### 1. Unit Tests (High Volume)
**Focus:** Logic-heavy functions and utility helpers.
-   **Utilities**: `lib/utils` (class names, date formatting).
-   **Components**: Verify rendering of `Logo`, `Button variants`, `Badge states`.
-   **Hooks**: Validation logic, form state management.

### 2. Integration Tests (Medium Volume)
**Focus:** Interactions between components and basic data flow.
-   **Dashboard**: Mock API responses and verify correct stats rendering.
-   **Forms**: Verify `createMinistry` form validation (Zod schema checks) and submission handling.
-   **Login**: Verify form submission calls Supabase client mock correctly.

### 3. E2E Tests (Key Flows)
**Focus:** Critical user journeys. (Future Phase: Playwright)
-   Login -> Dashboard -> Logout.
-   Create Ministry -> Generate Invite Code.
-   Create Chord -> Verify in List.

## Immediate Action Items
1.  **Install Dependencies**: `npm install -D vitest @testing-library/react @testing-library/dom jsdom @vitejs/plugin-react`
2.  **Configure environment**: Setup `vitest.config.ts` and `setupTests.ts`.
3.  **Write Initial Tests**: Create tests for `Logo` component (smoke test) and `Login` form validation.

## Rollout Plan
- [x] Phase 1: Setup Infrastructure. (Completed)
- [x] Phase 2: Add Component Unit Tests. (Completed - Logo Test)
- [x] Phase 3: Add Integration Tests for Critical Actions (`createMinistry`, `LoginPage`). (Completed)
