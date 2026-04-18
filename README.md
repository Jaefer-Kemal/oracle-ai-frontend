# 🎨 Oracle AI Knowledge Base - Frontend

[![Next.js Version](https://img.shields.io/badge/Next.js-14+-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Typescript](https://img.shields.io/badge/Typescript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

The mission-critical frontend for the Oracle AI Knowledge Base. This project provides a sleek Administrator Dashboard for knowledge management and a versatile, zero-dependency widget for external website integration.

---

## 🏗️ Core Architecture

The frontend is built on the **Next.js App Router**, ensuring high performance, SEO optimization, and a fluid user experience.

- **Admin Logic Hub**: Centralized state management for monitoring RAG analytics and managing documents.
- **Component Library**: Versatile UI components built with Tailwind CSS, following a premium dark-mode aesthetic.
- **API Middleware**: Optimized communication layer with the backend, featuring debounced searching and server-side pagination.
- **Embedded Widget Engine**: A dedicated, isolated script (`embed.js`) designed for cross-domain deployment.

---

## ✨ Key Features

- **📊 Admin Dashboard**: Comprehensive oversight of AI stats, document status, and system configurations.
- **📂 Knowledge Management**: Paginated and searchable repository for files and manual Q&A entries.
- **🕒 Audit Trace**: Visual history of chat sessions with detailed message-by-message context logs.
- **🔌 Universal Widget**: A floating chat widget that can be embedded on any website with a single script tag.
- **🌗 Premium UI**: Modern design system using deep surfaces, sleek borders, and micro-animations.
- **🔐 Secure Sessions**: JWT-based authentication with managed access and refresh token synchronization.

---

## 🏗️ Hybrid Architecture (Script + Iframe)

To provide a seamless "drop-in" experience for third-party websites, this project utilizes a **Hybrid Integration Model**.

### 1. The Manager (`<script>`)
The `embed.js` script acts as the host-side manager. It executes directly in the client's global context to:
*   Inject the Floating Action Button (FAB).
*   Handle window resize events and dynamic positioning.
*   Animate the opening/closing of the widget container.
*   Detect `data-` attributes for instant theming (colors, docking).

### 2. The Sandbox (`<iframe>`)
The script mounts a secure `<iframe>` containing the actual chat application. This provides:
*   **Style Isolation**: The host website's CSS cannot break the AI's layout.
*   **JS Security**: The chat's React logic runs in its own isolated thread.
*   **Backend Sync**: Centralized session management without leaking host cookies.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Directory paradigm).
- **Language**: TypeScript for enterprise-grade type safety.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first design approach.
- **Icons**: [Google Material Symbols](https://fonts.google.com/icons).
- **Animations**: CSS transitions & animate-in utilities.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (18+)
- **npm** or **Yarn**
- **Oracle Backend** (running and accessible)

### 2. Environment Configuration
Create a `.env.local` file at the `/frontend` root:

```bash
# Absolute URL of your Oracle Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🏃 Operation Commands

### 📦 Dependency Setup
Install project dependencies:

```bash
npm install
```

### 🔥 Start Development
Launch the Next.js development server:

```bash
npm run dev
```

The app will be available at: **`http://localhost:3000`**

---

## 🔌 Using the Embed Widget

Once the frontend is deployed, any website can integrate your AI Chatbot by adding a single script tag. The widget is self-aware and will dynamically route calls back to your domain.

```html
<!-- Add this to your HTML body -->
<script 
  src="https://your-oracle-ai-app.vercel.app/embed.js" 
  data-primary-color="#2563eb"
  data-position="bottom-right">
</script>
```

### 🌍 Real-World Integration Example
If your project is deployed at `https://oracle-ai.vercel.app`, and a client named **"Your Website"** (`https://your-website.com`) wants to use it:
1. They simply paste the above script into their HTML.
2. The script automatically detects it's running on `your-website.com`.
3. It securely reaches back to `oracle-ai.vercel.app` to load the AI brain.

### 🛠️ Local Testing Example
To test the widget on your own machine during development:
```html
<script src="http://localhost:3000/embed.js"></script>
```

### Script Customization
| Attribute | Default | Description |
| :--- | :--- | :--- |
| **`data-primary-color`** | `#18181b` | Theme color of the FAB and widget highlights |
| **`data-position`** | `bottom-right` | Docking position (`bottom-right` or `bottom-left`) |
| **`data-size`** | `standard` | Core dimensions (`slim`, `standard`, `wide`) |
| **`data-chat-url`** | `(auto)` | Manual override for the iframe endpoint |

### 📐 Interactive Resizing
The widget includes a **Manual Resizer** handle (top-left corner). 
- Users can drag to custom-fit the chat window to their screen.
- **Persistence**: The chosen size is saved to the user's `localStorage`, ensuring the widget remains at their preferred dimensions on return visits.

---

## 📂 Repository Structure

```text
├── public/             # Static assets (including embed.js)
├── src/
│   ├── app/            # Next.js Routes (Admin, Chat, Iframe)
│   ├── components/     # Reusable UI & Logic components
│   ├── lib/            # Shared utilities & API client
│   └── styles/         # Global styles & Tailwind config
└── next.config.ts      # Application configurations
```
