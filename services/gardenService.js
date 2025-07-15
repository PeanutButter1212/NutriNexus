import { supabase } from "../lib/supabase";

export async function retrieveDecorInventory(userId) {
  let { data: decorInventory, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return [];
  }
  return decorInventory;
}

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

export async function handleAssetConsumption(userId, plantId) {
  console.log("now handling asset");
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

  const newCount = data.count - 1;

  if (newCount === 0) {
    const { error: deleteError } = await supabase
      .from("inventory")
      .delete()
      .eq("id", data.id);

    if (deleteError) {
      return {
        success: false,
        error: deleteError,
        message: "Failed to delete inventory item.",
      };
    }

    return { success: true, message: "Item removed from inventory." };
  } else {
    const { error: decrementError } = await supabase
      .from("inventory")
      .update({ count: newCount })
      .eq("id", data.id);

    console.log("decreasing count: ");

    if (decrementError) {
      return {
        success: false,
        error: decrementError,
        message: "Failed to decrement item count.",
      };
    }

    return { success: true, message: "Item count decremented." };
  }
}

export async function fetchItemBank() {
  const { data, error } = await supabase.from("item").select("*");

  if (error) {
    //console.log("Error fetching item bank: " + error)
  }

  return data;
}

export async function retrieveGardenLayout(userId) {
  const { data, error } = await supabase
    .from("garden_layout")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.log("Error fetching user's garden layout: " + error);
  }

  return data;
}

export async function insertToGarden(userId, row, col, decorId) {
  const { data, error } = await supabase.from("garden_layout").insert([
    {
      user_id: userId,
      row,
      col,
      decor_id: decorId,
    },
  ]);

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

export async function removeFromGarden(userId, col, row) {


  const { error: deleteError } = await supabase
  .from("garden_layout")
  .delete()
  .eq("user_id", userId)
  .eq("row", row)
  .eq("col", col)




  if (deleteError) {
    return {
      success: false,
      deleteError,
      message: "Failed to insert into garden layout.",
    };
  }
  
  return {
    success: true,
    message: "Successfully deleted item from garden"
  }

}

export async function addtoDecorInventory(userId, plantId) {
  const { data, error } = await supabase
  .from("inventory")
  .select("id, count")
  .eq("user_id", userId)
  .eq("item_id", plantId)
  .limit(1)
  .single();

  if (error && error.code === 'PGRST116') {
  
    const { data: insertionData, error: insertionError } = await supabase.from("inventory").insert([
      {
        user_id: userId,
        item_id: plantId,
        count: 1
      },
    ]);

    if (insertionError) {
      return {
        success: false,
        error: insertionError,
        message: "Failed to insert item back to inventory"
      }
    }

    return {
      success: true,
      message: "Successfully returned item back to inventory"
    }
  
  } 

  if (error) {
    return {
      success: false,
      error: error,
      message: "Failed to check inventory"
    };
  }


  const newCount = data.count + 1 
  const { error: updateError } = await supabase
  .from("inventory")
  .update({ count: newCount })
  .eq("id", data.id);

  if (updateError) {
    return {
      success: false,
      error: updateError,
      message: "Failed to return item to inventory",
    };
  }

  return { success: true, message: "Item returned back to inventory" };

}

export async function fetchDecorIdOnTile(userId, col, row) {
    const { data, error } = await supabase
        .from('garden_layout')
        .select('decor_id')
        .eq('user_id', userId)
        .eq('row', row)
        .eq('col', col)
        .single();
    
    if (error) {
      return {
        success: false,
        error: error,
        message: "Error checking tile"
      };
    }

    return {
      success: true,
      item_id: data.decor_id
    }
  
}