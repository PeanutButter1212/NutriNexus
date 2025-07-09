// for marcus: this file encapsulates the logic of retrieving info from the ML model

import { supabase } from "../lib/supabase";

export async function predictFoodFromImage(photo) {
  const filename = photo.uri.split("/").pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  const formData = new FormData();
  formData.append("file", {
    uri: photo.uri,
    name: filename,
    type,
  });

  const response = await fetch(
    //render backend we used
    //"https://nutrinexus-image-backend.onrender.com/predict",
    //trying railway backend now
    "https://nutrinexus-image-backend-production.up.railway.app/predict",
    {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.ok) throw new Error("Error with Image Recognition");

  return await response.json();
}

export async function insertFoodEntry({ userId, food, calories }) {
  const { error } = await supabase.from("activity_log").insert([
    {
      food,
      calories: parseInt(calories),
      user_id: userId,
    },
  ]);
  return { error };
}

export async function fetchCaloriesByFood(food) {
  const { data, error } = await supabase
    .from("food")
    .select("calories")
    .eq("name", food)
    .single();

  //console.log("Supabase response:", { data, error });

  if (error) {
    console.error("Supabase error:", error.message);
  }

  return data.calories.toString();
}

//get food names from database
export async function fetchFoodSuggestions(input) {
  const { data, error } = await supabase
    .from("food")
    .select("name")
    .ilike("name", `%${input}%`)
    .limit(5); //for same name we set limit to 5 so nicer lol

  if (error) {
    console.error("Failed to fetch food", error.message);
    return [];
  }
  return data;
}
