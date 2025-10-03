# Campus Events & Ticketing Web Application

A comprehensive web application for managing campus events, ticketing, and attendance tracking using QR codes. Built with React, Node.js, Express, MongoDB, and TypeScript.

## Features

### For Students
- Browse and search campus events with filtering by category, date, and keywords
- Save events to personal calendar
- Claim free or paid tickets for events
- Receive digital tickets with unique QR codes
- View and manage personal tickets
- Download QR codes for offline access

### For Event Organizers
- Create and manage events with detailed information
- Access comprehensive event dashboards with analytics
- Track ticket sales and attendance in real-time
- Export attendee lists as CSV files
- Validate tickets using QR code scanning
- Manage event capacity and ticket types

### For Administrators
- Approve organizer accounts and organizations
- Moderate event listings for policy compliance
- View global analytics and participation trends
- Manage organizations and user roles
- Export comprehensive reports

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Toastify** for notifications
- **Lucide React** for icons
- **QRCode.react** for QR code generation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcryptjs** for password hashing
- **QRCode** for QR code generation
- **Express Validator** for input validation
- **Helmet** for security
- **Rate Limiting** for API protection

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SOEN341
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campus-events
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) servers concurrently.

## Project Structure

```
SOEN341/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── App.tsx          # Main app component
│   ├── package.json
│   └── tailwind.config.js
└── package.json             # Root package.json for scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/organizations` - Get all organizations

### Events
- `GET /api/events` - Get all published events (with filtering)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event (Organizer)
- `PUT /api/events/:id` - Update event (Organizer)
- `DELETE /api/events/:id` - Delete event (Organizer)
- `POST /api/events/:id/save` - Save event to calendar (Student)
- `DELETE /api/events/:id/save` - Remove from calendar (Student)

### Tickets
- `POST /api/tickets/claim` - Claim ticket for event (Student)
- `GET /api/tickets/my` - Get user's tickets (Student)
- `GET /api/tickets/:id` - Get single ticket (Student)
- `POST /api/tickets/validate` - Validate ticket QR code (Organizer)
- `POST /api/tickets/:id/use` - Mark ticket as used (Organizer)

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/users` - Get all users (Admin)
- `PUT /api/admin/users/:id/approve` - Approve/reject user (Admin)
- `GET /api/admin/events` - Get all events for moderation (Admin)
- `PUT /api/admin/events/:id/approve` - Approve/reject event (Admin)
- `GET /api/admin/events/:id/attendees` - Get event attendees (Admin)

## User Roles

### Student
- Browse and search events
- Save events to personal calendar
- Claim tickets for events
- View and manage personal tickets
- Download QR codes

### Organizer
- Create and manage events
- View event analytics and dashboards
- Validate tickets using QR codes
- Export attendee lists
- Manage event capacity

### Admin
- Approve user accounts and organizations
- Moderate event listings
- View global analytics
- Manage organizations
- Export comprehensive reports

## QR Code System

The application uses QR codes for digital tickets:
- Each ticket has a unique QR code containing ticket information
- QR codes are generated using the `qrcode` npm package
- Organizers can validate tickets by scanning QR codes
- Students can download QR codes for offline access

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet for security headers
- Role-based access control

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm start
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Additional Features (Proposed)

The system is designed to be extensible. Some potential additional features that could be implemented:

1. **Real-time notifications** using WebSockets
2. **Email notifications** for event updates and ticket confirmations
3. **Payment integration** for paid tickets
4. **Mobile app** using React Native
5. **Advanced analytics** with charts and graphs
6. **Event recommendations** based on user preferences
7. **Social features** like event reviews and ratings
8. **Calendar integration** with Google Calendar, Outlook, etc.
9. **Multi-language support**
10. **Dark mode** theme option

## Support

For support or questions, please contact the development team or create an issue in the repository.