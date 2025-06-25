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

//for save button to save the equipped things need to convert to proper format for insert in supabase

export async function saveEquippedItems(userId, equippedItems) {
  const allSlots = ["head", "body", "hand"];
  const updates = allSlots.map((slot) => ({
    user_id: userId,
    slot,
    item_id: equippedItems[slot]?.item_id ?? null, //saves null if no item equip fixes prob when we realod previously saved data
    updated: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("accessory_layout")
    .upsert(updates, { onConflict: ["user_id", "slot"] });

  if (error) {
    console.error("Failed to save", error);
    return false;
  }

  return true;
}

//to load the saved items once screen render format returned is sth like below which is same as the one i used to store in screen
/*
{
  head: { itemData },
  body: { itemData },
  hand: { itemData }
}
  */

export async function fetchEquippedItems(userId) {
  const { data, error } = await supabase
    .from("accessory_layout")
    //gets full item object from item table
    .select(
      "slot,accessory_inventory(item_id,item_name,image_url,slot,position)"
    )
    .eq("user_id", userId);

  console.log("Raw Supabase data:", data);

  if (error) {
    console.error("Failed to load", error);
    return {};
  }

  const equippedArray = {};
  for (const entry of data) {
    equippedArray[entry.slot] = entry.accessory_inventory;
  }

  return equippedArray;
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
