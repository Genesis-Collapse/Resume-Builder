#  Dynamic Resume Builder

A modern, highly interactive React web application that allows users to create, preview, and download professional resumes in real-time. Built with a focus on UI/UX, this app features a seamless split-screen layout, smooth micro-interactions, and multiple professional templates.

---

##  Features

* **Split-Screen Interface:** A data entry form on the left and a dynamically updating live preview on the right.
* **Real-Time Live Preview:** See your resume update instantly as you type.
* **Multiple Templates:** Choose between `Modern`, `Minimal`, and `Professional` layouts to suit your industry.
* **Smooth Animations:** Powered by Framer Motion for elegant accordion expansions, page transitions, and modal popups.
* **PDF Export:** High-quality PDF rendering for your final resume.
* **Auth-Gated Downloads:** Users are prompted to authenticate (mocked via state/context) before downloading their final PDF.

---

##  Tech Stack

* **Frontend Framework:** React (Functional Components & Hooks)
* **Build Tool:** Vite (for lightning-fast HMR and optimised builds)
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **PDF Generation:** `html2pdf.js` / `react-to-print` (or equivalent)


---

##  Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/resume-builder.git](https://github.com/your-username/resume-builder.git)

2. **Navigate to the project directory:**
   ```bash
   cd resume-builder

3. **Install dependencies:**
   ```bash
   npm install
   
4. **Start the development server:**
   ```bash
   npm run dev


##  Architecture Overview
The project is structured for scalability and separation of concerns:

src/components/form/ — Contains modular inputs for Personal Info, Experience, Education, etc.

src/components/preview/ — Handles the live preview wrapper and PDF download logic.

src/templates/ — Houses the distinct resume layout components (Modern, Minimal, Professional) to keep styling isolated from logic.

src/context/ — Manages the global state (form data, selected template, and auth status) to feed both the form and preview panels.

##  Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

##  License
This project is licensed under the MIT License - see the LICENSE file for details.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
