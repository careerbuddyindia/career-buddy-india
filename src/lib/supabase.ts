import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nstiphfmvzryboconnsa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdGlwaGZtdnpyeWJvY29ubnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MTQ5MDQsImV4cCI6MjEwODA5MDkwNH0.aDzjs2-EakDdPxjUVla8rHQZ4lqOYF9W3X03jK6i5Pk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
