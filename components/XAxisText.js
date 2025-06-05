import { View } from 'react-native'
import React from 'react'
import { Text, useFont } from '@shopify/react-native-skia';

const XAxisText = ({x, y, text}) => {
    const font = useFont(require('../assets/Roboto-SemiBold.ttf'));
    if (!font) {
        return null;
      }
    const fontSize = font.measureText(text);
    return <Text x={x - fontSize.width /2 } y={y} font={font} text={text} color={'#111111'}/> 
}

export default XAxisText;