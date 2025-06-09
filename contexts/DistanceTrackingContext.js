import { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { Accelerometer } from "expo-sensors";

const DistanceTrackingContext = createContext();

export const DistanceProvider = ({ children }) => {
  const [distance, setDistance] = useState(0);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [location, setLocation] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  //to imporve accuracy i try use this to detect movement
  //now it wont increase when i not moving
  useEffect(() => {
    const accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
      const total = Math.sqrt(x * x + y * y + z * z);
      setIsMoving(total > 1.25);
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
          accuracy: Location.Accuracy.BestForNavigation, //balance(use wifi for indoors) or high(use GPS only) or BestForNaviagtion
          timeInterval: 1000, //updates location+distanceevery 5sec or 2m moved
          distanceInterval: 2,
        },
        (loc) => {
          const newLocation = { ...loc.coords, timestamp: Date.now() };
          //console.log("New location:", newLocation);
          setLocation(newLocation);

          if (newLocation.accuracy > 10) return;

          if (!previousLocation) {
            setPreviousLocation(newLocation);

            return;
          }

          if (!isMoving) return;

          const distanceTravelled = haversine(previousLocation, newLocation);
          const timeElapsed = (now - previousLocation.timestamp) / 1000;
          const speed = distanceTravelled / timeElapsed;

          const MIN_WALKING_SPEED = 0.2;
          const MAX_WALKING_SPEED = 2.5;

          //this helps to filter out jitters in gps
          const isValidMovement =
            distanceTravelled > 0.1 &&
            distanceTravelled < 3 &&
            speed > MIN_WALKING_SPEED &&
            speed < MAX_WALKING_SPEED &&
            newLocation.accuracy < 8 &&
            previousLocation.accuracy < 8;

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

  //this is to wrap it around children so we can track disatnce across all screens like we want
  return (
    <DistanceTrackingContext.Provider value={{ distance, location }}>
      {children}
    </DistanceTrackingContext.Provider>
  );
};

export const useDistance = () => useContext(DistanceTrackingContext);
