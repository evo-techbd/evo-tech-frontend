# Evo-Tech Frontend

Next.js 14 frontend application for the Evo-Tech Bangladesh e-commerce platform with comprehensive e-commerce features.

## Features

### Core Features
- Modern React application with TypeScript
- Responsive design with Tailwind CSS
- Role-based authentication (Admin, Employee, User)
- Advanced product browsing with search and filters
- Shopping cart and wishlist functionality
- Comprehensive order management
- SEO optimized with Next.js
- State management with Redux Toolkit
- Real-time notifications

### User Features
- **Product Discovery**: 
  - Advanced search with filters
  - Category and subcategory browsing
  - Brand filtering
  - Price range and feature filters
  - Sort by price, rating, newest
- **Product Details**:
  - Comprehensive product information with tabs
  - Features section with images and descriptions
  - Technical specifications
  - Customer reviews with rating distribution and filtering
  - Product FAQs
  - Color variations with individual availability
- **Shopping Experience**: Cart persistence, wishlist, product comparison
- **Account Management**: 
  - User profile and settings
  - Multiple address management
  - Comprehensive order history with filtering
  - Order details with tracking information
- **Order Tracking**: Real-time order status updates with visual timeline
- **Reviews & Ratings**: 
  - Write detailed product reviews
  - Filter reviews by rating
  - Sort reviews by newest/highest/lowest rating
  - View rating distribution charts
- **Responsive Design**: Mobile-first responsive design with optimized layouts

### Role-Based Dashboards
- **User Dashboard**: Profile, orders, addresses, wishlist
- **Employee Dashboard**: Order management, customer support, inventory viewing
- **Admin Dashboard**: Complete system management, analytics, user management

### Admin Features
- **Product Management**: 
  - Complete CRUD operations with enhanced update form
  - Dynamic category/subcategory/brand selection with automatic filtering
  - Color variation management with individual stock tracking
  - Product features, specifications, and FAQs management
  - Multiple image upload and management
  - SEO meta tags configuration
  - Inventory tracking with low stock alerts
- **Order Management**: Status updates, invoice generation, shipping tracking
- **User Management**: User roles, permissions, customer profiles
- **Review Management**: View, moderate, and respond to customer reviews
- **Analytics**: Sales reports, user activity, performance metrics
- **Content Management**: Landing page sections, banners, featured products
- **System Settings**: Configuration, email templates, notifications

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Redux Toolkit
- NextAuth.js
- Radix UI components
- Axios for API calls
- React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

   Optional but recommended:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_FEND_URL=http://localhost:3000
   AUTH_SECRET=your-secret-key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/                    # Next.js app router pages
│   ├── (admin)/           # Admin dashboard routes
│   │   └── admin/         # Admin pages
│   ├── (employee)/        # Employee dashboard routes
│   │   └── employee/      # Employee pages
│   ├── (user)/            # User dashboard routes
│   │   └── dashboard/     # User dashboard pages
│   ├── (auth)/            # Authentication pages
│   ├── (public)/          # Public pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── admin/            # Admin-specific components
│   ├── employee/         # Employee-specific components
│   ├── user/             # User dashboard components
│   ├── auth/             # Authentication components
│   ├── products/         # Product-related components
│   ├── orders/           # Order-related components
│   ├── search/           # Search components
│   ├── cart/             # Cart components
│   ├── wishlist/         # Wishlist components
│   ├── reviews/          # Review components
│   ├── analytics/        # Analytics components
│   └── common/           # Common components
├── hooks/                # Custom React hooks
│   ├── use-auth.ts       # Authentication hook
│   ├── use-cart.ts       # Cart management hook
│   ├── use-search.ts     # Search functionality hook
│   └── ...              # Other hooks
├── lib/                  # Utility libraries
│   ├── api.ts           # API client configuration
│   ├── auth.ts          # Authentication utilities
│   ├── constants.ts     # Application constants
│   └── ...              # Other utilities
├── store/                # Redux store and slices
│   ├── slices/          # Redux slices
│   │   ├── authSlice.ts # Authentication state
│   │   ├── cartSlice.ts # Cart state
│   │   ├── productSlice.ts # Product state
│   │   └── ...          # Other slices
│   └── store.ts         # Store configuration
├── types/                # TypeScript type definitions
│   ├── auth.ts          # Authentication types
│   ├── product.ts       # Product types
│   ├── order.ts         # Order types
│   └── ...              # Other types
├── utils/                # Helper functions
└── middleware.ts         # Next.js middleware for auth
```

## Page Structure

### Public Pages
- `/` - Home page with featured products and sections
- `/products` - Product listing with search and filters
- `/products/[slug]` - Product detail page
- `/categories/[category]` - Category-based product listing
- `/search` - Advanced search results
- `/cart` - Shopping cart
- `/about` - About page
- `/contact` - Contact page

### Authentication Pages
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset form

### User Dashboard (Protected Routes)
- `/dashboard` - User dashboard overview
- `/dashboard/profile` - User profile management
- `/dashboard/orders` - Order history
- `/dashboard/addresses` - Address management
- `/dashboard/wishlist` - User wishlist
- `/dashboard/reviews` - User reviews

### Employee Dashboard (Employee Role)
- `/employee/dashboard` - Employee dashboard overview
- `/employee/orders` - Order management
- `/employee/customers` - Customer support
- `/employee/inventory` - View inventory status

### Admin Dashboard (Admin Role)
- `/admin/dashboard` - Admin dashboard with analytics
- `/admin/products` - Product management
- `/admin/products/create` - Add new product
- `/admin/products/[id]/edit` - Edit product
- `/admin/categories` - Category management
- `/admin/brands` - Brand management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/employees` - Employee management
- `/admin/inventory` - Inventory management
- `/admin/analytics` - Analytics and reports
- `/admin/settings` - System settings
- `/admin/content` - Content management

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` - Backend API base (e.g. `https://api.example.com/api/v1`)
- `NEXT_PUBLIC_API_URL` - Optional override for the public Axios client (defaults to backend URL)
- `NEXT_PUBLIC_FEND_URL` - Public origin of this frontend (used for absolute links and admin utilities)
- `NEXTAUTH_SECRET` / `AUTH_SECRET` - Secrets used by NextAuth JWT/session handling
- `NEXTAUTH_URL` - Base URL of the deployed site (include protocol)

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## Deployment

This app can be deployed to Vercel, Netlify, or any platform supporting Next.js.

For Vercel deployment:
1. Connect your GitHub repository
2. Configure the following Environment Variables in the Vercel dashboard for each environment (Preview/Production):
   - `NEXT_PUBLIC_BACKEND_URL` – points to your public API base, e.g. `https://api.your-backend.com/api/v1`
   - `NEXT_PUBLIC_API_URL` – optional override for the Axios client (defaults to the backend URL above)
   - `NEXT_PUBLIC_FEND_URL` – your frontend origin, e.g. `https://evo-tech.vercel.app`
   - `NEXTAUTH_URL` – must match the deployed frontend URL, including protocol
   - `NEXTAUTH_SECRET` and `AUTH_SECRET` – strong random strings shared with your Auth provider
3. Trigger a deployment (Vercel will run `npm run build` automatically)

> Tip: The updated `next.config.mjs` now falls back to the Vercel-provided domain when `NEXT_PUBLIC_FEND_URL` is not set, but you should still define it explicitly for custom domains.

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Test your changes

## License

MIT License
