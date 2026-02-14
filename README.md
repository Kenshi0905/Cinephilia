# 🎬 Cinephilia

> A stunning, personal movie tracking dashboard that brings your Letterboxd history to life.

![Project Banner](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop)

**Cinephilia** is a modern, reliable, and aesthetically pleasing web application designed to visualize your movie watching journey. It seamlessly integrates with your Letterboxd data (both CSV exports and RSS feeds) to provide a rich, interactive experience.

## ✨ Features

-   **🔄 Seamless Integration**:
    -   **CSV Import**: parses your full Letterboxd history (`watched.csv`, `reviews.csv`, `ratings.csv`) for a complete archive.
    -   **RSS Sync**: Automatically fetches your latest watches from your Letterboxd RSS feed, keeping your dashboard up-to-date without manual imports.
-   **🎨 Premium UI/UX**:
    -   **Split-View Design**: A modern layout that showcases movie art alongside your personal notes and ratings.
    -   **Glassmorphism**: Sleek, translucent elements and smooth animations powered by Framer Motion.
    -   **Responsive**: Optimized for both desktop and mobile viewing.
-   **🔍 Smart Search**:
    -   Instant, client-side fuzzy search to find any movie in your history.
    -   Prioritizes exact matches and recent watches.
-   **📝 Rich Data Handling**:
    -   **Description & Reviews**: Automatically fetches and merges reviews from your history.
    -   **Review Concatenation**: If you've reviewed a movie multiple times, all your notes are preserved and combined intelligently.
    -   **Missing Data Enrichment**: Background processes attempt to fetch missing details like posters or specific ratings.
-   **⚡ Performance**:
    -   Built with Vite for lightning-fast dev and build times.
    -   Leverages `localStorage` caching to minimize network requests and load instantly.

## 🛠️ Tech Stack

-   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Data Parsing**: [PapaParse](https://www.papaparse.com/) (CSV), DOMParser (XML/RSS)
-   **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or pnpm

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Kenshi0905/Cinephilia.git
    cd Cinephilia
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Add your Data**:
    *   Export your data from [Letterboxd Settings](https://letterboxd.com/settings/data/).
    *   Place `watched.csv`, `ratings.csv`, `reviews.csv`, and `diary.csv` into `src/app/data/letterboxd-exports/`.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Build for production**:
    ```bash
    npm run build
    ```

## ⚙️ Configuration

You can customize the application using environment variables in a `.env` file (or your deployment platform's settings):

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_LETTERBOXD_RSS_URL` | Your public Letterboxd RSS feed URL. | `https://letterboxd.com/kenshi05/rss/` |
| `VITE_RSS_PROXY_TEMPLATE` | Proxy URL template to bypass CORS. | `https://api.allorigins.win/raw?url={url}` |

## 📦 Deployment

This project is optimized for deployment on **Vercel** or **Netlify**.

**Vercel (Recommended):**
1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Vercel will auto-detect Vite and deploy.

**Netlify:**
1.  Run `npm run build`.
2.  Drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---