import { useEffect, useState } from "react";
import { fetchProfileCalories, fetchWeeklyCalories } from "../services/profileService";
import { useAuth } from "../contexts/AuthContext";

export default function useProfileData() {
    const { session } = useAuth() 
    const [totalCalories, setTotalCalories] = useState(0);
    const [calorieGoal, setCalorieGoal] = useState(100);
    const [caloriesData, setCaloriesData] = useState([]);
    const userId = session?.user?.id;

    //if (!userId) return;
    useEffect(() => {
        const fetchProfileData = async () => {
            const profileInfo = await fetchProfileCalories(userId)
            const weeklyCalories = await fetchWeeklyCalories(userId)
            setTotalCalories(profileInfo.calories_consumed)
            setCalorieGoal(profileInfo.calorie_goal)
            setCaloriesData(weeklyCalories)

        };
        fetchProfileData(); 
    },

    [session]);

    return { totalCalories, calorieGoal, caloriesData };
}

