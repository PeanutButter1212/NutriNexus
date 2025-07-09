import { supabase } from "../lib/supabase";

export const generateUniqueUsername = async (baseName) => {
    let username = baseName;
    let suffix = 1;
  
    while (true) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
  
      if (!data || data.length === 0) break;
      
      username = `${baseName}${suffix++}`;
    }
  
    return username;
  };
  