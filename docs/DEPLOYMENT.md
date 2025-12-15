# Deployment Guide

This document provides instructions for deploying **TranscriptedAI** to production.

## 1. Production Architecture

TranscriptedAI is a **Client-Side Single Page Application (SPA)**.
This means:
1.  It is served as static files (HTML, CSS, JS).
2.  It runs entirely in the user's browser.
3.  It communicates directly with the Google Gemini API from the client.

There is no intermediate Node.js backend server required for operation, making it ideal for hosting on CDN-based platforms like Vercel, Netlify, or Firebase Hosting.

---

## 2. Environment Configuration

The application relies on the Google Gemini API Key. In the code, this is accessed via:

```typescript
const API_KEY = process.env.[[YOUR_API_KEY]];
```

### Handling Secrets in Production
Since this is a client-side app, **the API key will be embedded in the JavaScript bundle** and visible to anyone who inspects the network traffic.

**Security Requirement:**
You **MUST** restrict your API Key in Google AI Studio to prevent unauthorized usage.
1.  Go to [Google AI Studio > Get API Key](https://aistudio.google.com/app/apikey).
2.  Select your key.
3.  Under **"API key restrictions"**, select **"Websites"**.
4.  Add your production domain (e.g., `https://my-transcript-app.vercel.app`).

---

## 3. Build Process

The project is configured to use a modern bundler (typically Vite) to transpile TypeScript/React into static assets.

### Build Command
To generate the production build:

```bash
npm run build
```

This command will:
1.  Compile `src` files.
2.  Replace `process.env.[[YOUR_API_KEY]]` with the actual value provided in your build environment.
3.  Minify assets.
4.  Output files to the `dist/` or `build/` directory.

---

## 4. Hosting Providers

### Option A: Vercel (Recommended)

Vercel provides excellent support for SPAs and environment variable injection.

1.  **Push code** to a Git repository (GitHub/GitLab).
2.  **Import Project** in Vercel.
3.  **Configure Project:**
    *   **Framework Preset:** Vite
    *   **Root Directory:** `./`
4.  **Environment Variables:**
    *   Add `[[YOUR_API_KEY]]` with your Google Gemini API key value.
5.  **Deploy.**

### Option B: Netlify

1.  **New Site from Git** in Netlify Dashboard.
2.  **Build Settings:**
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `dist`
3.  **Environment Variables:**
    *   Go to **Site Settings > Build & Deploy > Environment**.
    *   Add `[[YOUR_API_KEY]]`.
4.  **Deploy Site.**

### Option C: Firebase Hosting

If you plan to implement the "Cloud Sync" feature later, Firebase is a strong choice.

1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize: `firebase init hosting`
    *   **Public directory:** `dist`
    *   **Configure as a single-page app:** `Yes`
4.  Build: `npm run build` (Ensure your local env has the key, or use a CI/CD pipeline).
5.  Deploy: `firebase deploy`

---

## 5. Post-Deployment Verification

After deploying, perform the following "Smoke Test":

1.  **Load the URL:** Ensure the landing page renders without console errors.
2.  **Upload a File:** Upload a small audio file (< 1MB).
3.  **Check Network:** Open DevTools > Network. Verify the request to `generativelanguage.googleapis.com` returns a `200 OK`.
    *   If you get a `403 Forbidden` or `400 Bad Request` with "API key not valid", check your **Google AI Studio Key Restrictions** and your **Hosting Provider Environment Variables**.
4.  **Verify Features:** Ensure the summary and insights generate correctly.

---

## 6. Continuous Integration (CI)

For robust development, set up a CI pipeline (GitHub Actions) to run the test suite before deploying.

**Example Workflow (`.github/workflows/deploy.yml`):**
1.  Checkout Code.
2.  Install Dependencies (`npm ci`).
3.  Run Tests (`npm test` - *Note: Requires configuring the TestRunner for CLI*).
4.  Build (`npm run build`).
5.  Deploy to Production.
