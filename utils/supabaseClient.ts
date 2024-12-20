import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kxmgsdqusahawnnoslpq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bWdzZHF1c2FoYXdubm9zbHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwMDg5MjAsImV4cCI6MjA0ODU4NDkyMH0.eJqpMKYgf5gxsJnACOe_MgZc6KNX82dYRjWcjwf-x08';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

