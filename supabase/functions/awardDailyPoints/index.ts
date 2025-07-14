//this is a edge fucntion so that I can add points if users stick within calorie goal

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { useAuth } from "../../../contexts/AuthContext";

const {session} = useAuth();

const userId = session?.user?.id;


serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  

  
  const todayDate = new Date().toISOString().split("T")[0];

  const { data: users, error } = await supabase.from("profile_page").select("*");
  if (error) return new Response("Failed to fetch users", { status: 500 });

  for (const user of users) {
    const userId = user.id;
    const calorieLimit = user.calorie_goal;
    const caloriesConsumed = user.calories_consumed;
    const currentPoints = user.points;

    let pointsToAdd = 0;

    //check steps if more than 10k
    const { data: stepData, error: stepError } = await supabase
      .from("step_log")
      .select("steps")
      .eq("user_id", userId)
      .eq("date", todayDate)
      .single();

    if (!stepError && stepData?.steps >= 10000) {
      pointsToAdd += 200;
    }

    // check claoires if within goal
    if (caloriesConsumed <= calorieLimit) {
      pointsToAdd += 200;
    }

    // add points if satisfy either one
    if (pointsToAdd > 0) {
      await supabase
        .from("profile_page")
        .update({ points: currentPoints + pointsToAdd })
        .eq("id", userId);
    }
  }

  return new Response("Daily points awarded!", { status: 200 });
});