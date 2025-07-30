import { createClient } from "@supabase/supabase-js";

// Supabase configuration
// You need to get these values from your Supabase dashboard:
// 1. Go to your Supabase project dashboard
// 2. Click on "Settings" in the left sidebar
// 3. Click on "API"
// 4. Copy the "Project URL" and "anon public" key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl) {
  throw new Error(
    "VITE_SUPABASE_URL environment variable is required. Please create a .env file with your Supabase URL."
  );
}

if (!supabaseAnonKey || supabaseAnonKey === "your-anon-public-key-here") {
  throw new Error(
    "VITE_SUPABASE_ANON_KEY environment variable is required. Please create a .env file with your Supabase anon key."
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export for use in other files
export default supabase;
