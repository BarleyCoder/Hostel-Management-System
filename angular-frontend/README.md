# CampusStay Angular frontend

This sibling Angular 21 application is the new frontend for the existing Hostel Management System API. The original `student-frontend/` React/Vite folder has been preserved. Angular CLI 21 is used because the installed Node.js 22.17.0 is below the Angular CLI 22 minimum version.

## Run in Windows PowerShell

Start the API in a separate terminal:

```powershell
Set-Location "C:\Users\LATITUDE 7490\Documents\Hostel-Management-System\backend"
npm start
```

Then start Angular in another terminal:

```powershell
Set-Location "C:\Users\LATITUDE 7490\Documents\Hostel-Management-System\angular-frontend"
npm start
```

Open `http://localhost:3000`. The API URL is set in `src/environments/environment.ts`. Do not put database credentials, JWT secrets, or other secrets in the frontend. The backend `.env` is backend-only and ignored by Git.

## Build

From `angular-frontend/`:

```powershell
npm run build
```

Angular uses the application builder and Tailwind CSS v4 through `@tailwindcss/postcss`, configured by `.postcssrc.json` and imported by `src/styles.css`.

## Routes

- `/login`, `/register`
- `/dashboard`, `/hostels`, `/hostels/:id`, `/applications`, `/my-room`, `/profile` (student)
- `/admin` (administrator)

Profile is read-only because the existing backend does not expose a profile-update endpoint. The UI does not offer admin-account creation; the existing route requires an authenticated administrator.

## Verification note

The Angular production build and browser rendering have been checked. Complete real account/data workflow tests only when MongoDB Atlas is reachable and use institution-provided student/admin accounts. Do not enter real credentials in source files or terminal logs.
