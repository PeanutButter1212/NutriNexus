import { useCallback } from "react"
import { getClosestTile, isTileOccupied } from "../utils/tileUtils.js"; 
import { insertToGarden, handleAssetConsumption } from '../services/gardenService';
import { useAuth } from "../contexts/AuthContext"


export default function useItemInteraction({
    placedPlantsRef,
    setHoverTile,
    setPlacedPlants,
    setLocalInventory,
    setRenderTrigger, 
    floatingDragRef,
    draggedItemRef,
    itemBank,
    gridView
}) {

    const { session } = useAuth()
    const handleDragStart = useCallback((itemData, image, startPosition) => {
   
        const dragData = { 
          image, 
          itemData //contains id , user item 
        };
        const itemInfo = itemBank?.find(item => item.id === plantId);
        
        const floatingItem = {
            ...dragData,
            x: startPosition.x,
            y: startPosition.y,
            itemInfo: itemInfo || { image_url: image.uri }
        };
        
        floatingDragRef.current = floatingItem;
        draggedItemRef.current = dragData;
        setRenderTrigger(prev => prev + 1);
        
    },  [setRenderTrigger, floatingDragRef] );
    
    
    
        
    //during movement of the drag, we use getClosestTile to determine which tile the location is closest to, that tile will be set
    //to hovering state and displays a white translucent overlay 
    const handleDragMove = useCallback(({ x, y }) => {
      
      setHoverTile(getClosestTile(x, y, gridView));
      
      if (floatingDragRef.current) {
          floatingDragRef.current = {
              ...floatingDragRef.current,
              x: x - 40,
              y: y - 40
          };
          setRenderTrigger(prev => prev + 1);
      }
    }, [setHoverTile, setRenderTrigger, floatingDragRef] );
    
    //upon end of drag motion of draggable item, if the point at which the drag end is near the tile, getClosestTile will return 
    //the nearest tile and we will add this items to the placedplants array so that the item (plant) will be added to the garden 
    const handleDragEnd = useCallback(async ( { dropX, dropY, dragData }) => {
    
        const tile = getClosestTile(dropX, dropY, gridView)
        
      
        const currentDragData = dragData 

        const plantId = currentDragData?.itemData.item_id 
    
        if (tile && plantId) {
          if (isTileOccupied(tile.col, tile.row, placedPlantsRef)) {
            setHoverTile(null);
            floatingDragRef.current = null;
            draggedItemRef.current = null;
            setRenderTrigger(prev => prev + 1);
          
            return;
          }
        
          const item = itemBank.find(decor => decor.id === plantId)
    
          if (!item) {
            console.log("Item not found")
          }
    
          
          const consumeResult = await handleAssetConsumption(session.user.id, plantId)
          if (consumeResult.error) {
            console.error("Consumption Error: " + consumeResult.error)
          }
          
          const insertionResult = await insertToGarden(session.user.id, tile.row, tile.col, plantId)
          if (insertionResult.error) {
            console.error("Insertion Error: " + insertionResult.error)
          }
    
          setPlacedPlants(prev => [
            ...prev,
            {
              item: item,
              row: tile.row,
              col: tile.col, 
            },
          ]);
    
    
          setLocalInventory(prev => 
            prev 
            .map(
              item =>
                item.item_id === plantId 
                ? {...item, count: item.count - 1}
                : item
            )
            .filter(item => item.count > 0)
        
          )
    
          
        } else {
          console.log("failed in placing plants")
        }
    
        setHoverTile(null);
        floatingDragRef.current = null;  
        draggedItemRef.current = null;   
        setRenderTrigger(prev => prev + 1);
       
    
      }, [
        draggedItemRef,
        floatingDragRef,
        setPlacedPlants,
        setLocalInventory,
        setHoverTile,
        itemBank,
        setRenderTrigger,
        placedPlantsRef, 
        session.user.id
      ] );

      return { 
        handleDragStart,
        handleDragMove,
        handleDragEnd 
      }
      



}
