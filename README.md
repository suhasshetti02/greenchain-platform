# GreenChain Platform

A full-stack application designed to bring transparency and trust to charitable donations through a blockchain-inspired verification process.

## 🌟 Vision

To create a transparent ecosystem for donations, ensuring that contributions reach their intended recipients and that the entire process is verifiable by all parties involved. GreenChain leverages a secure, auditable system for tracking donations from donor to receiver.

## ✨ Features

*   **User Authentication:** Secure registration and login for donors, NGOs, and receivers.
*   **Donation Creation:** Donors can easily create and list items for donation.
*   **Donation Marketplace:** Browse available donations.
*   **Claims System:** Receivers can claim donations.
*   **Verification Flow:** A multi-step verification process ensures that claims are legitimate and donations are received.
*   **Role-based Dashboards:** Tailored dashboard views for Donors, NGOs, and Receivers to manage their activities.

## 🛠️ Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) - React framework for server-rendered applications.
    *   [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
*   **Backend:**
    *   [Node.js](https://nodejs.org/) - JavaScript runtime environment.
    *   [Express.js](https://expressjs.com/) - Web application framework for Node.js.
    *   [Supabase](https://supabase.io/) - Open source Firebase alternative for database and authentication.
*   **Database:**
    *   PostgreSQL

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js and npm
*   A Supabase account for database and authentication services.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and add your Supabase credentials. You can get these from your Supabase project settings.
    ```env
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Run the backend server:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3001` (or the port specified in your config).

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the `frontend` directory and add your Next.js public Supabase credentials.
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    NEXT_PUBLIC_API_URL=http://localhost:3001
    ```

4.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

The project is organized into two main parts:

*   `./backend`: The Node.js and Express.js API that handles business logic, data storage, and authentication.
*   `./frontend`: The Next.js client-side application that provides the user interface.

For a more detailed breakdown of the architecture, please see `frontend/ARCHITECTURE.md`.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
