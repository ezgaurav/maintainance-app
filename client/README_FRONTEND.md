# Home Appliance Maintenance App - Frontend

A comprehensive web application for managing home appliance maintenance services, built with React, TypeScript, and Tailwind CSS.

## Features

### Customer Features
- **Service Request Management**
  - Create service requests with appliance details
  - Upload images of issues
  - Select service location on interactive map
  - Track issue status in real-time
  - Rate and review completed services
- **Dashboard**: View all service requests with status filters
- **Notifications**: Receive real-time updates on request status
- **Profile Management**: Update personal information

### Technician Features
- **Job Management**
  - View assigned jobs
  - Accept or reject job assignments
  - Schedule service appointments
  - Start and complete jobs
  - Upload completion images (min 3 required)
  - Add work summary and cost details
- **Spare Parts Shop**
  - Browse spare parts by category
  - Search functionality
  - Add to cart and place orders
- **Order Tracking**: View order history and status
- **Profile**: View ratings, completed jobs, and skills

### Admin Features
- **Dashboard**: Overview with statistics
- **Issue Management**: Assign technicians to issues
- **Technician Management**: Verify and manage technicians
- **User Management**: View all users with filters
- **Inventory Management**: CRUD operations for spare parts
- **Find Technicians**: Algorithm-based technician matching

## Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time updates
- **Axios** - API communication
- **Leaflet** - Interactive maps
- **React Leaflet** - React wrapper for Leaflet
- **Nominatim API** - Address autocomplete
- **Headless UI** - Accessible components
- **Heroicons** - Icons
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **date-fns** - Date formatting

## Project Structure

```
client/src/
├── components/
│   ├── maps/
│   │   ├── AddressAutocomplete.tsx
│   │   └── LocationPicker.tsx
│   └── shared/
│       ├── AdminSidebar.tsx
│       ├── Badge.tsx
│       ├── BottomNav.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── FileUpload.tsx
│       ├── Input.tsx
│       ├── Loading.tsx
│       ├── Modal.tsx
│       ├── Navbar.tsx
│       ├── Select.tsx
│       └── Textarea.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useSocket.ts
├── pages/
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── FindTechnicians.tsx
│   │   ├── Inventory.tsx
│   │   ├── Issues.tsx
│   │   ├── Technicians.tsx
│   │   └── Users.tsx
│   ├── auth/
│   │   ├── AdminLogin.tsx
│   │   ├── CustomerLogin.tsx
│   │   ├── CustomerRegister.tsx
│   │   ├── TechnicianLogin.tsx
│   │   └── TechnicianRegister.tsx
│   ├── customer/
│   │   ├── CreateIssue.tsx
│   │   ├── Dashboard.tsx
│   │   ├── IssueDetails.tsx
│   │   └── Notifications.tsx
│   └── technician/
│       ├── Cart.tsx
│       ├── Dashboard.tsx
│       ├── JobDetails.tsx
│       ├── Orders.tsx
│       ├── Profile.tsx
│       └── Shop.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── issue.service.ts
│   ├── notification.service.ts
│   ├── socket.service.ts
│   ├── sparePart.service.ts
│   └── user.service.ts
├── store/
│   └── index.ts
├── types/
│   └── index.ts
├── utils/
│   ├── constants.ts
│   └── helpers.ts
├── App.tsx
└── main.tsx
```

## Design System

### Color Themes
- **Customer/Technician**: Emerald-900 primary color
- **Admin**: Indigo-600 primary color
- Status badges with semantic colors (success, warning, danger, info)

### Responsive Design
- **Mobile-first approach**
- Bottom navigation for mobile devices (customer/technician)
- Sidebar navigation for desktop (admin)
- Responsive grid layouts
- Touch-friendly UI elements

## Key Features Implementation

### Authentication & Authorization
- Role-based access control (customer, technician, admin)
- Protected routes with automatic redirects
- Token-based authentication
- Persistent login state

### Real-time Updates
- Socket.IO integration for live notifications
- Automatic UI updates on data changes
- Push notifications support
- Event-driven architecture

### Maps Integration
- Interactive location picker with click-to-select
- Address autocomplete using Nominatim API
- Display service locations on map
- Geolocation support

### File Upload
- Multi-file upload with preview
- Drag-and-drop support
- Image validation
- Progress indication

### State Management
- Global state with Zustand
- Auth state (user, token, authentication status)
- Notification state (notifications, unread count)
- Cart state (items, total amount)

### API Integration
- Centralized API client with Axios
- Automatic token injection
- Error handling
- Request/response interceptors

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Routing Structure

### Public Routes
- `/login` - Customer login
- `/register` - Customer registration
- `/technician/login` - Technician login
- `/technician/register` - Technician registration
- `/admin/login` - Admin login

### Customer Routes (Protected)
- `/customer` - Dashboard
- `/customer/create-issue` - Create service request
- `/customer/issues/:id` - Issue details
- `/customer/notifications` - Notifications
- `/customer/profile` - Profile

### Technician Routes (Protected)
- `/technician` - Jobs dashboard
- `/technician/jobs/:id` - Job details
- `/technician/shop` - Spare parts shop
- `/technician/cart` - Shopping cart
- `/technician/orders` - Order history
- `/technician/profile` - Profile
- `/technician/notifications` - Notifications

### Admin Routes (Protected)
- `/admin` - Admin dashboard
- `/admin/issues` - Issue management
- `/admin/technicians` - Technician management
- `/admin/users` - User management
- `/admin/inventory` - Inventory management
- `/admin/find-technicians` - Find technicians

## Component Documentation

### Shared Components

#### Button
Reusable button component with variants and loading states.

Props:
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean

#### Modal
Dialog component with overlay and animations.

Props:
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl'

#### Badge
Status and label badge component.

Props:
- `variant`: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
- `size`: 'sm' | 'md' | 'lg'

#### FileUpload
File upload component with preview and validation.

Props:
- `accept`: string
- `multiple`: boolean
- `maxFiles`: number
- `onFilesChange`: (files: File[]) => void
- `preview`: boolean

### Map Components

#### LocationPicker
Interactive map for selecting service location.

Props:
- `initialPosition`: [number, number]
- `onLocationSelect`: (lat: number, lng: number) => void
- `height`: string

#### AddressAutocomplete
Address search with autocomplete using Nominatim API.

Props:
- `onAddressSelect`: (address: string, lat: number, lng: number) => void
- `placeholder`: string
- `label`: string

## Custom Hooks

### useAuth
Authentication hook with role-based access control.

```typescript
const { user, isAuthenticated } = useAuth('customer');
```

### useSocket
Socket.IO integration hook for real-time updates.

```typescript
const socket = useSocket();
```

## State Management

### Auth Store
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login: (token: string, user: User) => void,
  logout: () => void,
  setUser: (user: User) => void
}
```

### Notification Store
```typescript
{
  notifications: Notification[],
  unreadCount: number,
  addNotification: (notification: Notification) => void,
  setNotifications: (notifications: Notification[]) => void,
  markAsRead: (id: string) => void,
  clearNotifications: () => void
}
```

### Cart Store
```typescript
{
  items: CartItem[],
  addToCart: (sparePart: SparePart, quantity: number) => void,
  removeFromCart: (sparePartId: string) => void,
  updateQuantity: (sparePartId: string, quantity: number) => void,
  clearCart: () => void,
  getTotalAmount: () => number
}
```

## Best Practices

1. **TypeScript**: Full type safety with interfaces and types
2. **Component Composition**: Reusable, composable components
3. **Error Handling**: Comprehensive error handling and user feedback
4. **Loading States**: Loading indicators for all async operations
5. **Responsive Design**: Mobile-first, responsive layouts
6. **Accessibility**: Semantic HTML and ARIA attributes
7. **Code Organization**: Clean folder structure and naming conventions
8. **Performance**: Lazy loading, memoization, and optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of a private repository.

## Authors

- Frontend Development Team
