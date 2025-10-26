# Supabase Setup Guide

This guide will help you set up Supabase for the Voice Agent Analytics Dashboard.

## 📋 Overview

The frontend uses Supabase to save user customizations to the charts. When users enter their email and edit chart values, the data is saved to Supabase and can be retrieved later.

## 🔑 Step-by-Step Setup

### 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email
4. Verify your email if needed

### 2. Create a New Project

1. Click **"New Project"**
2. Fill in the details:
   - **Name**: `voice-agent-analytics` (or any name you prefer)
   - **Database Password**: Create a strong password (save it for later)
   - **Region**: Choose closest to you
3. Click **"Create new project"**
4. Wait for project to be created (2-3 minutes)

### 3. Get Your API Credentials

1. Once your project is ready, go to **Project Settings** (gear icon on the left sidebar)
2. Click **"API"** in the settings menu
3. You'll see two important values:

   **Project URL:**
   ```
   https://your-project-id.supabase.co
   ```
   
   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIs...
   ```

4. Copy both values

### 4. Set Up Environment Variables

1. In your frontend folder, copy the example file:
   ```bash
   cd frontend
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```bash
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   REACT_APP_ENVIRONMENT=development
   ```

   Replace:
   - `https://your-project-id.supabase.co` with your actual Project URL
   - `your-anon-key-here` with your actual anon public key

### 5. Create the Database Table

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. Copy and paste this SQL:

```sql
-- Create user_analytics table
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

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations" ON user_analytics
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

5. Click **"Run"** button
6. You should see success messages

### 6. Verify Setup

1. Go to **"Table Editor"** in the left sidebar
2. Click **"user_analytics"**
3. You should see an empty table with columns: id, email, call_duration_data, sad_path_data, created_at, updated_at

## ✅ How the Email Authentication Works

### User Flow:

1. **First Visit**: User opens the dashboard and sees default charts
2. **Click "Customize" Button**: User wants to edit chart values
3. **Email Modal Appears**: User must enter their email address
4. **Check Existing Data**: System checks if user has saved data in Supabase
5. **Confirmation Dialog** (if data exists):
   - Shows previous custom values
   - Asks user to confirm overwrite
   - User can choose to keep existing data or overwrite
6. **Save Data**: Custom values are saved to Supabase against their email
7. **Load on Return**: Next time user visits with same email, their custom data loads automatically

### Technical Implementation:

```typescript
// When user submits email
const handleEmailSubmit = async (email: string) => {
  // 1. Check if user already has data
  const { data: existingData } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('email', email)
    .single();

  // 2. If data exists, show confirmation
  if (existingData) {
    const confirmed = window.confirm(
      `Previous data found. Overwrite?\n\nPrevious values...`
    );
    if (!confirmed) return;
  }

  // 3. Save data to Supabase
  await supabase.from('user_analytics').upsert({
    email,
    call_duration_data: customData,
    sad_path_data: customData,
  });

  // 4. Store email in localStorage
  localStorage.setItem('userEmail', email);
};
```

## 🧪 Testing

1. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Open http://localhost:3000

3. Click "Customize" button on any chart

4. Enter your email (e.g., `test@example.com`)

5. You should see your data is now editable

6. Refresh the page and your email - data should persist

## 📊 Data Structure

The `user_analytics` table stores:
- **email**: User's email address (unique)
- **call_duration_data**: JSON array of call duration data points
- **sad_path_data**: JSON array of sad path analysis data
- **created_at**: Timestamp when record was created
- **updated_at**: Timestamp when record was last updated

## 🔒 Security Notes

- The `anon` key is safe to use in frontend code
- Row Level Security (RLS) is enabled
- We're using a public policy for simplicity - you can add authentication later if needed
- Never expose your `service_role` key in frontend code

## 🆘 Troubleshooting

### Issue: "Failed to save user data"
- Check that you've created the `user_analytics` table
- Verify your environment variables are correct
- Make sure Supabase project is active (not paused)

### Issue: "Error fetching user data"
- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure RLS policy allows access

### Issue: Can't connect to Supabase
- Verify REACT_APP_SUPABASE_URL is correct
- Check REACT_APP_SUPABASE_ANON_KEY is set
- Restart the dev server after changing .env.local

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
