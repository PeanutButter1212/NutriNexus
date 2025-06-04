//this file handles services related to profiles and profile_page table 
import { supabase } from "../lib/supabase"


export async function updateProfileDetails(session, profile, details) {
    const userId = session?.user?.id
    try {
        const {weight, height, age, calories, gender} = details;
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
      };
    
export async function fetchProfileCalories(userId) {
    const { data, error } = await supabase
    .from("profile_page")
    .select("calories_consumed, calorie_goal")
    .eq("id", userId)
    .single();

    return data; 
}

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
    return dailyTotals; 

  })

}

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
  };

  
  export async function fetchActivityLog(userId) {
    const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", session.user.id)
    .order("date", { ascending: false });

    if (error) {
        throw error;
    }
    return data


}
