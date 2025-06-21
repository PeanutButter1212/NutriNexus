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
    .from('item')
    .select('id, name, image_url');

  if (error) {
    console.error('Failed to fetch plants:', error);
    return [];
  }


  return data;
};

export async function handleAssetConsumption(userId, plantId) {
  console.log("now handling asset")
  const { data, error } = await supabase
    .from("inventory")
    .select("id, count")
    .eq("user_id", userId)
    .eq("item_id", plantId)
    .limit(1)
    .single(); 


  if (!data) {
    console.error("No inventory item found for:", { userId, plantId });
  return;
}

  if (error) {
    throw error;
  }

  const newCount = data.count - 1 

  if (newCount === 0) {
    console.log("deleting entry: ")
    const { error: deleteError } = await supabase
      .from("inventory")
      .delete()
      .eq("id", data.id)

      
    
      if (deleteError) {
        return { success: false, error: deleteError, message: "Failed to delete inventory item." };
      }

    return { success: true, message: "Item removed from inventory." };


  } else {
    
    const { error: decrementError } = await supabase
    .from("inventory")
    .update({ count: newCount })
    .eq("id", data.id)

    console.log("decreasing count: ")


    if (decrementError) {
      return { success: false, error: decrementError, message: "Failed to decrement item count." };
    }

    return { success: true, message: "Item count decremented." };



  }


  

}


export async function fetchItemBank() {
  const { data, error } = await supabase
    .from("item")
    .select("*")
  
  if (error) {
    console.log("Error fetching item bank: " + error)
  }

  return data; 
}

export async function retrieveGardenLayout(userId) {
  const { data, error } = await supabase
    .from("garden_layout")
    .select("*")
    .eq('user_id', userId)
  
  if (error) {
    console.log("Error fetching user's garden layout: " + error)
  }

  return data; 
}

export async function insertToGarden(userId, row, col, decorId) {

  console.log("inserting... ")
  const { data, error } = await supabase
  .from("garden_layout")
  .insert([
    {
    user_id: userId,
    row,
    col,
    decor_id: decorId
    } ])

  if (error) {
    return {
      success: false,
      error,
      message: "Failed to insert into garden layout.",
    };
  }

    return {
      success: true,
      data,
      message: "Successfully inserted item into garden layout.",
    };

}