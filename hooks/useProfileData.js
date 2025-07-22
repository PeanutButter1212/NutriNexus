import { useEffect, useState } from "react";
import {
  fetchPoints,
  fetchProfileCalories,
  fetchWeeklyCalories,
  fetchUserInfo,
  fetchWeeklySteps,
  fetchVisited,
} from "../services/profileService";
import { useAuth } from "../contexts/AuthContext";
import { fetchUsername } from "../services/profileService";
import { fetchProfilePicture } from "../services/publicDetailsService";

export default function useProfileData() {
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const [totalCalories, setTotalCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(100);
  const [caloriesData, setCaloriesData] = useState([]);
  const [stepsData, setStepData] = useState([]);
  const [points, setPoints] = useState(0);
  const [userDemographics, setUserDemographics] = useState({});
  const [username, setUsername] = useState("");
  const userId = session?.user?.id;
  const [visited, setVisited] = useState([]);
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        const profileInfo = await fetchProfileCalories(userId);
        const weeklyCalories = await fetchWeeklyCalories(userId);
        const userPoints = await fetchPoints(userId);
        const userInfo = await fetchUserInfo(userId);
        //console.log("user info: " + JSON.stringify(userInfo, null, 2));
        const weeklySteps = await fetchWeeklySteps(userId);
        const profileUsername = await fetchUsername(userId);
        const visitedList = await fetchVisited(userId);
        console.log("fetching profile pic efvjergjerugjre4oj");
        const pictureUrl = await fetchProfilePicture(userId);

        setTotalCalories(profileInfo.calories_consumed);
        setCalorieGoal(profileInfo.calorie_goal);
        setCaloriesData(weeklyCalories);
        setPoints(userPoints);
        setUserDemographics(userInfo);
        setStepData(weeklySteps);
        setUsername(profileUsername);
        setVisited(visitedList || []);
        setProfilePic(pictureUrl);
      } catch (e) {
        console.error("Failed to load profile data:", e);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfileData();
  }, [session]);

  return {
    totalCalories,
    calorieGoal,
    caloriesData,
    points,
    userDemographics,
    stepsData,
    username,
    visited,
    profilePic,
    setTotalCalories,
    setCalorieGoal,
    setVisited,
  };
}
