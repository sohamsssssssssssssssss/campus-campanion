# CampusCompanion AI — Frontend

A stunning, production-grade React web app for college student onboarding at TCET Mumbai. Built for a hackathon with a dark theme, glassmorphism, and Framer Motion animations.

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework + fast build tool |
| TailwindCSS | Utility-first CSS styling |
| Framer Motion | Animations & page transitions |
| React Router DOM | Client-side routing |
| Axios | HTTP client for API calls |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The app connects to a backend at `http://localhost:8000/api` by default. Override with the `VITE_API_URL` environment variable. All pages work without a backend using built-in demo fallbacks.

---

## File Structure

```
frontend/
├── index.html                    ← Entry HTML page
├── vite.config.js                ← Vite bundler config
├── tailwind.config.js            ← Tailwind design tokens
├── src/
│   ├── main.jsx                  ← React bootstrap
│   ├── index.css                 ← Global styles + Tailwind
│   ├── App.jsx                   ← Router + Layout + Sidebar
│   ├── services/
│   │   └── api.js                ← All Axios API calls
│   ├── components/
│   │   └── Sidebar.jsx           ← Nav sidebar (desktop + mobile)
│   └── pages/
│       ├── LandingPage.jsx       ← Hero / marketing page
│       ├── Dashboard.jsx         ← Student progress tracking
│       ├── ChatPage.jsx          ← AI chat interface
│       ├── DocumentUpload.jsx    ← OCR document verification
│       ├── RoommateMatcher.jsx   ← Tinder-style matching
│       └── AcademAI.jsx          ← Learning hub (lectures, quiz, groups)
```

---

## Detailed File-by-File Explanation

### 1. `index.html` — The Entry Point

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- `<!doctype html>` — Tells the browser this is an HTML5 document.
- `<html lang="en">` — Root HTML element, language is English.
- `<meta charset="UTF-8" />` — Character encoding is UTF-8 (supports all languages, emojis, etc.).
- `<link rel="icon" ...>` — Sets the browser tab icon (favicon) to the Vite logo SVG.
- `<meta name="viewport" ...>` — Makes the page responsive on phones/tablets by setting the viewport width to the device width.
- `<title>frontend</title>` — The text displayed in the browser tab.
- `<div id="root"></div>` — This is **the single DOM node** where React will render the entire app. React "mounts" into this div.
- `<script type="module" src="/src/main.jsx">` — Loads the JavaScript entry point as an ES module. Vite processes this.

---

### 2. `vite.config.js` — Build Tool Configuration

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- `import { defineConfig } from 'vite'` — Imports Vite's config helper for type safety and autocomplete.
- `import react from '@vitejs/plugin-react'` — Imports the official React plugin for Vite. This enables JSX transformation (converting `<div>` syntax into `React.createElement` calls) and React Fast Refresh (hot module replacement while preserving component state).
- `plugins: [react()]` — Activates the React plugin. Without this, Vite wouldn't understand JSX syntax.

---

### 3. `tailwind.config.js` — Design System Tokens

```js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0e1a",
                card: "rgba(255, 255, 255, 0.05)",
                primary: {
                    purple: "#9333ea",
                    indigo: "#6366f1",
                    cyan: "#22d3ee",
                },
            },
            animation: { ... },
            keyframes: { ... },
        },
    },
    plugins: [],
}
```

#### `content`
Tells Tailwind **which files to scan** for class names. Tailwind removes any unused CSS at build time (tree-shaking). It scans `index.html` and every `.js/.ts/.jsx/.tsx` file inside `src/`. The `**` means "any subdirectory at any depth". The `{...}` means "any of these extensions".

#### `theme.extend`
Adds new values **without replacing** Tailwind's defaults. If you used `theme` directly, you'd lose all built-in colors.

#### Custom Colors
- `background: "#0a0e1a"` — A very dark navy blue. Now you can use `bg-background` anywhere in JSX.
- `card: "rgba(255, 255, 255, 0.05)"` — A 5% white overlay for glassmorphism card backgrounds. Usable as `bg-card`.
- `primary.purple/indigo/cyan` — Creates classes like `text-primary-purple`, `bg-primary-cyan`, `border-primary-indigo`, etc.

#### Custom Animations

```js
animation: {
    'gradient-x': 'gradient-x 15s ease infinite',
    'float': 'float 6s ease-in-out infinite',
    'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
},
```

These define CSS animation shorthand names usable as `animate-gradient-x`, `animate-float`, `animate-pulse-glow`.
- `'gradient-x 15s ease infinite'` means: use the `gradient-x` keyframes, run for 15 seconds, with `ease` timing, loop infinitely.
- `cubic-bezier(0.4, 0, 0.6, 1)` — A custom easing curve (slower start and end, faster middle) for a natural pulsing feel.

#### Custom Keyframes

- **`gradient-x`**: At 0% and 100% the gradient is left-aligned, at 50% right-aligned. Creates a horizontal gradient shift. `background-size: 200% 200%` makes the gradient image twice the element's size so there's room to "slide" it.
- **`float`**: Element starts at normal position (0px), floats up 20px at the midpoint, then comes back. Creates a gentle up-and-down floating animation for the background orbs.
- **`pulse-glow`**: Fades opacity down to 70% while increasing brightness to 150%, creating a pulsing glow effect.

---

### 4. `src/index.css` — Global Styles

#### Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```
Loads the **Inter** font from Google Fonts in weights 400 (normal), 500 (medium), 600 (semi-bold), 700 (bold). `display=swap` means the browser shows fallback text immediately, then swaps in Inter once loaded (prevents invisible text during loading).

#### Tailwind Directives
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
These three directives inject Tailwind's CSS:
- `base` — CSS reset/normalize (removes browser default margins, padding, etc.)
- `components` — The `@layer components` classes defined below
- `utilities` — All the utility classes like `p-4`, `text-white`, `flex`, etc.

#### Root Variables
```css
:root {
  font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #0a0e1a;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- `:root` targets the `<html>` element. These are global defaults.
- `font-family` — Uses Inter, falling back through system-ui → Avenir → Helvetica → Arial → any sans-serif.
- `color-scheme: dark` — Tells the browser this is a dark theme (affects scrollbars, form controls, etc.).
- `color: rgba(255, 255, 255, 0.87)` — Default text is white at 87% opacity (not pure white, which is harsh on dark backgrounds).
- `font-synthesis: none` — Prevents the browser from faking bold/italic by distorting outlines.
- `text-rendering: optimizeLegibility` — Enables kerning and ligatures for better readability.
- `-webkit-font-smoothing: antialiased` / `-moz-osx-font-smoothing: grayscale` — Smoother text rendering on Mac/Safari/Firefox.

#### Component Classes

```css
@layer components {
  .glass {
    @apply bg-white/5 backdrop-blur-md border border-white/10;
  }
  .glass-card {
    @apply glass rounded-2xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20;
  }
  .btn-gradient {
    @apply bg-gradient-to-r from-primary-purple via-primary-indigo to-primary-cyan text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] active:scale-95;
  }
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-primary-purple via-primary-indigo to-primary-cyan;
  }
}
```

- **`.glass`** — The glassmorphism base: 5% white background, 12px backdrop blur, 10% white border.
- **`.glass-card`** — Extends `.glass` with rounded corners (16px), 24px padding, 300ms transitions, and hover state.
- **`.btn-gradient`** — CTA button: gradient background (purple→indigo→cyan), grows 5% on hover, purple neon glow shadow on hover, shrinks 5% on click.
- **`.text-gradient`** — Creates gradient text by clipping the background to the text shape and making the text color transparent.

#### Background Orbs
```css
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35; animation: float 10s ease-in-out infinite; }
.orb-1 { width: 400px; height: 400px; background: #9333ea; top: -100px; right: -100px; }
.orb-2 { width: 300px; height: 300px; background: #22d3ee; bottom: -50px; left: -50px; }
.orb-3 { width: 250px; height: 250px; background: #6366f1; top: 40%; left: 20%; }
```

Three floating blurred circles positioned around the page:
- **orb-1**: Large purple blob, top-right (partially offscreen)
- **orb-2**: Medium cyan blob, bottom-left
- **orb-3**: Smaller indigo blob, center-left
- Each has a different `animation-delay` so they float at different phases.

#### Custom Scrollbar
Scrollbar track is dark (invisible), thumb is 10% white with rounded corners, gets brighter on hover.

---

### 5. `src/main.jsx` — React Bootstrap

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- **`StrictMode`** — A React wrapper that runs additional checks in development (double-renders to detect side effects, warns about deprecated APIs). Does NOT affect production builds.
- **`createRoot`** — React 18's concurrent rendering API. Finds the `<div id="root">` in `index.html` and creates a React root.
- **`.render(<App />)`** — Renders the entire component tree into the DOM.
- **`import './index.css'`** — Imports global styles so Vite processes them.

---

### 6. `src/services/api.js` — Backend API Layer

```js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';
```

- **`axios`** — HTTP client library for making API requests.
- **`toast`** — Shows popup notifications.
- **`import.meta.env?.VITE_API_URL`** — Vite's way of accessing environment variables. The `?.` optional chaining prevents crashes if `env` is undefined. Falls back to `http://localhost:8000/api`.

#### Axios Instance
```js
const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});
```
Creates a reusable Axios instance. All requests start from the base URL, so `api.get('/chat')` calls `http://localhost:8000/api/chat`.

#### Response Interceptor
```js
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.detail || error.message || 'Something went wrong';
        toast.error(`Backend Error: ${message}`, { ... });
        return Promise.reject(error);
    }
);
```

Runs on every API response:
- **Success**: Automatically unwraps the Axios response envelope. Components get `data` directly instead of `response.data`.
- **Error**: Extracts the error message from FastAPI's `detail` field, the Axios `message`, or falls back to "Something went wrong". Shows a dark-themed toast. Then re-throws so components can catch it.

#### API Service Object
```js
export const studentApi = {
    getProgress: (studentId) => api.get(`/student/${studentId}/progress`),
    chat: (message, studentId) => api.post('/chat', { message, student_id: studentId }),
    uploadDocument: (formData) => api.post('/document/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getRoommateMatches: (studentId) => api.get(`/roommates/matches/${studentId}`),
    getLectures: (payload) => api.post('/acad/lectures', payload),
    generateQuiz: (payload) => api.post('/acad/quiz', payload),
    getStudyGroups: (params) => api.get('/acad/groups', { params }),
};
```

Each method maps to a backend endpoint:
- `getProgress` — Fetches student onboarding progress
- `chat` — Sends a message to the AI chat endpoint
- `uploadDocument` — Uploads a file using `multipart/form-data` (overrides the JSON header)
- `getRoommateMatches` — Gets roommate match suggestions
- `getLectures` / `generateQuiz` / `getStudyGroups` — Academic features

---

### 7. `src/App.jsx` — Router, Layout & Orchestration

#### Imports
```jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
```

- **`Suspense`** — Shows fallback UI while lazy-loaded components download.
- **`lazy`** — Enables code splitting. Each page is loaded only when navigated to.
- **`BrowserRouter`** — Uses the browser's History API for clean URLs (`/dashboard` not `/#/dashboard`).
- **`AnimatePresence`** — Animates components when they enter and exit the DOM.

#### Lazy-Loaded Pages
```jsx
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
// ... etc
```
Creates code-split points. Vite generates separate JS chunks for each page, only downloading them when visited. This makes the initial page load much faster.

#### PageWrapper — Page Transitions
```jsx
const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};
```

Every page is wrapped in this for smooth transitions:
- `key={location.pathname}` — When the path changes, React treats this as a new component, triggering AnimatePresence exit/enter animations.
- `initial` — Starts invisible and shifted 20px down.
- `animate` — Fades in and slides up.
- `exit` — Fades out and slides 20px up (opposite direction).

#### LoadingScreen
```jsx
const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
    <motion.div
      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-12 h-12 border-4 border-primary-cyan border-t-transparent rounded-full"
    />
  </div>
);
```
Shown while lazy-loaded pages download. A pulsing, spinning circle:
- `border-t-transparent` — One edge is transparent, creating the classic spinner look.
- `scale: [1, 1.2, 1]` — Pulses: normal → bigger → normal.
- `rotate: [0, 180, 360]` — Full rotation.

#### AppContent — Main Layout
```jsx
function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  return (
    <div className={`flex min-h-screen bg-background text-white ${!isLandingPage ? 'lg:pl-20' : ''}`}>
      <div className="bg-mesh" />
      <div className="orb orb-1" /> <div className="orb orb-2" /> <div className="orb orb-3" />
      <Sidebar />
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingScreen />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/chat" element={<PageWrapper><ChatPage /></PageWrapper>} />
              <Route path="/documents" element={<PageWrapper><DocumentUpload /></PageWrapper>} />
              <Route path="/roommates" element={<PageWrapper><RoommateMatcher /></PageWrapper>} />
              <Route path="/acad" element={<PageWrapper><AcademAI /></PageWrapper>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      <Toaster position="bottom-right" toastOptions={{...}} />
    </div>
  );
}
```

- `isLandingPage` — Landing page is full-screen (no sidebar padding).
- `lg:pl-20` — On large screens, 80px left padding for the fixed sidebar.
- 3 `<div className="orb">` elements are the floating background blobs.
- `AnimatePresence mode="wait"` — Waits for exit animation to complete before mounting new page.
- `key={location.pathname}` on `Routes` — Forces unmount/remount on navigation for exit animations.
- `<Toaster>` — Toast notifications with glassmorphism styling.

#### Why App and AppContent are Separate
```jsx
function App() {
  return (<Router><AppContent /></Router>);
}
```
`useLocation` can only be called inside a `<Router>`, so `AppContent` (which uses it) must be a child of `<Router>`.

---

### 8. `src/components/Sidebar.jsx` — Navigation

#### Utility Function
```jsx
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
```
Combines `clsx` (conditionally joins class names) and `twMerge` (resolves conflicting Tailwind classes). E.g., if both `p-4` and `p-6` are applied, `twMerge` keeps only `p-6`.

#### Nav Items Configuration
```jsx
const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { path: '/documents', icon: FileUp, label: 'Documents' },
    { path: '/roommates', icon: Users, label: 'Roommates' },
    { path: '/acad', icon: BookOpen, label: 'AcademAI' },
];
```
Data-driven navigation items, each with a URL path, Lucide icon component, and display label.

#### Landing Page Check
```jsx
if (location.pathname === '/') return null;
```
Sidebar is hidden on the landing page.

#### Desktop Sidebar
- Fixed on the left, 80px wide, full height.
- Logo at top: gradient square with Sparkles icon that **rotates 180° on hover**.
- Nav links use `NavLink` (React Router's active-aware `<a>` tag).
- Active state: white background + a **sliding cyan indicator bar** using `layoutId="activeTab"`. Framer Motion automatically animates the bar's position between items.
- Tooltip: Each icon has a `<span>` that appears on hover (`opacity-0 group-hover:opacity-100`).

#### Mobile Header
Fixed top bar with logo and hamburger toggle. `isOpen ? <X /> : <Menu />` switches between close and hamburger icons.

#### Mobile Dropdown Menu
- `AnimatePresence` wraps the dropdown for enter/exit animations.
- When open: full-screen overlay with 95% opacity background and heavy blur.
- Clicking a nav item closes the menu (`setIsOpen(false)`).

---

### 9. `src/pages/LandingPage.jsx` — Hero Page

#### FeatureCard Component
```jsx
const FeatureCard = ({ icon: Icon, title, description, color, delay }) => ( ... );
```
- `icon: Icon` — Destructures and renames `icon` to `Icon` so it can be used as `<Icon />` in JSX.
- `delay` — Each card enters with staggered timing (0.8s, 1.0s, 1.2s, 1.4s).
- `whileHover={{ y: -10 }}` — Card lifts 10px on hover.
- `group` class — Enables `group-hover:` on child elements.

#### Hero Section
- **Badge pill**: "TCET Mumbai • Smart Onboarding" scales in from 90%.
- **Title**: "CAMPUS**COMPANION** AI" — "COMPANION" uses gradient text.
- **CTA**: "Start Onboarding" links to `/dashboard`.
- **Secondary badge**: "100% Local AI • Privacy First".

#### Feature Grid
Four `FeatureCard`s (Local AI Chat, Smart OCR, AI Roommate Match, Zero Cloud) in a responsive 4-column grid.

#### Stats Row
Three `StatItem` components with staggered animations inside a glass container with a subtle gradient overlay. Shows "80% Fewer Missed Deadlines", "60% Faster Onboarding", "₹2L+ Savings per Student".

---

### 10. `src/pages/Dashboard.jsx` — Progress Tracking

#### Data Fetching
```jsx
useEffect(() => {
    studentApi.getProgress('demo_student')
        .then(setData)
        .catch(() => { setData({ /* fallback demo data */ }); })
        .finally(() => setLoading(false));
}, []);
```
On mount, calls the backend. If it fails, uses hardcoded demo data. `.finally` sets loading to false regardless.

#### Circular Progress Ring (SVG)
```jsx
<svg className="w-full h-full transform -rotate-90">
    <circle ... className="text-white/5" />        <!-- background track -->
    <motion.circle
        strokeDasharray={440}
        initial={{ strokeDashoffset: 440 }}
        animate={{ strokeDashoffset: 440 - (440 * percentage) / 100 }}
    />                                               <!-- animated progress -->
</svg>
```

- Two SVG circles: background track (faint) + animated foreground (cyan).
- `-rotate-90` — Makes progress start from the top (12 o'clock) instead of the default 3 o'clock.
- `strokeDasharray={440}` — Circle circumference (2π × 70 ≈ 440). The entire stroke is one dash.
- `strokeDashoffset` — Controls how much of the dash is hidden. 440 = 0% visible, 0 = 100% visible.
- The formula `440 - (440 × percentage / 100)` calculates the exact offset.
- Animates over 1.5 seconds with `easeOut`.

#### Quick Actions Grid
Four card links (AI Chat, Upload Docs, Roommates, AcademAI) with hover lift (`scale: 1.02, y: -5`) and press shrink (`scale: 0.98`).

#### Steps Section
Two columns: Completed (green checkmarks) and Pending (clickable). Rendered dynamically from the data arrays using `.map()`.

---

### 11. `src/pages/ChatPage.jsx` — AI Chat

#### MessageBubble
```jsx
const MessageBubble = ({ message, isAi }) => (
    <motion.div
        initial={{ opacity: 0, x: isAi ? -20 : 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        className={`flex gap-4 mb-6 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}
    > ... </motion.div>
);
```
- AI messages slide in from the **left** (`x: -20`), user messages from the **right** (`x: 20`).
- `flex-row-reverse` for user messages puts avatar on the right side.
- AI: glass background + Bot icon. User: purple gradient + User icon.

#### handleSend Function
```jsx
const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { text, isAi: false }]);
    setInput('');
    setLoading(true);
    try {
        const response = await studentApi.chat(text, 'demo_student');
        setMessages(prev => [...prev, { text: response.response || response.message, isAi: true }]);
    } catch (error) {
        setMessages(prev => [...prev, { text: "I'm having trouble connecting...", isAi: true }]);
    } finally { setLoading(false); }
};
```
- `text = input` — Default parameter; can receive text from quick chips or the input field.
- Prevents empty messages.
- Uses functional state updates (`prev => [...]`) for safe async operations.
- Error fallback shows a friendly message instead of crashing.

#### Auto-Scroll
```jsx
useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
}, [messages]);
```
Scrolls to the bottom whenever a new message is added.

#### Quick Action Chips
Only shown when there's just the welcome message. Clicking sends the chip text directly to `handleSend`.

---

### 12. `src/pages/DocumentUpload.jsx` — Smart OCR

#### File Selection
```jsx
const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
    }
};
```
1. Stores the raw `File` object for upload.
2. Uses `FileReader` to convert to a Base64 data URL.
3. The data URL is used as an `<img src>` for preview.

#### Upload Handler
- Creates `FormData` with the file, student_id, and doc_type.
- On API failure: **simulates a successful response** after 1.5 seconds with demo data (confidence: 98%, extracted name/ID/DOB).

#### Upload UI
- Drag-and-drop zone with `aspect-video` (16:9 ratio).
- The `<input type="file">` is invisible (`opacity-0`) and covers the entire zone.
- Before file: upload icon + instructions. After file: image preview.
- Upload button animates in when a file is selected.

#### Results Card
- Green-themed card with checkmark, confidence score, and extracted data grid (name, ID, DOB, status).
- "Upload Another Document" resets all state.

---

### 13. `src/pages/RoommateMatcher.jsx` — Tinder-Style Matching

This is the most complex animation component:

#### SwipeCard — Drag Physics
```jsx
const x = useMotionValue(0);
const rotate = useTransform(x, [-150, 150], [-15, 15]);
const opacity = useTransform(x, [-150, -50, 0, 50, 150], [0, 1, 1, 1, 0]);
const heartScale = useTransform(x, [50, 150], [0.5, 1.5]);
```

- **`useMotionValue(0)`** — Tracks the card's X position during drag. Unlike React state, this updates on the animation thread (60fps smooth, no re-renders).
- **`rotate = useTransform(...)`** — Maps X position to rotation. Dragged 150px right → tilts +15°. Left → -15°. Creates the natural fanning tilt.
- **`opacity`** — At extremes (±150px), card fades out. In the middle, stays fully visible.
- **`heartScale`** — Pink heart overlay scales up as you drag right, providing visual "like" feedback.

```jsx
drag="x"
dragConstraints={{ left: 0, right: 0 }}
onDragEnd={handleDragEnd}
```
- `drag="x"` — Horizontal dragging only.
- `dragConstraints` — Card springs back to center when released.
- `onDragEnd` — If offset > 100px → "right" (like). If < -100px → "left" (pass).

#### Match Flow
1. Fetches matches from API (or uses 3 fallback students).
2. `currentIndex` tracks which card is shown.
3. Swiping right → adds to `liked` array + toast notification.
4. When all reviewed → shows summary of liked profiles.
5. "Reset Stack" button resets `currentIndex` to 0.

#### Like/Pass Buttons
- Pass: glass circle with X icon, subtle hover effects.
- Like: Larger, pink-to-rose gradient, filled heart. **Glows on hover** (`boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)'`).

---

### 14. `src/pages/AcademAI.jsx` — Learning Hub

The largest file (288 lines) with 3 tabbed sections.

#### Tab System
```jsx
<TabButton active={activeTab === 'lectures'} icon={Youtube} title="YouTube Lectures" color="red-500" />
<TabButton active={activeTab === 'quiz'} icon={BrainCircuit} title="Quiz Me" color="purple-500" />
<TabButton active={activeTab === 'groups'} icon={Users2} title="Study Groups" color="cyan-500" />
```
Each tab has its own accent color. Clicking clears previous results and switches context.

#### Sidebar Filters
- Subject dropdown: 10 engineering subjects.
- Topic text input for specific queries.
- Action button color changes based on active tab.

#### Data Functions
All three (`fetchLectures`, `generateQuiz`, `findGroups`) use `setTimeout` to simulate API responses with mock data. In production, these would call the real backend endpoints.

#### Lectures Tab
Video cards with YouTube thumbnails, play button overlay (scales on hover), title, and channel name.

#### Quiz Tab
Multiple-choice questions rendered as glass cards. 4 options in a 2-column grid. "Submit Quiz" shows a full-screen modal with trophy icon, score display, and "Try Another Topic" button.

#### Groups Tab
Study group cards showing: name (avatar), topic, members, next session time (green), meeting type, and "Join Group" button.

---

## Architecture Summary

| Concept | Implementation |
|---|---|
| **Lazy loading** | Each page loads only when visited (fast initial load) |
| **Axios interceptors** | Centralized error handling with toast notifications |
| **Demo fallbacks** | Every API call has a `catch` block with fake data |
| **Framer Motion** | Page transitions, card animations, drag gestures, layout animations |
| **Glassmorphism** | `.glass` / `.glass-card` reusable classes (blur + transparency) |
| **Gradient system** | `.text-gradient` and `.btn-gradient` for consistent branding |
| **Responsive design** | Mobile header + hamburger menu, desktop fixed sidebar |
| **Background orbs** | Three blurred, floating colored circles for depth |

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/student/{id}/progress` | Student onboarding progress |
| `POST` | `/api/chat` | AI chat (body: `{ message, student_id }`) |
| `POST` | `/api/document/upload` | Document OCR (multipart form data) |
| `GET` | `/api/roommates/matches/{id}` | Roommate suggestions |
| `POST` | `/api/acad/lectures` | YouTube lecture search |
| `POST` | `/api/acad/quiz` | AI quiz generation |
| `GET` | `/api/acad/groups` | Study group discovery |

---

Built with ❤️ for TCET Hackathon 2026
