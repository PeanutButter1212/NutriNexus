//created a context to allow distance tracking across all screens

import { createContext, useContext, useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { Accelerometer } from "expo-sensors";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import useStepsData from "../hooks/useActivityData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateCaloriesBurnt } from "../services/activityService";
import useProfileData from "../hooks/useProfileData";
import {
  estimateStepCount,
  estimateCaloriesBurnt,
} from "../utils/calorieBurnt";

const DistanceTrackingContext = createContext();

export const DistanceProvider = ({ children }) => {
  const { session } = useAuth();
  const [distance, setDistance] = useState(0);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [location, setLocation] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [initialized, setInitialized] = useState(false); //make sure tabel not updated with 0
  const distanceRef = useRef(0);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const { userDemographics, loading: profileLoading } = useProfileData();
  //console.log(userDemographics);

  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  const isDemographicsReady =
    userDemographics &&
    userDemographics.height &&
    userDemographics.gender &&
    userDemographics.weight;

  //obtain diatnce and steps from supbase
  const { distance: fetchedDistance, loading } = useStepsData(session);

  useEffect(() => {
    if (!loading && typeof fetchedDistance === "number") {
      setDistance(fetchedDistance);
      distanceRef.current = fetchedDistance;
      console.log("Loaded distance from Supabase:", fetchedDistance);
      setInitialized(true);
    }
  }, [loading, fetchedDistance]);

  //to imporve accuracy try use this to detect movement
  //now it wont increase when not moving
  useEffect(() => {
    const accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
      const total = Math.sqrt(x * x + y * y + z * z);
      setIsMoving(total > 1); //this the sensitivity to determine if phone is shaking
    });

    Accelerometer.setUpdateInterval(1000);

    return () => {
      accelSubscription.remove();
    };
  }, []);

  useEffect(() => {
    let subscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status != "granted") {
        console.warn("Location permission not granted");
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, //balance(use wifi for indoors) or high(use GPS only) or BestForNaviagtion
          timeInterval: 1000, //updates location+distanceevery sec or 2m moved
          distanceInterval: 2,
        },
        (loc) => {
          const newLocation = { ...loc.coords, timestamp: Date.now() };
          //console.log("New location:", newLocation);
          setLocation(newLocation);
          /*console.log({
            acc: loc.coords.accuracy,
            prev: previousLocation,
            new: loc.coords,
            isMoving,
          }); */

          if (newLocation.accuracy > 10) return;

          if (!previousLocation) {
            setPreviousLocation({ ...newLocation, timestamp: Date.now() });
            return;
          }

          if (!isMoving) return;

          const distanceTravelled = haversine(previousLocation, newLocation);
          const timeElapsed = (Date.now() - previousLocation.timestamp) / 1000;
          const speed = distanceTravelled / timeElapsed;

          const MIN_WALKING_SPEED = 0.01;
          const MAX_WALKING_SPEED = 5;

          //this helps to filter out jitters/teleporting thingy in gps
          const isValidMovement =
            distanceTravelled > 1 &&
            distanceTravelled < 15 &&
            speed > MIN_WALKING_SPEED &&
            speed < MAX_WALKING_SPEED &&
            newLocation.accuracy < 15 &&
            previousLocation.accuracy < 15;

          if (isValidMovement) {
            setDistance((prev) => prev + distanceTravelled);
            setPreviousLocation(newLocation);
          }
        }
      );
    };

    startTracking();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [isMoving, previousLocation]);

  //update supabase table with steps for users each time they enter app + every 10 sec(best way possible)
  useEffect(() => {
    if (!initialized || profileLoading || !isDemographicsReady) {
      if (!isDemographicsReady) {
        console.log("Waiting for demographics data:", userDemographics);
      }
      return;
    }

    const interval = setInterval(async () => {
      // await checkNewDay();

      const currentDistance = distanceRef.current;
      //console.log("📏 distanceRef.current is", currentDistance);
      if (currentDistance === 0) return;

      if (
        !userDemographics ||
        !userDemographics.height ||
        !userDemographics.gender ||
        !userDemographics.weight
      ) {
        console.warn(
          "Demographics missing, skipping calculation:",
          userDemographics
        );
        return;
      }

      const steps = estimateStepCount(
        currentDistance,
        userDemographics.height,
        userDemographics.gender
      );
      const today = new Date().toLocaleDateString("en-CA");

      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        console.warn("No user found", error);
        return;
      }

      const { data: existingEntry, error: queryError } = await supabase
        .from("step_log")
        .select()
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (queryError && queryError.code !== "PGRST116") {
        console.error("Error fetching step log:", queryError);
        return;
      }

      //update when new day/distance goes up an creates new row each day
      if (
        !existingEntry ||
        (currentDistance > 0 && currentDistance > existingEntry.distance)
      ) {
        /*console.log("Attempting to upsert:", {
          user_id: user.id,
          steps,
          date: today,
          distance: currentDistance,
        }); */

        await supabase.from("step_log").upsert(
          {
            user_id: user.id,
            steps: steps,
            date: today,
            distance: currentDistance,
          },
          { onConflict: ["user_id", "date"] }
        );
        console.log("📤 Attempting to upsert step_log with:", {
          user_id: user.id,
          steps,
          date: today,
          distance: currentDistance,
        });

        const weightKg = userDemographics.weight;
        const burnt = estimateCaloriesBurnt(steps, weightKg);
        await updateCaloriesBurnt(user.id, burnt);
        console.log("🔥 Calories burnt updated:", burnt);
      }
    }, 10000); //update supabase every 10 sec

    return () => clearInterval(interval);
  }, [initialized]);

  //this is to wrap it around children so we can track disatnce across all screens like we want
  return (
    <DistanceTrackingContext.Provider value={{ distance, location }}>
      {children}
    </DistanceTrackingContext.Provider>
  );
};

export const useDistance = () => useContext(DistanceTrackingContext);
