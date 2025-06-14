import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, Alert } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useDistance } from "../contexts/DistanceTrackingContext";
import haversineDistance from "haversine-distance";
import { useNavigation } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";

//to expand more markers i can create an array for markers and usestate to see which is selected then display that instead of creating multiple

export default function MapScreen() {
  const { location, distance } = useDistance();

  const mapRef = useRef(null);

  const navigation = useNavigation();

  const [loc1InRadius, setLoc1InRadius] = useState(false);

  //camera tracking

  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.003, //smaller value more zoomed in lmk if need change
          longitudeDelta: 0.003,
        },
        500 //how long it takes to change animation when moving rn its 0.5sec
      );
    }
  }, [location]);

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Getting location please wait...</Text>
      </View>
    );
  }

  //check for location 1

  const loc1Coords = { latitude: 1.350624, longitude: 103.749 };

  useEffect(() => {
    if (!location) return;

    const distanceToLoc1 = haversineDistance(location, loc1Coords);

    setLoc1InRadius(distanceToLoc1 < 50); // 50 meters radius
  }, [location]);

  return (
    //Since cannot use pedometer we use estimate to determine steps(0.75 is average stride)
    <View className="flex-1">
      <View className="z-10 top-10 left-5 bg-white items-center">
        <Text className="text-base font-bold text-black">
          Steps: {(distance / 0.75).toFixed(0)}
        </Text>
        <Text className="text-base font-bold text-black">
          Distance Travelled: {distance.toFixed(2)}
        </Text>
      </View>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }} //bruh need use default styling
        showsUserLocation={true}
        showsMyLocationButton={true}
        provider="google"
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Circle
          center={location}
          radius={50}
          strokeColor="rgba(0,0,255,0.5)"
          fillColor="rgba(0,0,255,0.2)"
        />
        {/*location 1*/}
        <Marker
          coordinate={loc1Coords}
          pinColor={loc1InRadius ? "green" : "red"}
          onPress={() => {
            if (loc1InRadius) {
              navigation.navigate("Location1");
            } else {
              Alert.alert("Too far please move closer to interact");
            }
          }}
        />
      </MapView>
    </View>
  );
}
