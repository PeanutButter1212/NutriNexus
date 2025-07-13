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

export default function useProfileData() {
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

  useEffect(() => {
    const fetchProfileData = async () => {
      const profileInfo = await fetchProfileCalories(userId);
      const weeklyCalories = await fetchWeeklyCalories(userId);
      const userPoints = await fetchPoints(userId);
      const userInfo = await fetchUserInfo(userId);
      console.log("user info: " + JSON.stringify(userInfo, null, 2));
      const weeklySteps = await fetchWeeklySteps(userId);
      const profileUsername = await fetchUsername(userId);
      const visitedList = await fetchVisited(userId);

      setTotalCalories(profileInfo.calories_consumed);
      setCalorieGoal(profileInfo.calorie_goal);
      setCaloriesData(weeklyCalories);
      setPoints(userPoints);
      setUserDemographics(userInfo);
      setStepData(weeklySteps);
      setUsername(profileUsername);
      setVisited(visitedList || []);
      console.log("visitedList:", visitedList);
    };
    fetchProfileData();
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
    setTotalCalories,
    setCalorieGoal,
    setVisited,
  };
}
