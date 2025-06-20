import { PanResponder, Animated, View, Text, Image } from 'react-native';
import { useRef, useState } from 'react';
const DraggableItem = ({
    item,
    itemInfo, 
    index, 
    draggedItemData, 
    onDragStart, 
    onDragMove, 
    onDragEnd
}) => {
    
    const [isDraggingThis, setIsDraggingThis] = useState(false);
    const itemRef = useRef(null);

// create draggable items which respond to user's touches 
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
                onDragStart(item.item_id, index, { uri: itemInfo.image_url }, { x: px, y: py });
            });
        },
        onPanResponderMove: (evt, gestureState) => {
      

            const result = onDragMove?.({ x: gestureState.moveX, y: gestureState.moveY });
           
        },
        onPanResponderRelease: (evt, gestureState) => {
     
            const dropX = gestureState.moveX;
            const dropY = gestureState.moveY;

            const freshDragData = {
                plantId: item.item_id,
                image: { uri: itemInfo.image_url },
                index: index
            };

            onDragEnd?.({ dropX, dropY, dragData: freshDragData });
            setIsDraggingThis(false);
        },
        onPanResponderTerminate: (evt, gestureState) => {
 
            setIsDraggingThis(false);
        },
    })
).current;
          const isThisItemBeingDragged = draggedItemData && draggedItemData.index === index;
        
          return (
            <View style={{ position: 'relative' }}>
            <View
                ref={itemRef}
                {...panResponder.panHandlers}
                style={{
                    opacity: isThisItemBeingDragged ? 0.3 : 1
                }}
            > 
                <Image
                    source={{ uri: itemInfo?.image_url }}
                    style={{ width: 80, height: 80 }}
                />
            </View>

        </View>

          );
        
}; 

export default DraggableItem


             
        