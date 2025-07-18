import { supabase } from "../lib/supabase";

//same idea as scanner list to fetch list of users when searching to add friend (query database each input)
export async function searchUsers(query) {
  const { data, error } = await supabase
    .from("username")
    .select("user_id, username, profile_pic_url")
    .ilike("username", `%${query}%`)
    .limit(10);

  if (error) {
    console.log("Error", error);
    return [];
  }

  const fallbackUrl =
    "https://rkrdnsnujizdskzbdwlp.supabase.co/storage/v1/object/public/profile-pictures//Green_Background.png"
    
  return data.map((entry) => ({
    ...entry,
    profile_pic_url: entry.profile_pic_url || fallbackUrl,
  }));
}

//method to add friend
export async function sendFriendRequest(senderId, receiverId) {
  const { data, error } = await supabase.from("friendships").insert({
    user_id: senderId,
    friend_id: receiverId,
    status: "pending",
  });

  if (error) {
    console.log("Error sending friend request", error);
    return false;
  }
  return true;
}

//method to accept friend request
export async function acceptFriendRequest(senderId, receiverId) {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .match({ user_id: senderId, friend_id: receiverId });

  if (error) {
    console.log("Error accepting friend request", error);
    return false;
  }
  return true;
}

//method to fetch all incoming requests to display
export async function fetchIncomingFriendRequests(currentId) {
  const { data, error } = await supabase
    .from("friendships")
    .select("user_id")
    .eq("friend_id", currentId)
    .eq("status", "pending");

  if (error) {
    console.log("Error fetching requests", error);
    return [];
  }

  return data;
}

//retrieve usernames based on ID for display
export async function fetchUsernameByIds(userIds) {
  if (!userIds || userIds.length === 0) return [];
  const { data, error } = await supabase
    .from("username")
    .select("*")
    .in("user_id", userIds);

  if (error) {
    console.error("Error fetching usernames:", error);
    return [];
  }
  const fallbackUrl =
    "https://rkrdnsnujizdskzbdwlp.supabase.co/storage/v1/object/public/profile-pictures//Green_Background.png"

  return data.map((entry) => ({
    ...entry,
    profile_pic_url: entry.profile_pic_url || fallbackUrl,
  }));
}

//method to fetch all friends
export async function fetchApprovedRequests(currentId) {
  const { data, error } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .or(`user_id.eq.${currentId},friend_id.eq.${currentId}`) // check if either user is the friend or if current
    .eq("status", "accepted");

  if (error) {
    console.log("Error fetching requests", error);
    return [];
  }

  return data;
}

//delete friend request in the friendrequestscreen
export async function deleteFriendRequest(senderId, receiverId) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .match({ user_id: senderId, friend_id: receiverId, status: "pending" });

  if (error) {
    console.log("error", error);
    return false;
  }
  return true;
}

//method to fetch status of friends for useEffect on addfreindscreen
export async function getFriendStatus(currentId, targetUserId) {
  if (currentId === targetUserId) return "self";

  const { data, error } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(user_id.eq.${currentId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentId})`
    );
  //checks if connected from both combinations of ids since either way is friends

  if (error) {
    console.error("Error fetching friend status:", error);
    return null;
  }

  return data?.[0]?.status || null; //returns an array [ { status: "accepted" } ] sth like that
}

//fetch number of visited marker for friendprofilescreen
export async function fetchNumberVisited(userId) {
  const { data, error } = await supabase
    .from("profile_page")
    .select("visited")
    .eq("id", userId);

  if (error) {
    console.error("Error fetching visited:", error);
    return 0;
  }

  const visited = data?.[0]?.visited ?? [];
  return visited.length;
}
//fetch number of friends for friendprofilescreen
export async function fetchNumberofFriends(userId) {
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (error) {
    console.error("Error fetching friends:", error);
    return 0;
  }
  return data.length;
}

//remove friend after accepting in friendprofilescreen
export async function removeFriend(userA, userB) {
  const { error } = await supabase.from("friendships").delete().or(
    `and(user_id.eq.${userA},friend_id.eq.${userB},status.eq.accepted),and(user_id.eq.${userB},friend_id.eq.${userA},status.eq.accepted)` //once again need check both ways
  );

  if (error) {
    console.log("error", error);
    return false;
  }
  return true;
}
