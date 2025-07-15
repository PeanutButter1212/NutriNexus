import { PanResponder, Animated, View, Text, Image } from 'react-native';
import { useRef, useState } from 'react';
const DraggableItem = ({
    item,
    itemInfo, 
    draggedItemData, 
    onDragStart, 
    onDragMove, 
    onDragEnd,
    size,
    className=''
}) => {
    
    const [isDraggingThis, setIsDraggingThis] = useState(false);
    const itemRef = useRef(null);
//currentItem menas item inside this inventory slot, not necesssarily the one being dragged rn 
    const currentItem = item;
// create draggable items which respond to user's touches 
//item is user item, iteminfo is the item bank version 
const panResponder = useRef(
    PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => {
            console.log("🔵 onStartShouldSetPanResponder");
            return true;
        }, 
        onStartShouldSetPanResponderCapture: (evt, gestureState) => {
            return true;
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            return true;
        }, 
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
            return true;
        }, 
        onPanResponderGrant: (evt, gestureState) => {
            
            itemRef.current?.measure((fx, fy, width, height, px, py) => {
                setIsDraggingThis(true);
                onDragStart( currentItem, { uri: itemInfo.image_url }, { x: px, y: py });
            });
        },
        onPanResponderMove: (evt, gestureState) => {
            const result = onDragMove?.({ x: gestureState.moveX, y: gestureState.moveY });
           
        },
        onPanResponderRelease: (evt, gestureState) => {
     
            const dropX = gestureState.moveX;
            const dropY = gestureState.moveY;

            const freshDragData = {
                image: { uri: itemInfo.image_url },
                itemData: currentItem 
            };


            onDragEnd?.({ dropX, dropY, dragData: freshDragData });
            setIsDraggingThis(false);
        },
        onPanResponderTerminate: (evt, gestureState) => {
            setIsDraggingThis(false);
        },
    })
).current;
          const isThisItemBeingDragged = draggedItemData && draggedItemData.itemData.item_id === currentItem.item_id;
        
          return (
            <View style={{ position: 'relative' }}>
            <View
                ref={itemRef}
                {...panResponder.panHandlers}
                style={{
                    opacity: isThisItemBeingDragged ? 0.3 : 1
                }}
                className={`${className}`}
            > 
                <Image
                    source={{ uri: itemInfo?.image_url }}
                    style={{ width: size, height: size }}
                />
            </View>

        </View>

          );
        
}; 

export default DraggableItem


             
        