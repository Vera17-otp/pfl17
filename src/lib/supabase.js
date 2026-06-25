import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lcdvtjqmuooqteynakus.supabase.co";

const supabaseKey =
  "sb_publishable_tXMwl2zTCj7Ef0P14iC7zQ_pAqyEGEC";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
