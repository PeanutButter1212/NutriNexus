import { Animated, PanResponder, Image, UIManager, findNodeHandle } from 'react-native';
import React, { Component, useRef, useState } from 'react'

const DraggableItem = ({
    image,
    startX = 0,
    startY = 0, 
    onDragEnd
  }) => {
    const initialPosition = useRef({ x: startX, y: startY });

    const pan = useRef(new Animated.ValueXY(initialPosition.current)).current;



    const panResponder = useRef(
        PanResponder.create({
            //these 4 just set to true according to documentation 
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) =>
                true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
                true,
            onPanResponderGrant: () => {
                pan.setOffset({ x: startX, y: startY }); 
                pan.setValue({ x: 0, y: 0 });           
              },
        
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
              ),

            onPanResponderRelease: () => {
                onDragEnd?.();
                pan.setValue(initialPosition.current);
              },
            })
          ).current;
        

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={{
                position: 'absolute',
                transform: pan.getTranslateTransform(),
              }}
            >
            <Image source={image} style={{ width: 80, height: 80 }}/>
        </Animated.View>

    )
}

export default DraggableItem