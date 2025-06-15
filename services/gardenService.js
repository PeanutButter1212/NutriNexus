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

export async function handleSuccessfulPlacement(userId, plantId) {
  console.log("Start handleSuccessfulPlacement", { userId, plantId });
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
  console.log(data)

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
        console.error("Delete Error: " + deleteError)
      }

  } else {
    
    const { error: decrementError } = await supabase
    .from("inventory")
    .update({ count: newCount })
    .eq("id", data.id)

    console.log("decreasing count: ")


    if (decrementError) {
      console.error("Decrement Error: " + JSON.stringify(decrementError, null, 2))
    }



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