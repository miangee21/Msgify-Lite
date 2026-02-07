# 📱 Msgify Lite – Offline Archive Viewer

<div align="center">

![Project Status](https://img.shields.io/badge/Status-Stable-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Mode](https://img.shields.io/badge/Mode-Offline%20%2F%20Client--Side-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge)

A powerful, standalone **offline archive viewer** for Telegram exports and database backups. Access your data anytime, anywhere without internet, servers, or external dependencies.

[Features](#-key-features) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack) • [Documentation](#-usage-guide)

</div>

---

## ✨ Key Features

### 🛡️ Security & Independence
- **Zero Dependencies:** Runs completely in the browser without backend, database, or external APIs.
- **Privacy First:** Your data never leaves your device — all processing happens locally using the browser's File API.
- **Disaster Recovery:** Access archived data even if the main service goes down.

### 📂 Smart Format Detection
Automatically detects and parses multiple data structures:
- **Telegram Desktop Export** – Standard `result.json` format
- **Custom JSON Arrays** – Simplified, flattened structures
- **Database Reconstruction** – Parses raw `Posts.json` and `Button.json` exports

### ⚡ Premium Performance
- **Instant Search** – Real-time filtering by text and metadata
- **Intelligent Tagging** – Auto-detects and filters by available tags
- **Responsive Grid** – Beautiful masonry layout for photos and posts
- **Dark Mode Compatible** – Fully themeable Telegram-inspired interface

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Components** | [Shadcn/UI](https://ui.shadcn.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State Management** | [React Hooks](https://react.dev/reference/react/useState) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

**Step 1: Clone the Repository**
```bash
git clone https://github.com/miangee21/Msgify-Lite.git
cd msgify-lite
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Run in Development Mode**
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm start
```

---

## 📖 Usage Guide

### Step 1: Launch the Application
Open the app and you'll see a clean, intuitive offline archive dashboard.

### Step 2: Select Your Data Folder
Click the **"Select Folder"** button to choose your data source:

- **For Telegram Exports:** Select the folder containing `result.json` and the `photos` directory
- **For Database Exports:** Select the folder with `Posts.json`, `Button.json`, and `photos`

### Step 3: Browse & Search
Once loaded:
- Use the **Search Bar** to find specific posts by text
- Apply **Tag Filters** to sort and categorize content
- Explore posts in a beautiful responsive grid layout

---

## 📂 Project Structure

```
msgify-lite/
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with theme provider
│   │   ├── page.tsx            # Main app logic (parsers, state, rendering)
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # Reusable UI components (Shadcn)
│   │   ├── lite-navbar.tsx     # Navbar with search functionality
│   │   ├── local-post-card.tsx # Post display component
│   │   ├── local-pagination.tsx# Pagination component
│   │   └── theme-provider.tsx  # Dark/light mode provider
│   ├── lib/
│   │   └── utils.ts            # CSS utilities and helpers
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── components.json             # Shadcn component registry
└── README.md                   # Documentation
```

---

## 🤝 Contributing

I welcome contributions! Help improve Msgify Lite:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/YourFeature`
3. **Commit** your changes: `git commit -m "Add YourFeature"`
4. **Push** to the branch: `git push origin feature/YourFeature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🌟 Credits & Acknowledgments

- **[Shadcn/UI](https://ui.shadcn.com/)** – Beautiful, accessible component library
- **[Vercel & Next.js](https://nextjs.org/)** – Next-generation React framework
- **[Telegram Desktop](https://desktop.telegram.org/)** – Data export format reference
- **Community Contributors** – Your support drives innovation

---

<div align="center">

**Made with ❤️ by the Msgify Team**

[⭐ Star on GitHub](https://github.com/miangee21/Msgify-Lite) • [📧 Contact](mailto:support@msgify.com)

</div>