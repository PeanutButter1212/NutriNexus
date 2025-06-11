//created a context to allow distance tracking across all screens

import { createContext, useContext, useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { Accelerometer } from "expo-sensors";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import useStepsData from "../hooks/useActivityData";

const DistanceTrackingContext = createContext();

export const DistanceProvider = ({ children }) => {
  const { session } = useAuth();
  const { steps, distance: initialDistance, loading } = useStepsData(session);
  const [distance, setDistance] = useState(0);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [location, setLocation] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const hasInitialized = useRef(false); //make sure tabel not updated with 0
  const distanceRef = useRef(0);

  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  const user = session?.user;

  //obtain from supabase svaed values so when user logs in will see past values
  useEffect(() => {
    if (!hasInitialized.current && !loading) {
      setDistance(initialDistance);
      hasInitialized.current = true;
    }
  }, [initialDistance, loading]);

  //to imporve accuracy i try use this to detect movement
  //now it wont increase when i not moving
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

  //update supabase table with steps for users each time they enter app(best way possible)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!hasInitialized.current) return;

      const currentDistance = distanceRef.current;
      console.log("📏 distanceRef.current is", currentDistance);
      if (currentDistance === 0) return;

      const steps = Math.round(currentDistance / 0.75);
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        console.warn("No user found", error);
        return;
      }

      console.log("Uploading to Supabase", {
        currentDistance,
        steps: Math.round(currentDistance / 0.75),
      });

      await supabase.from("step_log").upsert(
        {
          id: user.id,
          steps: steps,
          date: today,
          distance: currentDistance,
        },
        { onConflict: ["id", "date"] }
      );
    }, 10000); //update supabase every 10 sec

    return () => clearInterval(interval);
  }, []);

  //this is to wrap it around children so we can track disatnce across all screens like we want
  return (
    <DistanceTrackingContext.Provider value={{ distance, location }}>
      {children}
    </DistanceTrackingContext.Provider>
  );
};

export const useDistance = () => useContext(DistanceTrackingContext);
