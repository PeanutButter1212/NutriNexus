//this hook to retrieve steps/distance from supabase

import { useState, useEffect } from "react";
import { activityService } from "../services/activityService";

export default function useStepsData(session) {
  const [stepData, setStepData] = useState({
    steps: 0,
    distance: 0,
    calories_burnt: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await activityService(session);
      if (data) setStepData(data);
      setLoading(false);
    };

    if (session) load();
  }, [session]);
  return { ...stepData, loading };
}
