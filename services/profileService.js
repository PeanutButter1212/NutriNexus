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
    return false;
  }
}

//retrieve calorie info

export async function fetchProfileCalories(userId) {
  const { data, error } = await supabase
    .from("profile_page")
    .select("calories_consumed, calorie_goal")
    .eq("id", userId)
    .single();

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

  if (data.length === 0) {
    setCaloriesData([]);
    setReferenceData([]);
    return;
  }

  const dailyTotals = {
    MON: 0,
    TUES: 0,
    WED: 0,
    THURS: 0,
    FRI: 0,
    SAT: 0,
    SUN: 0,
  };

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
