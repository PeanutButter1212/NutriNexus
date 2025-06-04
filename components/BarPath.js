import { View, Text } from 'react-native'
import React from 'react'
import { useDerivedValue } from 'react-native-reanimated'
import { Skia, Path } from '@shopify/react-native-skia';

const BarPath = ({x, y, barWidth, graphHeight}) => {
    const path = useDerivedValue(() => {
        const barPath = Skia.Path.Make(); 

        barPath.addRRect({
            rect: {
                x: x - barWidth/2,
                y: graphHeight,
                width: barWidth,
                height: y * -1, 

            },
            rx: 10,
            ry: 10, 
        });

        return barPath; 
    });
    return <Path path={path} color={'#00ffbf'} />; 
  };

  export default BarPath; 