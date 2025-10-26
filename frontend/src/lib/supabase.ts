import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema for user analytics
export interface UserAnalytics {
  id?: number;
  email: string;
  call_duration_data: any[];
  sad_path_data: any[];
  created_at?: string;
  updated_at?: string;
}

// Helper functions for Supabase operations
export const saveUserAnalytics = async (data: UserAnalytics) => {
  const { data: result, error } = await supabase
    .from('user_analytics')
    .upsert(data, { onConflict: 'email' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save user analytics: ${error.message}`);
  }

  return result;
};

export const getUserAnalytics = async (email: string) => {
  const { data, error } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw new Error(`Failed to fetch user analytics: ${error.message}`);
  }

  return data;
};

export const updateUserAnalytics = async (email: string, updates: Partial<UserAnalytics>) => {
  const { data, error } = await supabase
    .from('user_analytics')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('email', email)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user analytics: ${error.message}`);
  }

  return data;
};
