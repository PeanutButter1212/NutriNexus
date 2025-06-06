import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let subscriber;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission not granted");
        return;
      }

      subscriber = await Location.watchPositionAsync(
        //rn its updating the position either every 1 sec or when move 1m
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          const coords = loc.coords;
          setLocation(coords);

          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.005, //smaller value more zoomed in lmk if need change
                longitudeDelta: 0.005,
              },
              500 //how long it takes to change animation when moving rn its 0.5sec
            );
          }
        }
      );
    })();

    return () => {
      if (subscriber) subscriber.remove();
    };
  }, []);

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Getting location please wait...</Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }} //bruh need use default styling
      showsUserLocation={true}
      showsMyLocationButton={true}
      provider="google"
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Circle
        center={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        radius={50}
        strokeColor="rgba(0,0,255,0.5)"
        fillColor="rgba(0,0,255,0.2)"
      />
    </MapView>
  );
}

/*<Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="You are here"
      />
      */
