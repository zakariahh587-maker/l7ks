// Supabase Configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// REPLACE THESE WITH YOUR OWN SUPABASE PROJECT URL AND ANON KEY
const SUPABASE_URL = 'https://exqmtppdpupkesbqrfic.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sJIZxFReSHq31in0eSATXw_4l8a0oZZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
