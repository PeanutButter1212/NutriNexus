import { supabase } from "../lib/supabase";

export async function retrieveAccessoryInventory(userId) {
  let { data: accessoryInventory, error } = await supabase
    .from("accessory_inventory")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return [];
  }
  return accessoryInventory;
}

/*export async function fetchAccessory() {
  const { data, error } = await supabase
    .from("item")
    .select("id, name, image_url, slot, position")
    .eq("type", "Accessory");

  if (error) {
    console.error("Failed to fetch plants:", error);
    return [];
  }

  return data;
} */
