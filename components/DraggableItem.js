import { Animated, PanResponder, Image, UIManager, findNodeHandle } from 'react-native';
import React, { Component, useRef, useState } from 'react'

const DraggableItem = ({
    image,
    startX = 0,
    startY = 0, 
    onDragEnd,
    onDragMove
  }) => {
    const initialPosition = useRef({ x: startX, y: startY });

    const pan = useRef(new Animated.ValueXY(initialPosition.current)).current;

    const panResponder = useRef(
        PanResponder.create({
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
        
            onPanResponderMove: (evt, gestureState) => {
              const xDisplacement = gestureState.moveX
              const yDisplacement = gestureState.moveY 

              pan.setValue({ x: gestureState.dx, y: gestureState.dy });
              onDragMove?.({ x: xDisplacement, y: yDisplacement
               });
            },

            onPanResponderRelease: (evt, gestureState) => {
                const dropX = gestureState.moveX;
                const dropY = gestureState.moveY; 


                onDragEnd?.({dropX, dropY});
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
            <Image source={image}  className="w-20 h-20" />
        </Animated.View>

    )
}

export default DraggableItem