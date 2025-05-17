import "../../global.css";
import { StatusBar } from "expo-status-bar";
import {  StyleSheet,  Text,  ScrollView,  View,  TextInput,  TouchableOpacity, Image, useWindowDimensions} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import CircularProgress from 'react-native-circular-progress-indicator';
import {Canvas, Group} from '@shopify/react-native-skia';
import * as d3 from 'd3'; 
import BarPath from '../components/BarPath'
import XAxisText from "../components/XAxisText";
import DropdownComponent from "../components/Dropdown";

export default function Profile({ route, navigation }) {    
     const { session, profile, authMethod } = route.params; 
    
     const { logout } = useAuth();

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

     const handleLogout = () => {
          logout(authMethod, navigation);
      };
     
     

     
     return (
      <View className="flex-1 bg-white">
        <LinearGradient 
          colors={["#2E8B57", "#90EE90", "#006400"]}
          style={{
            width: "100%",
            height: "40%", 
            flexDirection: "column", 
            padding: 30
          }}>
         
          <Text className="text-3xl font-bold text-white mt-6 mb-8" 
            style= {{textAlign: "center"}} >
            Welcome Back, {profile ? profile.username : "User"}!
            </Text>
          <View className = "flex-row items-center"> 
          <View style={{ flex: 0.9, paddingRight: 10 }} className = "flex-1"> 

          <View className="mb-6"> 
          <CircularProgress
          value={35}
          valueSuffix={'%'}
          radius={50}
          progressValueColor={'blue'}
          titleFontSize={16}
          titleColor={'#333'}
          titleStyle={{ fontWeight: 'bold' }}
          activeStrokeColor={'#2465FD'}
          activeStrokeSecondaryColor={'#C3305D'}
          inActiveStrokeColor={'white'}
/>
    </View>
  {/* settings button */}
  <TouchableOpacity
  className = "bg-blue-700 mb-5 rounded-md"
  > 
  <Text className = "text-center text-white py-3 w-auto font-bold">Settings</Text>
  </TouchableOpacity>


  {/* change character button */}
  <TouchableOpacity
  className = "bg-blue-700 w-auto rounded-md"
  > 
  <Text className = "text-center text-white py-3 font-bold">
  Change Character
   </Text>
  </TouchableOpacity>

  </View>

  {/* image */}
  <View className="flex-1 items-center justify-center px-5"> 
  <Image source={require("../../assets/Avatar.png")} className="justify-center mb-4" />
  </View>

  <View  style = {{ flex: 0.9, paddingLeft: 10}} className = "flex-column flex-1">

    <View
   
      className="bg-violet-700 rounded-md py-2 mb-7"
    
    > 
    <Text className="text-white text-center text-sm">Points </Text>
    <Text className="text-white text-center text-xl">2496</Text>
    </View>

    <View
      className="bg-violet-700 rounded-md py-2 mb-7"
    
    > 
    <Text className="text-white text-center text-sm">Steps </Text>
    <Text className="text-white text-center text-xl">8973</Text>
    </View>


    <View
      
      className="bg-violet-700 rounded-md py-2"
    
    > 
    <Text className="text-white text-center text-sm">Calories Burnt </Text>
    <Text className="text-white text-center text-xl">322</Text>
    </View>



  </View>

  </View>
          

        
          </LinearGradient> 
     
      <View>
      <View className="bg-white py-5 px-4 flex-row justify-between items-center">
      <Text className="text-xl font-bold"> Statistics</Text>
      <View style={{ width: "40%" }}>
      <DropdownComponent 
      value={selectedDataType}
      onChange={setSelectedDataType}
      />
    </View>
      </View>
      
        <Canvas 
        style = {{
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: 'white'
        }}
        >
          {
            referenceData.map( (dataPoint, index) => (
              <Group key={index}>
                <BarPath 
                x={x(dataPoint.day)} 
                y={y(dataPoint.value)} 
                barWidth={barWidth}
                graphHeight={graphHeight}
                /> 
                <XAxisText
                x={x(dataPoint.day)}
                y={canvasHeight}  
                text={dataPoint.day}
                />
              </Group>
            )
          )}


        </Canvas>

      </View>
      <View className="flex-row justify-center">
      <TouchableOpacity 
      onPress = {handleLogout}
      className="items-center justify-center bg-red-500 w-3/4 rounded-xl mt-6 py-3 mt-3">
        <Text className="text-white text-base font-medium">
          Log Out
        </Text>
      </TouchableOpacity>
      </View>
    
      </View>


     );
     /*
     (   
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
      
     
     );
  */
    }
     
