import {StyleSheet, View, useWindowDimensions} from "react-native"
import React from 'react'
import {SharedValue, useDerivedValue} from 'react-native-reanimated'
import { useFont, Canvas, Text } from "@shopify/react-native-skia"

const AnimatedText = ( {selectedValue} ) => {
    const font = useFont(require('../assets/Roboto-SemiBold.ttf'), 55);
    const { width } = useWindowDimensions();
    const animatedText = useDerivedValue(() => {
        return `${Math.round(selectedValue.value)}`
    })

    const textWidth = useDerivedValue(() => {
        if (!font) return 0;
        return font.measureText(animatedText.value).width;
    })

    const centeredX = useDerivedValue(() => {
        return (width - textWidth.value) / 2;
    })


    if (!font) {
        return <View /> 
    }

    const fontSize = font.measureText('0') 
    return (
        <Canvas style={{height: fontSize.height + 30}}>
            <Text 
                font={font} 
                text={animatedText} 
                color={'#111111'} 
                y={fontSize.height + 20 }
                x={centeredX}
            /> 
        </Canvas>

    )
}

export default AnimatedText 

const styles = StyleSheet.create({})