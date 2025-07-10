import { supabase } from "../lib/supabase";

export const generateUniqueUsername = async (baseName) => {
    let username = baseName;
    let suffix = 1;
  
    while (true) {
      console.log("now checking: " + username)
      const { data, error } = await supabase
        .from("username")
        .select("username")
        .eq("username", username)
        .maybeSingle()

      if (error) {
        console.error("Error checking username:", error);
        throw error; 
      }
  
      if (!data || data.length === 0) 
        {break
        };
      
      username = `${baseName}${suffix++}`;
    }
  
    return username;
  };
  