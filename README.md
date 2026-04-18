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
  src="https://your-domain.com/embed.js" 
  data-primary-color="#2563eb"
  data-position="bottom-right">
</script>
```

### Script Customization
| Attribute | Default | Description |
| :--- | :--- | :--- |
| **`data-primary-color`** | `#18181b` | Theme color of the FAB and widget highlights |
| **`data-position`** | `bottom-right` | Docking position (`bottom-right` or `bottom-left`) |
| **`data-chat-url`** | `(auto)` | Manual override for the iframe endpoint |

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
