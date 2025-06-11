//try to implement logic from backend here 
/*
1. draggable
2. inventory logic done
*/

import { View, Text, Image, Dimensions, ImageBackground, ScrollView, UIManager, Pressable, findNodeHandle, TouchableWithoutFeedback} from 'react-native';
import React,  { useRef, useState, useEffect } from 'react'
import gardenImage from '../assets/garden/garden.png'
import durianImage from '../assets/garden/plants/durian.png'
import bougainvillaImage from '../assets/garden/plants/bougainvilla.png'
import woodenBackground from '../assets/backgrounds/inventoryBackground.png'
import { useImage, Canvas, Path, Skia, Image as SkiaImage } from "@shopify/react-native-skia";
import { getCustomFonts } from '../utils/loadFonts'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import InventoryColumn from '../components/InventoryColumn'
import DraggableItem from '../components/DraggableItem'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height; 

const IMAGE_WIDTH = 56;
const IMAGE_HEIGHT = 64;

const DIAMOND_SIZE = 36; 
const SPACING = 41; 
const xStartOfGarden = SCREEN_WIDTH / 2 
const yStartOfGarden = 0.25 * SCREEN_HEIGHT; 


const getIsometricPosition = (col, row) => {
  const alignmentX = (col - row) * (SPACING * 0.866); 
  const alignmentY = (col + row) * (SPACING * 0.5);

  return {
    x: xStartOfGarden + alignmentX, 
    y: yStartOfGarden + alignmentY 

  }

}

const diamondView = (centerX, centerY, size) => {
  const diamondPen = Skia.Path.Make() 

  const radius = size/2 
  const top = {x: centerX, y: centerY - radius }
  const right = {x: centerX + size, y: centerY}
  const left = {x: centerX - size, y: centerY}
  const bottom = {x: centerX, y: centerY + radius }

  diamondPen.moveTo(top.x, top.y)
  diamondPen.lineTo(right.x, right.y)
  diamondPen.lineTo(bottom.x, bottom.y)
  diamondPen.lineTo(left.x, left.y)
  diamondPen.close() 

  return diamondPen; 



};





export default function GardenScreen() {

  const durian = useImage(bougainvillaImage); 
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemData, setDraggedItemData] = useState(null);


  const tileArray = () => {
    const views = []; 

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const {x, y} = getIsometricPosition(col, row)
        const path = diamondView(x, y, DIAMOND_SIZE)
         views.push({
          path,
          col,
          row,
          x,
          y,

        })
      }

    }

    return views; 
  };

  const gridView = tileArray(); 
  const durianSlotRef = useRef();


  const handlePressIn = () => {
      durianSlotRef.current?.measure((fx, fy, width, height, px, py) => {
        setDraggedItemData({
          startX: px,
          startY: py,
          image: durianImage,
        });
        setIsDragging(true);
      });
    };
    
  const handleDragStart = () => {
    if (!durianSlotRef.current) return;
  
    durianSlotRef.current.measureInWindow((x, y, width, height) => {
      setDraggedItemData({
        image: durianImage,
        x: x + width / 2,
        y: y + height / 2,
      });
      setIsDragging(true);
    });
  };
  

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItemData(null);
  };
  

  return (
    <View className="flex-1 relative flex-col">
      <View style={{ height: '65%', width: '100%' }}>
        <Image 
        source={gardenImage} 
        style={{
          width: '100%',
          height: '100%',
        }}
        resizeMode="stretch"
        /> 
       </View>

       <Canvas
       style={{
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
       }}
       > 
        {gridView.map(({ path, col, row, x, y }, index) => (
    
           /*{
           {durian && col === 2 && row === 2 && (
           
             <SkiaImage
               key={`image-${col}-${row}`}
               image={durian}
               x={x - IMAGE_WIDTH / 2}
               y={y - IMAGE_HEIGHT*0.75}
               width={IMAGE_WIDTH}
               height={IMAGE_HEIGHT}
               fit="contain"
             />
            }
           ) }*/
          <Path
            key={`tile-${col}-${row}`}
            path={path}
            style="fill"
            color="rgba(255, 100, 100, 0.4)"
            strokeWidth={1.5}
            strokeColor="#ff6666"
          />
        ))}



       </Canvas>

       



 
        <ImageBackground
        source={woodenBackground}
        resizeMode="cover"
        className="flex-1">
      
        <Text style=
        {{ fontFamily: 'pixel-font',
          letterSpacing: 3
        }} 
        className="text-yellow-300 text-center pb-0 p-5 text-2xl">  
          INVENTORY

        </Text>

        <SafeAreaProvider> 
          <SafeAreaView>
          <ScrollView className="flex-row flex-wrap m-4" horizontal scrollEnabled={!isDragging}>
              <InventoryColumn
                topItem={{
                  count: 5,
                  children: (
                    <Pressable onPressIn={handlePressIn} ref={durianSlotRef}>
                      <Image source={durianImage} style={{ width: 80, height: 80 }} />
                    </Pressable>
                  ),
                  slotRef: durianSlotRef,
                }}
                bottomItem={{
                  count: 3,
                  children: <Image source={require("../assets/garden/plants/bougainvilla.png")} className="w-20 h-20" />,
                }}
              />
              <InventoryColumn topItem={{ count: 4 }} />
            </ScrollView>
              
              

    
          </SafeAreaView>

        </SafeAreaProvider>
        

         


        </ImageBackground>

        {isDragging && draggedItemData && (
        <DraggableItem
          image={draggedItemData.image}
          startX={draggedItemData.startX}
          startY={draggedItemData.startY}
          onDragEnd={handleDragEnd}
        />
            )}


      


    </View>

  )
}