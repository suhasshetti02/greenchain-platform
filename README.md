# GreenChain Platform

A full-stack application designed to bring transparency and trust to charitable food donations, minimizing waste and predicting food spoilage via AI.

## Problem

Food waste from events and restaurants often goes unutilized because charities lack real-time visibility into available food and its safety (spoilage risk).

## Solution

GreenChain creates a transparent ecosystem for donations, ensuring that contributions reach their intended recipients. It leverages AI to provide real-time spoilage estimates based on storage conditions and food types, keeping donated food safe. It also features an architecture designed to support future blockchain-based verification.

## Features

*   **User Authentication:** Secure JWT-based registration and login for donors, NGOs, and receivers.
*   **Donation Marketplace:** Donors can easily list items, and receivers can browse and claim available donations.
*   **AI Spoilage Prediction:** 
    *   Generative AI (Gemini) integration for real-time food safety advice.
    *   Predictive ML microservice for calculating numerical risk scores.
*   **Verification Flow:** A multi-step verification process (currently simulated for MVP) ensures claims are legitimate.
*   **Role-based Dashboards:** Tailored dashboard views for Donors, NGOs, and Receivers.

## Tech Stack

*   **Frontend:** Next.js 14, React 18, Tailwind CSS ^4.0
*   **Backend:** Node.js, Express.js
*   **Database & Auth:** Supabase (PostgreSQL), JWT
*   **AI/ML:** Gemini 2.0 Flash API (REST), Python (FastAPI), scikit-learn

## Architecture

The platform operates using a microservices-oriented approach:
1. **Frontend**: Next.js app running on port 3000.
2. **Backend**: Express API running on port 3001, handling business logic and talking to Supabase.
3. **ML Service**: Python FastAPI server (optional local run) serving the predictive scikit-learn model.

For a more detailed breakdown, please see `frontend/ARCHITECTURE.md`.

## Screenshots
*(Add screenshots here)*

## Demo
*(Add demo link here)*

## Installation

### Prerequisites
*   Node.js and npm
*   Python 3.x (for ML Service)
*   A Supabase account

## Environment Variables

**Backend (`backend/.env`)**
```env
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Running Locally

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **ML Service**:
   ```bash
   cd ml_service
   pip install -r requirements.txt
   uvicorn app:app --reload
   ```

## Testing

Currently, manual testing is required. Unit and integration tests are planned for future releases.

## Project Structure

*   `./backend`: The Node.js/Express API (auth, logic, Supabase integration).
*   `./frontend`: The Next.js client-side application.
*   `./ml_service`: Python FastAPI app serving the scikit-learn spoilage model.

## API Information

*   `POST /api/auth/register` & `/api/auth/login` - User Authentication
*   `GET /api/donations` & `POST /api/donations` - Manage donations
*   `POST /api/donations/:id/claim` - Claim a donation
*   `POST /api/ai/spoilage-suggestion` - Get AI spoilage estimate
*   `POST /api/verify/:eventId/verify` - Verify an event (generates mock tx_hash)

## Database Information

*   Hosted on Supabase (PostgreSQL).
*   Tables include `users`, `donations`, `claims`, and `verification_events`.
*   Secured via Row Level Security (RLS) policies.

## Limitations

*   **Simulated Blockchain**: The verification transaction hashes are currently mocked. No actual smart contracts are deployed.
*   **Security**: JWTs are stored in `localStorage` in the frontend (vulnerable to XSS).
*   **ML Integration**: The Python ML service is available locally but not yet fully integrated into the Node.js production data flow.

## Future Improvements

*   Implement `httpOnly` cookies for secure JWT storage.
*   Connect the verification flow to an actual blockchain network (e.g., Polygon).
*   Add automated testing (Jest, Cypress).

## License

This project is licensed under the MIT License.
