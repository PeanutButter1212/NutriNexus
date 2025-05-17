import "../../global.css";
import { StatusBar } from "expo-status-bar";
import {  StyleSheet,  Text,  ScrollView,  View,  TextInput,  TouchableOpacity,} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
<<<<<<< Updated upstream
=======
import { LinearGradient } from "expo-linear-gradient";
import CircularProgress from 'react-native-circular-progress-indicator';
import {Canvas, Group} from '@shopify/react-native-skia';
import * as d3 from 'd3'; 
import BarPath from '../components/BarPath'
import XAxisText from "../components/XAxisText";
import DropdownComponent from "../components/Dropper";
>>>>>>> Stashed changes

export default function Profile({ route, navigation }) {    
     const { session, profile, authMethod } = route.params; 
    
     const { logout } = useAuth();

<<<<<<< Updated upstream
=======
     const { width } = useWindowDimensions();

     const [selectedDataType, setSelectedDataType] = useState('Steps'); 


      const weeklyStepsData = [
        { day: "MON", value: 3000 },
        { day: "TUES", value: 5500 },
        { day: "WED", value: 10000 },
        { day: "THURS", value: 8000 },
        { day: "FRI", value: 9000 },
        { day: "SAT", value: 4000 },
        { day: "SUN", value: 3500 },
      ];
      const weeklyCaloriesData = [
        { day: "MON", value: 10000 },
        { day: "TUES", value: 3500 },
        { day: "WED", value: 1300 },
        { day: "THURS", value: 8000 },
        { day: "FRI", value: 4030 },
        { day: "SAT", value: 3700 },
        { day: "SUN", value: 8640 },
      ];

      const [referenceData, setReferenceData] = useState(weeklyStepsData);




    useEffect(() => {
        if (selectedDataType === 'Steps') {
          setReferenceData(weeklyStepsData);
        } else {
          setReferenceData(weeklyCaloriesData);
        }
      }, [selectedDataType]);
 
     const canvasWidth = width;
     const canvasHeight = 350; 

     const graphWidth = width;
     const graphMargin = 20; 
     const graphHeight = canvasHeight - graphMargin; 

     const xRange = [0, graphWidth]; 
     const xDomain = referenceData.map((dataPoint) => dataPoint.day); 

     const x = d3.scalePoint().domain(xDomain).range(xRange).padding(1); 

     const yRange = [0, graphHeight];

     const yDomain = [0, d3.max(referenceData, ( (yDataPoint) => yDataPoint.value))];

     const y = d3.scaleLinear().domain(yDomain).range(yRange);

     const barWidth = 35;

>>>>>>> Stashed changes
     const handleLogout = () => {
          logout(authMethod, navigation);
      };


     

     
     return (   
     <View className="items-center justify-start bg-white-500 pt-32 px-6 flex-1">      
     <Text className="text-3xl font-bold text-green-600" 
          style= {{textAlign: "center"}} >
        Welcome Back, {profile ? profile.username : "User"}!
      </Text>

      <TouchableOpacity 
      onPress = {handleLogout}
      className="flex-row items-center justify-center w-full bg-red-500 rounded-xl mt-6 py-3">
        <Text className="text-white text-base font-medium">
          Log Out
        </Text>
      </TouchableOpacity>

      </View> 
      
     
     );}
