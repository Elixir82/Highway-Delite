React + TypeScript Authentication System

A React application built with TypeScript featuring an authentication system using Context API. Includes OTP-based login/signup, JWT token handling, and optional persistent login via localStorage.

# ✨ Features

*   🔑 User Authentication (Signup & Login with OTP verification)
*   🛡️ JWT Token Handling for secure sessions
*   💾 Persistent Login with 'Keep me logged in' (stores token & user in localStorage)
*   🌐 Context API + Custom Hooks for global state management
*   🔒 Protected Routes for authorized access only
*   ⚡ Built with React + TypeScript for type safety

# 🛠️ Tech Stack

*   Frontend: React, TypeScript, React Router
*   State Management: Context API + Custom Hooks
*   Backend: Node.js + Express (for OTP & JWT)
*   Deployment: Vercel (Frontend) + Render (Backend)

# 🚀 Getting Started

1️⃣ Clone the repository

git clone https://github.com/your-username/your-repo-name.git  
cd your-repo-name

2️⃣ Install dependencies

npm install

3️⃣ Run the development server

npm run dev

4️⃣ Build for production

npm run build

# 📂 Project Structure

src/  
│── components/ # Reusable UI components  
│── context/ # Auth context & provider  
│── pages/ # Login, Signup, Home, Protected pages  
│── hooks/ # Custom hooks (useAuth, etc.)  
│── utils/ # Helper functions

# 🔐 Authentication Flow

1.  User signs up or logs in with OTP
2.  Backend returns a JWT token + user info
3.  If 'Keep me logged in' is checked → token & user are saved to localStorage
4.  On app load, AuthContext checks localStorage for saved session
5.  Protected routes only allow access if token is valid

# 🖥️ Deployment

Frontend (Vercel)

1\. Push your repo to GitHub  
2\. Import repo into Vercel  
3\. Set build command → npm run build  
4\. Set output directory → dist

Backend (Render)

1\. Push backend repo to GitHub  
2\. Import repo into Render  
3\. Add environment variables (JWT\_SECRET, DB\_URI, etc.)  
4\. Deploy & get live API URL

# 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.

# 📜 License

This project is licensed under the MIT License.
