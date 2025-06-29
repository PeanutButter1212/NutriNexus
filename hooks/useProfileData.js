import { useEffect, useState } from "react";
import {
  fetchPoints,
  fetchProfileCalories,
  fetchVisited1,
  fetchWeeklyCalories,
  fetchClaimedCheckboxes,
  fetchUserInfo
} from "../services/profileService";
import { useAuth } from "../contexts/AuthContext";

export default function useProfileData() {
  const { session } = useAuth();
  const [totalCalories, setTotalCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(100);
  const [caloriesData, setCaloriesData] = useState([]);
  const [points, setPoints] = useState(0);
  const [visited1, setVisited] = useState(false);
  const [checkBoxes, setCheckBoxes] = useState([]);
  const [userDemographics, setUserDemographics] = useState({})
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      const profileInfo = await fetchProfileCalories(userId);
      const weeklyCalories = await fetchWeeklyCalories(userId);
      const userPoints = await fetchPoints(userId);
      const check1 = await fetchVisited1(userId);
      const claimed = await fetchClaimedCheckboxes(userId);
      const userInfo = await fetchUserInfo(userId);


     
      setTotalCalories(profileInfo.calories_consumed);
      setCalorieGoal(profileInfo.calorie_goal);
      setCaloriesData(weeklyCalories);
      setPoints(userPoints);
      setVisited(check1);
      setCheckBoxes(claimed);
      setUserDemographics(userInfo);
    };
    fetchProfileData();
  }, [session]);

  return {
    totalCalories,
    calorieGoal,
    caloriesData,
    points,
    visited1,
    checkBoxes,
    userDemographics
  };
}
