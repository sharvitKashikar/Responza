# Emergency Response System (ERS)

A comprehensive emergency response management system built with React, TypeScript, and Supabase. This system helps emergency services coordinate and manage resources during emergencies.

## Features

- **Real-time Resource Tracking**
  - Live tracking of emergency vehicles (ambulances, fire trucks, police vehicles)
  - Status monitoring (available, in use, maintenance, offline)
  - Location-based resource allocation

- **Incident Management**
  - Create and track emergency incidents
  - Priority-based incident handling
  - Real-time status updates
  - Resource assignment to incidents

- **Interactive Map Interface**
  - Real-time visualization of resources and incidents
  - Custom markers for different resource types
  - Status-based color coding
  - Interactive popups with detailed information

- **User Authentication**
  - Secure login system
  - Role-based access control
  - User session management

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Leaflet Maps
  - React Router

- **Backend**
  - Supabase
  - PostgreSQL
  - Real-time subscriptions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/emergency-response-system.git
   cd emergency-response-system
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Project Structure

```
src/
├── components/         # Reusable UI components
├── contexts/          # React context providers
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── pages/             # Page components
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [Leaflet](https://leafletjs.com/) for the mapping functionality
- [Tailwind CSS](https://tailwindcss.com/) for the styling system 