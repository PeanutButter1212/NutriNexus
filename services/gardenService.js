import { supabase } from "../lib/supabase";

export async function retrieveDecorInventory(userId) {
    let { data: decorInventory, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", userId)
    
        if (error) {
            console.error(error)
            return [];
        }
        return decorInventory
    
}

export async function insertFoodEntry(userId) {
    const { error } = await supabase.from("activity_log").insert([
      {
        food,
        calories: parseInt(calories),
        user_id: userId 
      },
    ]);
    return {error};
  
  }