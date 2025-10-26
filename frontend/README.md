# Voice Agent Analytics Frontend

A modern React + TypeScript frontend application for voice agent call analytics, featuring interactive charts and user data persistence with Supabase integration. This is a **standalone analytics dashboard** that does not depend on any backend API.

## Features

- **Modern UI Design**: Inspired by superbryn.com with dark theme and gradient accents
- **Interactive Charts**: Call Duration Analysis (distribution plot) and Sad Path Analysis (donut chart)
- **User Data Persistence**: Email-based authentication with Supabase integration
- **Custom Data Editing**: Users can modify chart values and save their preferences
- **Responsive Design**: Mobile-first approach with Material-UI components
- **Real-time Updates**: Charts update dynamically based on user input
- **Standalone Application**: No backend dependencies - works independently

## Technology Stack

- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Component library and theming
- **Recharts** - Chart library for data visualization
- **Supabase** - Backend-as-a-Service for data persistence
- **Docker** - Containerized deployment

## Chart Types

### 1. Call Duration Analysis
- **Type**: Distribution plot (kernel density estimate)
- **Purpose**: Shows the distribution of call durations
- **Features**: 
  - Peak duration identification
  - Interactive tooltips
  - Customizable peak duration
  - Statistical insights

### 2. Sad Path Analysis
- **Type**: Donut chart
- **Purpose**: Breakdown of failed customer interactions
- **Features**:
  - Category-based failure analysis
  - Percentage calculations
  - Color-coded segments
  - Editable categories and values

## User Authentication & Data Persistence

### Email-Based System
- Users enter their email to customize charts
- Data is saved to Supabase database
- Previous data is shown before overwriting
- Confirmation required for data updates

### Data Structure
```typescript
interface UserAnalytics {
  email: string;
  call_duration_data: Array<{duration: number, density: number}>;
  sad_path_data: Array<{name: string, value: number, color: string}>;
  created_at: string;
  updated_at: string;
}
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker (optional)
- Supabase account (for data persistence) - [📖 Setup Guide](SUPABASE_SETUP.md)

### Easy Run Scripts

**Windows:**
```bash
run.bat
```

**Linux/Mac:**
```bash
chmod +x run.sh
./run.sh
```

This will automatically start the development server at http://localhost:3000

> **⚠️ Important**: You need to set up Supabase first! See [Supabase Setup Guide](SUPABASE_SETUP.md) for detailed instructions.

### Manual Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up Supabase (REQUIRED):**
   - Follow the complete guide: [📖 Supabase Setup Guide](SUPABASE_SETUP.md)
   - Or quick setup:
     ```bash
     # Get credentials from supabase.com
     # Edit .env.local with your credentials
     cp env.example .env.local
     ```

3. **Start development server:**
```bash
npm start
```

4. **Access the application:**
- Frontend: http://localhost:3000

### Docker Development

1. **Start frontend only:**
```bash
cd frontend
docker build -t voice-analytics-frontend .
docker run -p 3000:3000 voice-analytics-frontend
```

2. **Or use Docker Compose (frontend only):**
```bash
docker-compose up frontend
```

3. **Access the application:**
- Frontend: http://localhost:3000

## Supabase Setup

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Get your project URL and anon key

### 2. Create Database Table
```sql
CREATE TABLE user_analytics (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  call_duration_data JSONB NOT NULL DEFAULT '[]',
  sad_path_data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust as needed)
CREATE POLICY "Allow public access" ON user_analytics FOR ALL USING (true);
```

### 3. Environment Variables
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
src/
├── components/
│   ├── AnalyticsDashboard.tsx    # Main dashboard component
│   ├── CallDurationChart.tsx     # Call duration distribution chart
│   ├── SadPathChart.tsx          # Sad path donut chart
│   └── EmailAuthModal.tsx       # Email authentication modal
├── lib/
│   └── supabase.ts              # Supabase configuration and helpers
├── App.tsx                      # Main app component with theme
├── App.css                      # Global styles and animations
└── index.tsx                    # App entry point
```

## Customization

### Theme Customization
The app uses a custom Material-UI theme with:
- Dark color palette
- Gradient accents (blue to orange)
- Custom typography with Inter font
- Animated background elements

### Chart Customization
- **Call Duration**: Adjust peak duration and distribution curve
- **Sad Path**: Modify failure categories and their values
- **Colors**: Custom color schemes for different data types

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build frontend only
cd frontend
docker build -t voice-analytics-frontend .
docker run -p 3000:3000 voice-analytics-frontend
```

### Cloud Deployment
The app is deployed and live at:
- **Live Application**: https://cah-app.netlify.app/

The app is ready for deployment on:
- **Netlify** - Static site hosting (✅ Currently deployed)
- **Vercel** - Zero-config deployment
- **AWS S3 + CloudFront** - Scalable static hosting
- **Google Cloud Storage** - Global CDN

## Development Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## Performance Features

- **Code Splitting**: Automatic code splitting with React.lazy
- **Image Optimization**: Optimized asset loading
- **Caching**: Browser caching for static assets
- **Compression**: Gzip compression enabled
- **Lazy Loading**: Components load on demand

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details