import { useEffect, useState } from "react";
import {
  fetchPoints,
  fetchProfileCalories,
  fetchVisited1,
  fetchWeeklyCalories,
  fetchClaimedCheckboxes,
  fetchUserInfo,
  fetchWeeklySteps,
} from "../services/profileService";
import { useAuth } from "../contexts/AuthContext";

export default function useProfileData() {
  const { session } = useAuth();
  const [totalCalories, setTotalCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(100);
  const [caloriesData, setCaloriesData] = useState([]);
  const [stepsData, setStepData] = useState([]);
  const [points, setPoints] = useState(0);
  const [checkBoxes, setCheckBoxes] = useState([]);
  const [userDemographics, setUserDemographics] = useState({});
  const userId = session?.user?.id;
  const [visited, setVisited] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const profileInfo = await fetchProfileCalories(userId);
      const weeklyCalories = await fetchWeeklyCalories(userId);
      const userPoints = await fetchPoints(userId);
      const userInfo = await fetchUserInfo(userId);
      const weeklySteps = await fetchWeeklySteps(userId);
      const visitedList = await fetchVisited(userId);

      setTotalCalories(profileInfo.calories_consumed);
      setCalorieGoal(profileInfo.calorie_goal);
      setCaloriesData(weeklyCalories);
      setPoints(userPoints);
      setCheckBoxes(claimed);
      setUserDemographics(userInfo);
      setStepData(weeklySteps);
      setVisited(visitedList);
    };
    fetchProfileData();
  }, [session]);

  return {
    totalCalories,
    calorieGoal,
    caloriesData,
    points,
    visited,
    userDemographics,
    stepsData,
    setTotalCalories,
    setCalorieGoal,
  };
}
