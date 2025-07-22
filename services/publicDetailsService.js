import { supabase } from "../lib/supabase";

export async function fetchProfilePicture(userId) {

    console.log("fetchProfilePic called")
    const { data, error } = await supabase
      .from("username")
      .select("profile_pic_url")
      .eq("user_id", userId)
      .single();

    console.log("profile pic info takeh4htyrhrhdfhgftrrthrthrhrrthrtn")
  
    if (error) {
      console.error("Error fetching profile for", userId, error);
      return null;
    }
  
    return data.profile_pic_url || "https://rkrdnsnujizdskzbdwlp.supabase.co/storage/v1/object/public/profile-pictures//Green_Background.png"
  }

  