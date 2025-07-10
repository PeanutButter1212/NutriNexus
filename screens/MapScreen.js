import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, Alert, Image } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useDistance } from "../contexts/DistanceTrackingContext";
import haversineDistance from "haversine-distance";
import { useNavigation } from "@react-navigation/native";
import useProfileData from "../hooks/useProfileData";
import useCoordsdata from "../hooks/useCoords";
import { handleFirstVisit } from "../services/profileService";
import { useAuth } from "../contexts/AuthContext";

//to expand more markers i can create an array for markers and usestate to see which is selected then display that instead of creating multiple

export default function MapScreen() {
  const { location, distance } = useDistance();

  const mapRef = useRef(null);

  const navigation = useNavigation();

  //const [loc1InRadius, setLoc1InRadius] = useState(false);

  const { visited, setVisited } = useProfileData();

  const { coords, loading } = useCoordsdata();

  const { session } = useAuth();
  const userId = session?.user?.id;

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

  //console.log("Supabase coords:", coords);

  //check for location 1

  //const loc1Coords = { latitude: 1.350624, longitude: 103.749 };

  return (
    //Since cannot use pedometer we use estimate to determine steps(0.75 is average stride)
    <View className="flex-1">
      <View className="z-10 top-10 left-0 right-0 mx-auto w-72 max-w-ws bg-white items-center rounded-xl">
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

        {coords
          .filter(
            (locationrow) =>
              locationrow.latitude !== null &&
              locationrow.latitude !== undefined &&
              locationrow.longitude !== null &&
              locationrow.longitude !== undefined
          )
          .map((locationrow, index) => {
            //console.log("coord.id:", coord.id);
            //console.log("visited array:", visited);
            const distanceToMarker = haversineDistance(locationrow, {
              latitude: locationrow.latitude,
              longitude: locationrow.longitude,
            });

            const inRadius = distanceToMarker < 50;
            const isVisited = visited.includes(locationrow.id);

            return (
              <Marker
                key={`${index}-${locationrow.latitude}-${locationrow.longitude}`} //need use key to force it cause rn it only changes when refreshed and make it unique also
                coordinate={{
                  latitude: locationrow.latitude,
                  longitude: locationrow.longitude,
                }}
                onPress={() => {
                  if (inRadius) {
                    handleFirstVisit(userId, locationrow.id).then(() => {
                      setVisited((prev) => [...prev, locationrow.id]);
                    });
                    navigation.navigate("Location Details", { locationrow });
                  } else {
                    Alert.alert("Too far please move closer to interact");
                  }
                }}
              >
                {
                  <Image
                    source={
                      isVisited
                        ? require("../assets/GreyHawkerIcon.png")
                        : inRadius
                        ? require("../assets/GreenHawkerIcon.png")
                        : require("../assets/RedHawkerIcon.png")
                    }
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                }
              </Marker>
            );
          })}
      </MapView>
    </View>
  );
}
