import { View, Text, Platform } from "react-native";
import React from "react";
import { AppleMaps, GoogleMaps } from "expo-maps";
import * as Location from "expo-location";
import { useState, useEffect, useRef } from "react";

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  //Requesting permissiom for users location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status != "granted") {
          console.error("Permission not granted");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        console.log("User location:", loc.coords);
        setLocation(loc.coords);
      } catch (err) {
        console.error("Error getting location", err);
      }
    })();
  }, []);

  if (!location) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <GoogleMaps.View
      initialCamera={{
        center: {
          latitude: 1.3521,
          longitude: 103.8198,
          //latitude: location.latitude,
          //longitude: location.longitude,
        },
        zoom: 16,
      }}
      style={{ flex: 1 }}
    />
  );
}
