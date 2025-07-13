//this is a edge fucntion so that I can add points if users stick within calorie goal

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";


serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  

  const {data:users,error} = await supabase.from("profile_page").select("*");
  if (error) return new Response("Failed");

  const todayDate = new Date().toISOString().split("T")[0];
 

  //obtain info of users

  for (const user of users){
    const userId = user.id;
    const calorieLimit = user.calorie_goal;
    const currentPoints = user.points;
  const caloriesConsumed = user.calories_consumed;

  //stay withing goal add points
  if (caloriesConsumed <= calorieLimit) {
    await supabase
      .from("profile_page")
      .update({ points: currentPoints + 200 })
      .eq("id", userId);
  }
  }

   return new Response("Daily points awarded!", { status: 200 });


});