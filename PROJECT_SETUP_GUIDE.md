# GreenChain Platform - Project Setup Guide

This guide outlines the steps to set up and run the GreenChain platform (Backend, Frontend, and ML Service).

## Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL / Supabase Account
- Twilio Account (for WhatsApp)
- Ngrok (for local development webhook tunneling)

---

## 1. Backend Setup (Express.js)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:  
    Create a `.env` file in the `backend` directory with the following credentials:
    ```env
    PORT=3001
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for admin tasks)
    JWT_SECRET=your_jwt_secret
    
    # Twilio Configuration (CRITICAL for WhatsApp)
    TWILIO_ACCOUNT_SID=your_twilio_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token
    TWILIO_PHONE_NUMBER=whatsapp:+14155238886
    ```

4.  Start the Backend Server:
    ```bash
    npm start
    ```
    *Server should run on http://localhost:3001*

---

## 2. ML Service Setup (Python/FastAPI)

1.  Navigate to the ML service directory:
    ```bash
    cd ml_service
    ```

2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Start the ML Server:
    ```bash
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
    ```
    *ML Service should run on http://localhost:8000*

---

## 3. Frontend Setup (Next.js)

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env.local` file in the `frontend` directory:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3001
    ```

4.  Start the Component:
    ```bash
    npm run dev
    ```
    *Frontend should run on http://localhost:3000*

---

## 4. 🚨 CRITICAL: Twilio & Ngrok Setup 🚨

To receive real-time WhatsApp replies (e.g., Donors confirming pickups), you MUST expose your local backend to the internet using **ngrok**.

### Step A: Install & Run Ngrok
1.  Download ngrok from [ngrok.com](https://ngrok.com/download).
2.  Open a terminal and run the following command to tunnel port 3001 (Backend):
    ```bash
    ngrok http 3001
    ```
3.  Copy the **Forwarding URL** properly (e.g., `https://a1b2-c3d4.ngrok-free.app`).

### Step B: Configure Twilio Webhook
1.  Go to your **Twilio Console** > **Messaging** > **Settings** > **WhatsApp Sandbox Settings**.
2.  In the **"When a message comes in"** field, paste your ngrok URL followed by `/api/whatsapp/webhook`.
    *   **Example**: `https://a1b2-c3d4.ngrok-free.app/api/whatsapp/webhook`
3.  Set the method to **POST**.
4.  Click **Save**.

### Step C: Verify Connection
1.  Send a WhatsApp message (e.g., `join <your-sandbox-code>`) to the Twilio number.
2.  Watch your **Backend Terminal**. You should see logs indicating a message was received.

---

## 5. Running the Full Project
For a fully functional system, you need **3 separate terminals** running simultaneously:

1.  **Terminal 1 (Backend)**: `npm start` (Port 3001)
2.  **Terminal 2 (ML Service)**: `uvicorn app:app` (Port 8000)
3.  **Terminal 3 (Frontend)**: `npm run dev` (Port 3000)
4.  **Terminal 4 (Ngrok)**: `ngrok http 3001` (Running in background)

Open your browser to [http://localhost:3000](http://localhost:3000) to use the app.
