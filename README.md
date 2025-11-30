
# Big News 📰

**Big News** is a modern, responsive news aggregation platform built with React, TypeScript, and Vite. It features a powerful Admin Dashboard for content management, AI-assisted article generation via Google Gemini, and an immersive video feed experience.

## 🚀 Features

### 📱 Reader Experience
*   **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop.
*   **Personalized Feed:** "For You" algorithm adapts to your reading history.
*   **Video Feed:** TikTok-style vertical scrolling for short-form video content.
*   **Accessibility:** Dark Mode, Font Size adjustments, and keyboard navigation.
*   **Engagement:** Like, Comment, and Share articles.
*   **Categories:** Technology, Politics, Lifestyle, Sports, Food, and more.

### 🛡️ Admin Dashboard
*   **Secure Access:** Persistent login system with first-time credential setup.
*   **Publisher Studio:**
    *   Rich text editor for articles.
    *   **AI Integration:** Generate full articles from a topic or analyze a URL using Google Gemini.
    *   Draft management (Save/Load/Delete).
*   **Video Manager:** Upload or embed YouTube Shorts/Videos.
*   **Analytics:** Real-time dashboard for Views, Likes, Comments, and Category performance.
*   **Monetization:** Configuration panel for Google AdSense and Monetag integration.

## 🛠️ Tech Stack

*   **Frontend:** React 18, TypeScript, Tailwind CSS
*   **Build Tool:** Vite
*   **Icons:** Lucide React
*   **AI:** Google Gemini API (`@google/genai`)
*   **Deployment:** Netlify Ready (`netlify.toml` included)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/big-news.git
    cd big-news
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🚢 Deployment (Netlify)

This project is configured for seamless deployment on Netlify.

1.  Push your code to GitHub.
2.  Log in to Netlify and "Import from Git".
3.  Set the **Build Command** to `npm run build`.
4.  Set the **Publish Directory** to `dist`.
5.  **Important:** Add your `API_KEY` in the Netlify "Site configuration" > "Environment variables" section.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
