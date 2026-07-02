# TechTok 🎓 — ללמוד כמו בטיקטוק

**TechTok** is a mobile-first, TikTok-style web application designed to help Technion students learn mathematics (like Infinitesimal Calculus - Infi 1M and Infi 2M) by viewing lecture videos in short, digestible clip segments (5–15 minutes). It transforms long, heavy academic lectures into a modern, engaging, and interactive short-form video experience.

## Features

- 📱 **Mobile-First Responsive Layout:** Fully optimized for touch screen gestures, fluid viewport sizing, and modern dark aesthetics.
- 🔄 **Vertical Scroll Snapping:** Smooth snap-to-video scrolling matching the TikTok feed interaction.
- ⚡ **Double-Press 2x Speed Up:** Hold press anywhere on the video player to speed up playback to `2x`. Releasing the press returns it immediately to normal `1x` speed.
- ❤️ **Double-Tap to Like:** Double-tap on the video to trigger a floating animated heart effect with micro-interactions.
- 🔙 **Swipe to Exit:** Swipe left on mobile or click the back button to exit the watch feed and return to the course overview.
- 📊 **Persistent Watch Progress:** Automatically saves progress to `localStorage`. The course syllabus screen highlights fully watched clips and shows progress bars for partially watched ones.
- ⏯️ **Tap to Toggle Play/Pause:** Easy controls with an animated HUD overlay indicating play/pause state.
- 🎯 **Custom Seeking Progress Bar:** A custom scrubbable progress bar matching the style of modern short-form apps.
- 🎬 **Automatic Queue Progression:** Automatically scrolls and transitions to the next clip in the playlist once the current clip ends.

## Tech Stack

- **Framework:** React 19 (TypeScript)
- **Bundler & Dev Server:** Vite 6
- **Styling:** Vanilla CSS with custom design tokens, modern glassmorphism components, and dynamic animations.
- **Routing:** React Router DOM (v7)
- **Integrations:** YouTube IFrame Player API (loaded dynamically inside a custom wrapper hook)
- **Data Scraping & Extraction:** `youtubei.js`

## File Structure

```
techtok/
├── scripts/
│   └── generate_course_clips.ts # AI-powered script to fetch playlists, extract transcripts, and segment topics using Gemini
├── index.html                  # HTML entry point (rtl directed, Heebo font)
├── package.json                # Project dependencies and npm scripts
├── vite.config.ts              # Vite configuration with React and TypeScript support
└── src/
    ├── App.tsx                 # App entry point and routes
    ├── main.tsx                # React virtual DOM mounter
    ├── components/             # Reusable UI components
    │   ├── ClipCard/           # Renders a single clip video card with overlays
    │   ├── ClipOverlay/        # Text overlay, badges, description, play/pause HUD
    │   ├── CourseProfile/      # Detailed course view with syllabus & watch indicators
    │   ├── FeedContainer/      # Vertical scroll-snap feed and double-tap gestures
    │   ├── Home/               # Main dashboard showing courses list
    │   ├── ProgressBar/        # Seekable progress indicator
    │   └── YouTubePlayer/      # Player iframe component wrapper
    ├── data/                   # Metadata files
    │   ├── clips.ts            # Combines Infi 1M and Infi 2M clips
    │   ├── clips_infi1m.ts     # Split clips list for Infi 1M
    │   ├── clips_infi2m.ts     # Split clips list for Infi 2M
    │   └── courses.ts          # Course configurations & instructor images
    ├── hooks/                  # Custom React hooks
    │   ├── useClipProgress.ts  # Calculated percentage metrics of clips
    │   ├── useLongPress.ts     # Handle gestures (tap, double tap, long press)
    │   ├── useWatchHistory.ts  # Synchronizes progress with LocalStorage
    │   └── useYouTubePlayer.ts # Hooks interface to the YouTube player lifecycle
    ├── styles/                 # Styling systems
    │   ├── index.css           # Global tokens, resets, theme variables
    │   └── animations.css      # Heart popups and hover animation sets
    └── types/
        └── index.ts            # Type definitions for Clips, Courses and YT API
```

## Data Scripts

The project includes TypeScript automation scripts that leverage the Gemini API to intelligently extract and organize clip segments from YouTube.

### 1. Generating Course Clips
To fetch all videos in a playlist, extract their transcripts, and use Gemini to intelligently segment them into logical math concepts (with titles and descriptions in Hebrew):
```bash
# Requires GEMINI_API_KEY environment variable (PowerShell example)
$env:GEMINI_API_KEY="your_api_key_here"
npx tsx scripts/generate_course_clips.ts <PLAYLIST_URL_OR_ID> <COURSE_ID> <COURSE_TITLE>

# Example:
npx tsx scripts/generate_course_clips.ts PLW3u28VuDAHLBQrejV70zRa6sesxkPmgA infi-1m 'אינפי 1מ׳'
```
This will automatically parse the transcripts, generate the segments, write them into `src/data/clips_<courseId>.ts`, and update your main index files.


---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone this repository.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Since the project is mobile-first, it is highly recommended to view it in Chrome DevTools' Device Emulation mode (e.g., iPhone/Pixel viewport).

### Build

To compile the application for production deployment:
```bash
npm run build
```
The output files will be built in the `dist` directory.
