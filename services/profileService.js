//this file handles services related to profiles and profile_page table
import { supabase } from "../lib/supabase";

//retrieve profile details
export async function updateProfileDetails(session, details) {
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
      gender: gender
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
      gender: gender
    };

    const { error: profilePageError } = await supabase
      .from("profile_page")
      .update(update_for_profile_page)
      .eq("id", session.user.id);

    return true;
  } catch (err) {
    console.log(err.message);
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
    .maybeSingle()
    


  console.log(data);

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
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); //this makes sure we get the monday of that week
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); //this makes sure is sunday of the current week
  endOfWeek.setHours(23, 59, 59, 999);
  const { data, error } = await supabase
    .from("activity_log")
    .select("calories, date")
    .eq("user_id", userId)
    .gte("date", startOfWeek.toISOString().split("T")[0]) //set the range of dates to retrieve from
    .lte("date", endOfWeek.toISOString().split("T")[0]);

  const dailyTotals = {
    MON: 0,
    TUES: 0,
    WED: 0,
    THURS: 0,
    FRI: 0,
    SAT: 0,
    SUN: 0,
  };

  if (!data || data.length === 0) {
    return Object.entries(dailyTotals).map(([day, value]) => ({
      day,
      value,
    }));

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

//retrieve weekly step data for bar graph

export async function fetchWeeklySteps(userId) {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); //this makes sure we get the monday of that week
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); //this makes sure is sunday of the current week
  endOfWeek.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("step_log")
    .select("steps, date")
    .eq("user_id", userId)
    .gte("date", startOfWeek.toISOString().split("T")[0]) //set the range of dates to retrieve from
    .lte("date", endOfWeek.toISOString().split("T")[0]);

  const dailyTotals = {
    MON: 0,
    TUES: 0,
    WED: 0,
    THURS: 0,
    FRI: 0,
    SAT: 0,
    SUN: 0,
  };

  if (!data || data.length === 0) {
    return Object.entries(dailyTotals).map(([day, value]) => ({
      day,
      value,
    }));
  } //return dates if nth

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
      dailyTotals[key] += entry.steps;
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
      .eq("user_id", userId)
      .eq("date", new Date().toISOString().split("T")[0]); //this is yyyy-mm-dd format same as our table

    if (error) {
      console.log("Error fetching entries:", error);
      return;
    }

    let totalCalories = data.reduce((sum, entry) => sum + entry.calories, 0);

    //reset daily to 0 if no entries yet
    if (!totalCalories) {
      totalCalories = 0;
    }

    console.log("Today’s date:", new Date().toISOString().split("T")[0]);
    console.log("Queried entries:", data);

    const { error: updateError } = await supabase
      .from("profile_page")
      .update({ calories_consumed: totalCalories })
      .eq("id", userId);

    const { data: profileRow, error: fetchError } = await supabase
      .from("profile_page")
      .select("calorie_goal, calories_consumed")
      .eq("id", userId)
      .single();

    console.log("✅ Final profileRow:", profileRow);

    return profileRow;
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
    .in("id", [
      "bff1403f-7c39-4d09-ac07-4cc7b51019fe",
      "87c30106-bb4c-4796-a61a-6a1fd31be753",
    ]);

  const defaultDecorItemIds = [
    "bff1403f-7c39-4d09-ac07-4cc7b51019fe",
    "87c30106-bb4c-4796-a61a-6a1fd31be753",
  ];

  const decorInventoryEntries = defaultDecorItemIds.map((itemId) => ({
    user_id: userId,
    item_id: itemId,
    count: 5,
  }));

  console.log("mapped decor inventory entries");

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
    "8f0ad901-0c1c-4bbb-81e9-a9a87bc84b02",
  ];

  console.log("mapped accessory stuff");

  const { data: itemInfoDetail, error: itemInfoError } = await supabase
    .from("item")
    .select("id, name, slot, image_url, position")
    .in("id", defaultAccessoryItemIds);

  if (itemInfoError) {
    console.error("Error fetching item details:", itemError);
    return;
  }
  const accessoryInventoryEntries = itemInfoDetail.map((item) => {
    let positionPct = null;

    if (item.position) {
      positionPct = {
        topPct:
          typeof item.position.top === "number" ? item.position.top / 384 : 0,
        leftPct:
          typeof item.position.left === "number" ? item.position.left / 224 : 0,
        widthPct:
          typeof item.position.width === "number"
            ? item.position.width / 224
            : 0,
        heightPct:
          typeof item.position.height === "number"
            ? item.position.height / 384
            : 0,
      };
    }

    return {
      user_id: userId,
      item_id: item.id,
      item_name: item.name,
      slot: item.slot,
      image_url: item.image_url,
      position: positionPct,
    };
  });

  const { data: accessoryDataInsertion, error: accessoryDataInsertionError } =
    await supabase
      .from("accessory_inventory")
      .insert(accessoryInventoryEntries);

  if (accessoryDataInsertionError) {
    console.error(
      "Error inserting default accessory inventory items: " +
        accessoryDataInsertionError.message
    );
  }
  return true;
}

export async function addToAccessoryInventory(userId, itemId) {
  const { data: itemInfoDetail, error: itemInfoError } = await supabase
    .from("item")
    .select("id, name, slot, image_url, position")
    .eq("id", itemId)
    .single();

  let positionPct = null;

  if (itemInfoDetail.position) {
    positionPct = {
      topPct:
        typeof itemInfoDetail.position.top === "number"
          ? itemInfoDetail.position.top / 384
          : 0,
      leftPct:
        typeof itemInfoDetail.position.left === "number"
          ? itemInfoDetail.position.left / 224
          : 0,
      widthPct:
        typeof itemInfoDetail.position.width === "number"
          ? itemInfoDetail.position.width / 224
          : 0,
      heightPct:
        typeof itemInfoDetail.position.height === "number"
          ? itemInfoDetail.position.height / 384
          : 0,
    };
  }

  const { data: insertData, error: insertError } = await supabase
    .from("accessory_inventory")
    .insert({
      user_id: userId,
      item_id: itemInfoDetail.id,
      item_name: itemInfoDetail.name,
      slot: itemInfoDetail.slot,
      image_url: itemInfoDetail.image_url,
      position: positionPct,
    });

  if (insertError) {
    console.error(
      "Error inserting into accessory_inventory:",
      insertError.message
    );
    throw insertError;
  }

  return insertData;
}

export async function deductUserPoints(userId, pointsToBeDeducted) {
  const { data: getProfilePoints, error: getProfilePointsError } =
    await supabase
      .from("profile_page")
      .select("points")
      .eq("id", userId)
      .single();

  if (getProfilePointsError) {
    return { success: false, error: getProfilePointsError };
  }

  const userPointAmount = getProfilePoints.points;

  const { error: updateError } = await supabase
    .from("profile_page")
    .update({
      points: userPointAmount - pointsToBeDeducted,
    })
    .eq("id", userId);

  if (updateError) {
    return { success: false, error: updateError };
  }

  return { success: true };
}

export async function checkUserHasAccessory(userId, itemId) {
  const { data: checkItemData, error: checkItemDataError } = await supabase
    .from("accessory_inventory")
    .select("user_id, item_id")
    .eq("user_id", userId)
    .eq("item_id", itemId);

  if (checkItemDataError) {
    return { success: false, error: checkItemDataError };
  }

  if (!checkItemData || checkItemData.length === 0) {
    return { success: true, hasAccessory: false };
  } else {
    return { success: true, hasAccessory: true };
  }
}

export async function fetchAccessoryInventory(userId) {
  try {
    const { data, error } = await supabase
      .from("accessory_inventory")
      .select("item_id")
      .eq("user_id", userId);

    if (error) {
      console.log(error.message);
      return {
        success: false,
        error: error,
        accessories: [],
      };
    }

    console.log(
      "data from fetchinvrntory from fetchaccessoryinventory: " +
        JSON.stringify(data, null, 2)
    );

    return {
      success: true,
      accessories: data || [],
    };
  } catch (error) {
    console.log(error.message);
    return {
      success: false,
      error: error,
      accessories: [],
    };
  }
}

export async function addGoalPoints(userId) {
  const { data, error } = await supabase
    .from("profile_page")
    .select("points")
    .eq("id", userId)
    .single();

  const currentPoints = data.points;
  const updatedPoints = currentPoints + 200;

  const { error: updateError } = await supabase
    .from("profile_page")
    .update({
      points: updatedPoints,
    })
    .eq("id", userId);
}
