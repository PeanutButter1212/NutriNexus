import { createContext, useContext, useEffect, useState } from "react";
import { Pedometer } from "expo-sensors";

const StepTrackingContext = createContext();

export const StepProvider = ({ children }) => {
  //use children so that we can wrap app around it since we wanna track steps in all screens
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    console.log("Step context initialized");
    let subscription;

    const startTracking = async () => {
      const available = await Pedometer.isAvailableAsync();
      console.log("Pedometer available:", available);

      if (!available) {
        console.warn("Pedometer not available");
        return;
      }

      console.log("Subscribing to watchStepCount...");

      subscription = Pedometer.watchStepCount((result) => {
        console.log("Step update:", result.steps);
        setSteps(result.steps);
      });

      console.log("Subscribed to watchStepCount");
    };

    startTracking();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);
  //runs when app loads to starts tracking once user is in which is wat we wan?

  //since we wan steps to be accessible in profile and maps we make the children able to access
  return (
    <StepTrackingContext.Provider value={{ steps }}>
      {children}
    </StepTrackingContext.Provider>
  );
};

export const useStep = () => useContext(StepTrackingContext);
