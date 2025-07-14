import { supabase } from "../lib/supabase";
import { fetchPoints } from "../services/profileService";
export async function handleCheckboxes(userId, centreId, stallId) {
  console.log("handleCheckboxes:", { userId, centreId, stallId });

  const { data: stallVisitsInCentre, error } = await supabase
    .from("user_stall_visits")
    .select("*")
    .eq("user_id", userId)
    .eq("centre_id", centreId)
    .single();

  console.log("done with checking stalls visited by user in centre");

  if (error) {
    console.error("Error detching stall visits: ", error);
    return { success: false };
  }

  const alreadyVisited = stallVisitsInCentre.stall_ids.includes(stallId);

  console.log("alreadyVisited: " + alreadyVisited)

 
  if (!alreadyVisited) {
    const updatedStalls = [...stallVisitsInCentre.stall_ids, stallId];
    const { error: updateError } = await supabase
      .from("user_stall_visits")
      .update({ stall_ids: updatedStalls })
      .eq("id", stallVisitsInCentre.id);

    if (updateError) {
      console.error("Cannot update stall visits:", updateError);
      return { success: false };
    }

    const currentPoints = await fetchPoints(userId);

    const updatedPoints = currentPoints + 10;

    const { error: updatePointsError } = await supabase
      .from("profile_page")
      .update({
        points: updatedPoints,
      })
      .eq("id", userId);

    if (updatePointsError) {
      console.error("Failed to update", updateError);
      return { success: false };
    }

    return { success: true };
  }
  //if visited before
  else {
    return { success: false, alreadyClaimed: true };
  }
}

export async function fetchVisitedStalls(userId, centreId) {
  const { data, error } = await supabase
    .from("user_stall_visits")
    .select("stall_ids")
    .eq("user_id", userId)
    .eq("centre_id", centreId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching visited stalls:", error);
    return [];
  }

  return data?.stall_ids || [];
}