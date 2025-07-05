<div align="center">
  <img src="public/images/logo.png" alt="CartPilot Logo" width="120" height="120">
  
  # 🛒 CartPilot
  
  ### *Smart Shopping Lists for Modern Life*
  
  ![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js&logoColor=white)
  ![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-2.50.2-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)
  
  **🌐 [Live Demo](https://cartpilot.vercel.app) | 📚 [Documentation](./docs/)
  
</div>

---

## 🚀 About CartPilot

CartPilot is a revolutionary shopping list management application that transforms the way you shop. Born from the real-world needs of a restaurant business, CartPilot eliminates the chaos of paper lists and endless wandering through supermarket aisles.

### 🎯 The Problem We Solve

- 📝 **No More Paper Waste** - Digital lists that sync across all your devices
- 🏃‍♂️ **Save Time** - Know exactly where each product is located in the store
- 🧭 **Smart Navigation** - Never walk in circles again
- 👥 **Team Collaboration** - Share lists with family, friends, or team members
- 📱 **Intuitive Interface** - Designed for everyone, from tech-savvy to beginners

### ✨ Key Features

🗺️ **Precise Store Mapping**
- Exact aisle and shelf locations for each product
- Store-specific product positioning

📋 **Smart List Management**
- Create unlimited shopping lists
- Categorize products by department
- Real-time list sharing and collaboration

🎨 **Beautiful & Intuitive UI**
- Clean, modern design with smooth animations
- Dark/Light mode support
- Responsive design for all devices

🔐 **Secure & Reliable**
- User authentication with Supabase
- Real-time data synchronization

⚡ **Performance First**
- Built with Next.js 15 and React 19
- Optimized with Turbopack for lightning-fast development
- Smooth animations with Framer Motion

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | Deployment |
|----------|---------|----------|------------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white) | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white) | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) | ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white) |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | ![API Routes](https://img.shields.io/badge/API_Routes-000000?style=flat&logo=next.js&logoColor=white) | - | - |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white) | - | - | - |

</div>

---

## 🏁 Quick Start

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cartpilot.git
   cd cartpilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see CartPilot in action! 🎉

---

## 📱 Screenshots & Demo

<div align="center">
  
  ### 🌟 Beautiful Landing Page
  *Clean, modern design that welcomes users*
  
  ### 📋 Smart List Management
  *Create and organize your shopping lists with ease*
  
  ### 🗺️ Store Navigation
  *Find products instantly with precise locations*
  
  ### 👥 Team Collaboration
  *Share lists and shop together, even when apart*
  
</div>

---

## 🌟 Why CartPilot?

### 🍽️ Born from Real Needs
CartPilot was created to solve the shopping challenges faced by a busy restaurant. The need for efficient, organized shopping that saves time and reduces waste drove every feature we built.

### 💡 Innovation in Everyday Tasks
We believe that everyday tasks deserve innovative solutions. CartPilot transforms the mundane grocery shopping experience into an efficient, enjoyable activity.

### 🌱 Sustainable Shopping
By eliminating paper lists and reducing unnecessary trips through stores, CartPilot contributes to more sustainable shopping habits.

---

## 🚀 Deployment

CartPilot is automatically deployed on [Vercel](https://vercel.com) at [cartpilot.vercel.app](https://cartpilot.vercel.app).

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/cartpilot)

1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables
4. Deploy! 🚀

---

## 📚 Documentation

- 📖 [User Guide](./docs/USER_GUIDE.md) - How to use CartPilot effectively
- 🔧 [Development Guide](./docs/DEVELOPMENT.md) - Contributing to CartPilot
- 🔐 [Authentication Setup](./docs/AUTH_SETUP.md) - Setting up user authentication
- 📧 [Email Configuration](./docs/EMAIL_SETUP.md) - Email notifications setup
- 🚨 [Alert System](./docs/ALERT_SYSTEM.md) - Understanding the alert system

---

## 🤝 Contributing

We love contributions! CartPilot is an open-source project that welcomes developers of all skill levels.

### 🌟 How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### 🐛 Found a Bug?

1. Check if it's already reported in [Issues](https://github.com/your-username/cartpilot/issues)
2. If not, create a new issue with detailed information
3. Include steps to reproduce, expected behavior, and screenshots if applicable

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Restaurant Team** - For inspiring the creation of CartPilot
- **Open Source Community** - For the amazing tools and libraries
- **Beta Testers** - For valuable feedback and suggestions
- **Contributors** - For making CartPilot better every day

---

<div align="center">
  
  ### 🌟 Star us on GitHub if CartPilot helps you shop smarter!
  
  **Made with ❤️ for smarter shopping**
  
  [⬆ Back to Top](#-cartpilot)
  
</div>
