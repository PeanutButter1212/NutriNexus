import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { useDistance } from "../contexts/DistanceTrackingContext";

export default function MapScreen() {
  const { location, distance } = useDistance();

  const mapRef = useRef(null);

  //camera tracking

  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005, //smaller value more zoomed in lmk if need change
          longitudeDelta: 0.005,
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
          latitudeDelta: 0.0055,
          longitudeDelta: 0.005,
        }}
      >
        <Circle
          center={location}
          radius={50}
          strokeColor="rgba(0,0,255,0.5)"
          fillColor="rgba(0,0,255,0.2)"
        />
      </MapView>
    </View>
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
