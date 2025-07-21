import { supabase } from "../lib/supabase";

export async function fetchPlants() {
    const { data, error } = await supabase
      .from("item")
      .select("id, name, image_url");
  
    if (error) {
      console.error("Failed to fetch plants:", error);
      return [];
    }
  
    return data;
  }
  
  export async function getCostsMap(itemIds) {
    if (!itemIds || itemIds.length === 0) return {};
  
    const { data, error } = await supabase
      .from("item")
      .select("id, cost")
      .in("id", itemIds);
  
    if (error || !data) {
      console.error("Failed to fetch item costs:", error);
      return {};
    }
  
    const costMap = {};
    for (const item of data) {
      costMap[item.id] = item.cost;
    }
  
    return costMap;
  }

export async function fetchItemBank() {
    const { data, error } = await supabase.from("item").select("*");

    if (error) {
        //console.log("Error fetching item bank: " + error)
    }

return data;
}