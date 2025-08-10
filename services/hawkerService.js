import { supabase } from "../lib/supabase";

export async function retrieveCoords() {
  const { data, error } = await supabase.from("hawker_centre").select("*");

  if (error) {

    return [];
  }

  return data;
}
