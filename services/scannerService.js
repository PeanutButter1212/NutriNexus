// for marcus: this file encapsulates the logic of retrieving info from the ML model 

import { supabase } from "../lib/supabase";

export async function predictFoodFromImage(uri) {
    const filename = takenPhoto.uri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    
    const formData = new FormData();
    formData.append("file", {
        uri,
        name: filename,
        type,
      });

    const response = await fetch(
        //render backend we used
        "https://nutrinexus-image-backend.onrender.com/predict",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if(!response.ok) throw new Error("Error with Image Recognition")

      return await response.json(); 
}

export async function insertFoodEntry(userId) {
  const { error } = await supabase.from("activity_log").insert([
    {
      food,
      calories: parseInt(calories),
      user_id: userId 
    },
  ]);
  return {error};

}
export async function fetchCaloriesForFood(food) {
  const {data, error } = await supabase
    .from("food")
    .select("calories")
    .eq("name", food)
    .single()

    return {data, error}
}