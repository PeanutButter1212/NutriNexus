//this file handles services related to profiles and profile_page table
import { supabase } from "../lib/supabase";

//retrieve profile details
export async function updateProfileDetails(session, profile, details) {
  const userId = session?.user?.id;
  try {
    const { weight, height, age, calories, gender } = details;
    //updateData in profiles table
    const updateData = {
      is_first_time: false,
      weight: weight,
      height: height,
      age: age,
      calories: calories,
      gender: gender,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    //update Data for profile page
    const update_for_profile_page = {
      weight: weight,
      height: height,
      age: age,
      calories: calories,
      gender: gender,
    };

    const { error: profilePageError } = await supabase
      .from("profile_page")
      .update(update_for_profile_page)
      .eq("id", session.user.id);

    return true;
  } catch (err) {
    console.log(err.message)
    return false;
  }
}


export async function fetchUserInfo(userId) {
  const { data, error } = await supabase
    .from("profile_page")
    .select("weight, height, age, gender")
    .eq("id", userId)
    .single();

  
  if (error) {
    console.error("fetchUserInfo error", error);
    throw error;
  }


  return data;
}
//retrieve calorie info

export async function fetchProfileCalories(userId) {
  const { data, error } = await supabase
    .from("profile_page")
    .select("calories_consumed, calorie_goal")
    .eq("id", userId)
    .single();
    
    console.log(data)

    if (error) {
      console.error("fetchProfileCalories error", error);
      throw error;
    }
  

  return data;
}

//retrieve points info

export async function fetchPoints(userId) {
  console.log("userId passed to fetchPoints:", userId);
  const { data, error } = await supabase
    .from("profile_page")
    .select("points")
    .eq("id", userId)
    .single();

  console.log("Fetched points data:", data);

  return data?.points;
}

//retrieve info to check if visited location marker

export async function fetchVisited1(userId) {
  console.log("userId passed to fetchPoints:", userId);
  const { data, error } = await supabase
    .from("profile_page")
    .select("visited1")
    .eq("id", userId)
    .single();

  return data?.visited1;
}

//retrieve weekly calorie data for bar graph

export async function fetchWeeklyCalories(userId) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("calories, date")
    .eq("user_id", userId);



  const dailyTotals = {
    MON: 0,
    TUES: 0,
    WED: 0,
    THURS: 0,
    FRI: 0,
    SAT: 0,
    SUN: 0,
  };

  if (data.length === 0) {
    return;
  }

  data.forEach((entry) => {
    const date = new Date(entry.date);
    const dayOfTheWeek = date
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();

    let key;
    switch (dayOfTheWeek) {
      case "MON":
        key = "MON";
        break;
      case "TUE":
        key = "TUES";
        break;
      case "WED":
        key = "WED";
        break;
      case "THU":
        key = "THURS";
        break;
      case "FRI":
        key = "FRI";
        break;
      case "SAT":
        key = "SAT";
        break;
      case "SUN":
        key = "SUN";
        break;
      default:
        break;
    }
    if (key) {
      dailyTotals[key] += entry.calories;
    }
  });

  const output = Object.entries(dailyTotals).map(([day, value]) => ({
    day,
    value,
  }));

  return output;
}


//update calories when scanned and submitted
export async function updateCaloriesConsumed(userId) {
  try {
    const { data, error } = await supabase
      .from("activity_log")
      .select("calories")
      .eq("user_id", userId);

    if (error) {
      console.log("Error fetching entries:", error);
      return;
    }

    const totalCalories = data.reduce((sum, entry) => sum + entry.calories, 0);

    const { error: updateError } = await supabase
      .from("profile_page")
      .update({ calories_consumed: totalCalories })
      .eq("id", userId);

    if (updateError) {
      console.log("Error updating calories:", updateError);
      return;
    }

    console.log("Updated calories_consumed in profiles:", totalCalories);

    return totalCalories;
  } catch (err) {
    console.log("Unexpected error:", err);
  }
}

//fetch and display log in activity log screen

export async function fetchActivityLog(userId) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }
  return data;
}

//for the checked boxes in location1 so loads which one alr visited(put in hook)

export async function fetchClaimedCheckboxes(userId) {
  const { data, error } = await supabase
    .from("profile_page")
    .select("checkBoxes")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching checkBoxes:", error);
    return [];
  }

  return data?.checkBoxes || [];
}

//this is for handling points update and also update alr claimed locations (not in hook)
export default async function handleCheckboxes(userId, checkBoxKey) {
  const { data, error } = await supabase
    .from("profile_page")
    .select("checkBoxes, points")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return { success: false };
  }

  const claimed = data?.checkBoxes || [];
  const currentPoints = data?.points || 0;

  if (claimed.includes(checkBoxKey)) {
    console.log("alr claimed", checkBoxKey);
    return { success: false, alreadyClaimed: true };
  }

  const updatedClaimed = [...claimed, checkBoxKey];
  const updatedPoints = currentPoints + 10;

  const { error: updateError } = await supabase
    .from("profile_page")
    .update({
      checkBoxes: updatedClaimed,
      points: updatedPoints,
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Failed to update", updateError);
    return { success: false };
  }
  return { success: true };
}


export async function insertDefaultInventoryItems(userId) {
  const { data: itemDetails, error: itemError } = await supabase
    .from("item")
    .select("id, name")
    .in("id", ["bff1403f-7c39-4d09-ac07-4cc7b51019fe", "87c30106-bb4c-4796-a61a-6a1fd31be753"]);
  const defaultDecorItemIds = [
    "bff1403f-7c39-4d09-ac07-4cc7b51019fe", 
    "87c30106-bb4c-4796-a61a-6a1fd31be753", 
  ];

  const decorInventoryEntries = defaultDecorItemIds.map((itemId) => ({
    user_id: userId,
    item_id: itemId,
    count: 5,
  }));

  console.log("mapped decor inventory entries")

  const { data, error } = await supabase
    .from("inventory")
    .insert(decorInventoryEntries);

  if (error) {
    console.error("Error inserting default decor inventory items:", error);
    return false;
  }

  const defaultAccessoryItemIds = [
    "514422f1-b31d-41e9-b114-8d5e6cd719e9",
    "8e519ad9-fffc-475e-8e91-f4f347dc62c5",
    "bb3e0eb1-e03b-4d7f-8f24-c28dbb1e0a48",
    "8f0ad901-0c1c-4bbb-81e9-a9a87bc84b02"
  ]

  const accessoryInventoryEntries = defaultAccessoryItemIds.map((itemId) => ({
    user_id: userId,
    item_id: itemId,
  }));

  console.log("mapped accessory stuff")

  const { data: accessoryDataInsertion, error: accessoryDataInsertionError } = await supabase
    .from("accessory_inventory")
    .insert(accessoryInventoryEntries);

  if (accessoryDataInsertionError) {
    console.error("Error inserting default accessory inventory items: " + accessoryDataInsertionError.message)
  }
  return true;
}
