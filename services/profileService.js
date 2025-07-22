//this file handles services related to profiles and profile_page table
import { supabase } from "../lib/supabase";
import { gatherAccessoryNetWorth } from "./avatarService";
import { gatherDecorNetWorth } from "./gardenService";

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
    console.log(err.message);
    return false;
  }
}

export async function fetchUserInfo(userId) {
  const { data, error } = await supabase
    .from("profile_page")
    .select("weight, height, age, gender")
    .eq("id", userId)
    .maybeSingle();

  //console.log("fetchUserInfo called with: " + userId);
  //console.log("data: " + JSON.stringify(data, null, 2));

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
    .maybeSingle();

  console.log(data);

  if (error) {
    console.error("fetchProfileCalories error", error);
    throw error;
  }

  return data;
}

export async function fetchUsername(userId) {
  const { data, error } = await supabase
    .from("username")
    .select("username")
    .eq("user_id", userId)
    .single();

  if (error) {
    return;
  }

  return data.username;
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

export async function fetchVisited(userId) {
  console.log("userId passed to fetchPoints:", userId);
  const { data, error } = await supabase
    .from("profile_page")
    .select("visited")
    .eq("id", userId)
    .single();

  if (error) {
    console.error(error);
    return [];
  }

  return data?.visited ?? []; //extract the array without visited header
}

//add to array if already visited

export async function handleFirstVisit(userId, placeId) {
  console.log("handlefirstvisit called");
  const { data, error } = await supabase
    .from("profile_page")
    .select("visited, points")
    .eq("id", userId)
    .single();

  console.log("handlefirstivist check for visit: " + data);

  const currentVisited = data?.visited || [];
  const currentPoints = data?.points || 0;

  const alreadyVisited = currentVisited.includes(placeId);

  if (alreadyVisited) {
    return;
  }

  //add to the array once we visit new loc
  const updatedVisited = currentVisited.includes(placeId)
    ? currentVisited
    : [...currentVisited, placeId];

  const { error: updateError } = await supabase
    .from("profile_page")
    .update({
      points: currentPoints + 200,
      visited: updatedVisited,
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Failed to update points or visited1:", updateError);
    return;
  }

  const { data: insertData, error: insertError } = await supabase
    .from("user_stall_visits")
    .insert([
      {
        user_id: userId,
        centre_id: placeId,
        stall_ids: [],
      },
    ]);

  if (insertError) {
    console.error("Insert failed:", insertError);
  } else {
    console.log("Inserted row:", insertData);
  }
}

//retrieve weekly calorie data for bar graph

export async function fetchWeeklyCalories(userId) {
  const now = new Date();

  const day = now.getDay(); //return 0/1/2 0 = Sunday

  // Get Monday of the current week
  const monday = new Date(now);
  if (day === 0) {
    //if today Sunday go back 6 days
    monday.setDate(now.getDate() - 6);
  } else {
    //other day back to monday
    monday.setDate(now.getDate() - (day - 1));
  }
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("activity_log")
    .select("calories, date")
    .eq("user_id", userId)
    .gte("date", monday.toLocaleDateString("en-CA"))
    .lte("date", sunday.toLocaleDateString("en-CA"));

  const dailyTotals = {
    //instead of 0 we use null which solves issue of fake graphs when value is 0
    MON: null,
    TUES: null,
    WED: null,
    THURS: null,
    FRI: null,
    SAT: null,
    SUN: null,
  };

  if (data && data.length > 0) {
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
        dailyTotals[key] = (dailyTotals[key] || 0) + entry.calories;
      }
    });
  }

  const output = Object.entries(dailyTotals).map(([day, value]) => ({
    day,
    value,
  }));

  return output; //this makes it into graph data format
}

//retrieve weekly step data for bar graph

export async function fetchWeeklySteps(userId) {
  const now = new Date();

  const day = now.getDay(); //return 0/1/2 0 = Sunday

  // Get Monday of the current week
  const monday = new Date(now);
  if (day === 0) {
    //if today Sunday go back 6 days
    monday.setDate(now.getDate() - 6);
  } else {
    //other day back to monday
    monday.setDate(now.getDate() - (day - 1));
  }
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  //console.log("Week range:", monday.toISOString(), "→", sunday.toISOString());

  const { data, error } = await supabase
    .from("step_log")
    .select("steps, date")
    .eq("user_id", userId)
    .gte("date", monday.toLocaleDateString("en-CA")) //bruh the error was cause toISo gives time zone is US which is 1 day different causing sunday to show as start of week but now toLocale works
    .lte("date", sunday.toLocaleDateString("en-CA"));

  const dailyTotals = {
    MON: null,
    TUES: null,
    WED: null,
    THURS: null,
    FRI: null,
    SAT: null,
    SUN: null,
  };

  if (data && data.length > 0) {
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
        dailyTotals[key] = (dailyTotals[key] || 0) + entry.steps;
      }
    });
  }

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

    console.log("Final profileRow:", profileRow);

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

export async function updateUsername(userId, username) {
  const oldUsername = await fetchUsername(userId);

  if (username === oldUsername) {
    throw new Error("This is your current username :D");
  }

  const { data: existingUser, error: checkError } = await supabase
    .from("username")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existingUser) {
    throw new Error("This username is taken, choose another one!");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", userId);

  const { error: updateProfileError } = await supabase
    .from("profile_page")
    .update({ username })
    .eq("id", userId);

  const { error: updateExtendedProfileError } = await supabase
    .from("username")
    .update({ username })
    .eq("user_id", userId);

  return true;
}

export const uploadProfileImage = async (userId, uri) => {
  try {
    console.log("=== UPLOAD FUNCTION START ===");
    console.log("userId:", userId);
    console.log("uri:", uri);

    if (!uri) {
      throw new Error("No URI provided to uploadProfileImage");
    }

    const timestamp = Date.now();
    const fileName = `${userId}_avatar_${timestamp}.jpg`;
    const filePath = `public/${fileName}`;

    const file = {
      uri: uri,
      type: "image/jpeg",
      name: fileName,
    };

    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Storage error:", error);
      throw error;
    }

    console.log("Storage upload successful:", data);

    const { data: urlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(filePath);

    console.log("Public URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error("uploadProfileImage error:", err);
    throw err;
  }
};

export async function retrieveTotalEarnedPoints(userId) {
  console.log("retrieving decorPoints");
  const decorPoints = await gatherDecorNetWorth(userId);
  console.log("decorPoints: " + decorPoints);

  console.log("retrieving accessoryPoints");
  const accessoryPoints = await gatherAccessoryNetWorth(userId);
  console.log("accessoryPoints: " + accessoryPoints);

  console.log("retrieving current points");
  const currentPoints = await fetchPoints(userId);
  console.log("currentPoints: " + currentPoints);

  const totalPoints = decorPoints + accessoryPoints + currentPoints;
  return totalPoints;
}
