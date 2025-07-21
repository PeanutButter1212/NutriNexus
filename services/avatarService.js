import { supabase } from "../lib/supabase";
import { getCostsMap } from "./itemBankService";
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
    //use a foreign key for user_id and item_id to ensure that item exists from inventory
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

export async function gatherAccessoryNetWorth(userId) {
  const { data, error } = await supabase
  .from("accessory_inventory")
  .select("item_id")
  .eq("user_id", userId)

  console.log("data form gatherAccessoryInventory: " + data)

  if (error || !data) {
    console.error("Failed to fetch accessory inventory", accessoryError);
    return 0;
  }

  const itemIds = data.map(item => item.item_id);

  const costMap = await getCostsMap(itemIds);

  let totalPoints = 0;

  for (const { item_id } of data) {
    totalPoints += costMap[item_id] || 0;
  }

  console.log("totalpoints in accessory net worth: " + totalPoints)

  return totalPoints 

}