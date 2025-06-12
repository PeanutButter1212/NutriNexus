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


export async function fetchPlants() {
  const { data, error } = await supabase
    .from('plants')
    .select('id, name, image_url');

  if (error) {
    console.error('Failed to fetch plants:', error);
    return [];
  }

  return data;
};