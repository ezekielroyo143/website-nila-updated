const SUPABASE_URL = "https://tzzrxmzfsjafrgfhbyqa.supabase.co";
const SUPABASE_KEY = "sb_publishable_lFC7C2sqGOab9Q297MuQvg_YTsMZCVw";
export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
);
