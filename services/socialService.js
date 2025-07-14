import { supabase } from "../lib/supabase";

//same idea as scanner list to fetch list of users when searching to add friend (query database each input)
export async function searchUsers(query) {
  const { data, error } = await supabase
    .from("username")
    .select("user_id,username")
    .ilike("username", `%${query}%`)
    .limit(10);

  if (error) {
    console.log("Error", error);
    return [];
  }

  return data;
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
    .select("username, user_id")
    .in("user_id", userIds);

  if (error) {
    console.error("Error fetching usernames:", error);
    return [];
  }
  console.log("Fetched usernames from DB:", data);
  return data;
}

//method to fetch all friends
export async function fetchApprovedRequests(currentId) {
  const { data, error } = await supabase
    .from("friendships")
    .select("user_id")
    .eq(currentId)
    .eq("status", "approved");

  if (error) {
    console.log("Error fetching requests", error);
    return [];
  }

  return data;
}
