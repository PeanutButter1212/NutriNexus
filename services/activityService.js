//service to obtain steps/distance from supabase which is linked to useActivityData hook and used in distancetrackjing context which then updates activitylog and profile page

import { supabase } from "../lib/supabase";

export async function activityService(session) {
  const userId = session?.user?.id;
  const today = new Date().toLocaleDateString("en-CA");

  if (!userId) {
    console.warn("No USER ID HELP!");
    return null;
  }
  const { data, error } = await supabase
    .from("step_log")
    .select("steps, distance, calories_burnt")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();



  if (error) {
    console.error("Error fetching data");
    return null;
  }

  return data;
}

//to include calories burnt in total calories
export async function updateCaloriesBurnt(userId, caloriesBurnt) {
  const today = new Date().toLocaleDateString("en-CA");
  const { error } = await supabase
    .from("step_log")
    .update({ calories_burnt: caloriesBurnt })
    .eq("user_id", userId)
    .eq("date", today);

  if (error) {
    console.error("Error updating calories_burnt:", error);
    throw error;
  }


  return true;
}
