// hooks/useShovelInteraction.js
import { useCallback } from 'react';
import { fetchDecorIdOnTile, removeFromGarden, addtoDecorInventory } from '../services/gardenService';
import { getClosestTile, isTileOccupied } from "../utils/tileUtils.js"; 
export default function useShovelInteraction({
  session,
  placedPlantsRef,
  setPlacedPlants,
  setLocalInventory, 
  setHoverTile,
  setIsDraggingShovel,
  setRenderTrigger,
  setShowPlantTiles,
  floatingDragRef,
  draggedItemRef,
  gridView
}) {
    const handleShovelStart = useCallback((itemData, image, startPosition) => {
        const dragData = { 
          image, 
          itemData 
      };
          setIsDraggingShovel(true);
          const floatingItem = {
              ...dragData,
              x: startPosition.x,
              y: startPosition.y,
              itemInfo:  { image_url: image.uri }
          };
          floatingDragRef.current = floatingItem;
          draggedItemRef.current = dragData;
          setRenderTrigger(prev => prev + 1);
          return;
      },  [setIsDraggingShovel, setRenderTrigger]
    
    )
    
      const handleShovelMove = useCallback(({ x, y }) => {
        setShowPlantTiles(true)
        setHoverTile(getClosestTile(x, y, gridView))
        if (floatingDragRef.current) {
          floatingDragRef.current = {
              ...floatingDragRef.current,
              x: x - 40,
              y: y - 40
          };
          setRenderTrigger(prev => prev + 1);
      }
    
      } , [setShowPlantTiles, setHoverTile, setRenderTrigger])
    
      const handleShovelEnd = useCallback(async ({ dropX, dropY, dragData }) => {
        const tile = getClosestTile(dropX, dropY, gridView)
        if (tile && isTileOccupied(tile.col, tile.row, placedPlantsRef)) {
          const retrievePlantResult = await fetchDecorIdOnTile(session.user.id, tile.col, tile.row) 
          if (retrievePlantResult.error) {
            console.log("Error retrieving decor id for tile: " + retrievePlantResult.error)
          }
    
          const decor_id = retrievePlantResult.item_id
    
  
    
          const deletionResult = await removeFromGarden(session.user.id, tile.col, tile.row)
          if (deletionResult.error) {
            console.log("Deletion Error: " + deletionResult.error)
          }
    
  
          const inventoryReturnResult = await addtoDecorInventory(session.user.id, decor_id)
    
          if (inventoryReturnResult.error) {
            console.log("Error returning plant to inventory: " + JSON.stringify(inventoryReturnResult.error, null, 2))
          }
    
          setPlacedPlants(prev => 
            prev.filter(
            item => !(item.row == tile.row && item.col == tile.col) 
          ));
    
          setLocalInventory(prev => {
            const itemExists = prev.find(item => item.item_id === decor_id)
            if (itemExists) {
              return prev.map(item =>
                    item.item_id === decor_id
                    ? {...item, count: item.count + 1}
                    : item
                )
            } else {
              return ([...prev, { item_id: decor_id, count: 1 }])
            }})
    
        }
    
        setIsDraggingShovel(false)
        setHoverTile(null)
        floatingDragRef.current = null;  
        draggedItemRef.current = null;   
        setRenderTrigger(prev => prev + 1 )
        setShowPlantTiles(false)
      }, [session, getClosestTile, setPlacedPlants, setRenderTrigger, setIsDraggingShovel, setShowPlantTiles])

      return {
        handleShovelStart,
        handleShovelMove,
        handleShovelEnd
      };
    

}