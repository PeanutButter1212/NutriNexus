import { supabase } from "../lib/supabase";

export async function retrieveCoords() {
  const { data, error } = await supabase
    .from("hawker_centre")
    .select("longitude ,latitude, id");

  if (error) {
    console.log("Error", error);
    return [];
  }

  return data;
}
