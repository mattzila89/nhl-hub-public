import { createClient } from "@supabase/supabase-js";

import "../config.js";

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
);
