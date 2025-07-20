import { View, Text } from 'react-native'
import React from 'react'
import { useDerivedValue, withTiming } from 'react-native-reanimated'
import { Skia, Path } from '@shopify/react-native-skia';

const BarPath = ({x, y, barWidth, graphHeight, progress, label, selectedBar}) => {

    const color = useDerivedValue(() => {
        if (selectedBar.value === label) {
            return withTiming('#39FF14')
        } else if (selectedBar.value == null) {
            return withTiming("#00ffbf")
        } else {
            return withTiming("#d1d0c5")
        }
    } )
    const path = useDerivedValue(() => {
        const barPath = Skia.Path.Make(); 

        barPath.addRRect({
            rect: {
                x: x - barWidth/2,
                y: graphHeight,
                width: barWidth,
                height: y * -1 * progress.value, 


            },
            rx: 10,
            ry: 10, 
        });

        return barPath; 
    });
    return <Path path={path} color={color} />; 
  };

  export default BarPath; 