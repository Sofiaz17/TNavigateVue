**TNavigateVue**

Frontend for TNavigate project, it integrates Google Maps and a lightweight backend API. TNavigateVue provides map-based navigation, shop/product listing views and a Google-based authentication flow.

**Why This Project Is Useful**
- **Map-first UI:** Uses Google Maps to display routes, decode polylines and render map overlays.
- **Auth-ready:** Includes a callback and token storage flow to integrate with an OAuth-enabled backend.
- **Componentized:** Views and reusable components make it easy to extend (maps, tables, profile, auth).

**Quick Links**
- **Source:** `./src`
- **Main entry:** `src/main.js`
- **Map component:** `src/components/GMap.vue`
- **Auth callback:** `src/views/AuthCallback.vue`
- **Backend config helper:** `src/states/apiFunctions.js`

**Get Started (Developer)**

Prerequisites
- Install Node.js (18+ recommended) and `npm`.

Install dependencies

```powershell
npm install
```

Environment
- Create a `.env` file in the project root (Vite uses `import.meta.env`). At minimum set a Google API key and optional backend host:

```
VITE_API_KEY=your_google_maps_api_key
VITE_API_HOST=http://localhost:3000
```

Run the dev server

```powershell
npm run dev
```

Build for production

```powershell
npm run build
```

How auth works
- This frontend expects the backend to perform OAuth and redirect to the app's callback route with a `token` query parameter (handled by `src/views/AuthCallback.vue`). The token will be stored in `localStorage` and used by API calls to the backend. Configure `VITE_API_HOST` to point to your backend.

Project structure (high level)
- `src/components` - UI components (map, table views)
- `src/views` - top-level views and routes
- `src/states` - client-side state helpers and API helpers (e.g., `apiFunctions.js`, `mapsFunctions.js`)
- `public` - static assets

Notes & tips
- The app uses Vite + Vue 3. Scripts available in `package.json` are `dev`, `build` and `preview`.
- Google Maps requests in the code read `import.meta.env.VITE_API_KEY`. Keep the key secret and follow Google Cloud best practices (restrict by referrer/IP and use billing controls).
- If your backend exposes APIs that require authentication, ensure it sets `VITE_API_HOST` to the correct base URL.