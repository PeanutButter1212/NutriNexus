//service to obtain steps/distance from supabase which is linked to useActivityData hook and used in distancetrackjing context which then updates activitylog and profile page

import { supabase } from "../lib/supabase";

export async function activityService(session) {
  const userId = session?.user?.id;

  if (!userId) {
    console.warn("No USER ID HELP!");
    return null;
  }
  const { data, error } = await supabase
    .from("step_log")
    .select("steps, distance")
    .eq("user_id", userId)
    .single();

  console.log("📥 Data from Supabase:", data);

  if (error) {
    console.error("Error fetching data");
    return null;
  }

  return data;
}
