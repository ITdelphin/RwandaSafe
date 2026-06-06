require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        console.log("🌲 Supabase Client Initialized");
    } catch (err) {
        console.error("Failed to initialize Supabase:", err);
    }
} else {
    console.warn("⚠️ Supabase credentials missing. Storage features will be unavailable.");
}

module.exports = supabase;
