import { createContext, useContext, useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { Accelerometer } from "expo-sensors";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { dist } from "@shopify/react-native-skia";

const DistanceTrackingContext = createContext();

export const DistanceProvider = ({ children }) => {
  const [distance, setDistance] = useState(0);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [location, setLocation] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  const { session } = useAuth();
  const user = session?.user;
  //const distanceRef = useRef(0); // Using ref to avoid stale closures

  //to imporve accuracy i try use this to detect movement
  //now it wont increase when i not moving
  useEffect(() => {
    const accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
      const total = Math.sqrt(x * x + y * y + z * z);
      setIsMoving(total > 1);
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
          timeInterval: 1000, //updates location+distanceevery 5sec or 2m moved
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

          //this helps to filter out jitters in gps
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
      const steps = Math.round(distance / 0.75);
      const today = new Date().toISOString().split("T")[0];

      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("step_log").upsert(
        {
          user_id: user.id,
          steps: steps,
          date: today,
        },
        { onConflict: ["user_id", "date"] }
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [distance]);

  //this is to wrap it around children so we can track disatnce across all screens like we want
  return (
    <DistanceTrackingContext.Provider value={{ distance, location }}>
      {children}
    </DistanceTrackingContext.Provider>
  );
};

export const useDistance = () => useContext(DistanceTrackingContext);
