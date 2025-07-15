// run through gridview array, on any location help us determine which tile of the garden the location is closest to, if nearest tile
// is less than DIAMOND_SIZE (which is arbitarily set to 36) then set this tile as tile and continue, otherwise tile is null 
export function getClosestTile( screenX, screenY, gridView ) {
    const relativeX = screenX
    const relativeY = screenY 

    const DIAMOND_SIZE = 36 

    let min_dist = Infinity;
    let tile = null;

    for (let i = 0; i < gridView.length; i++) {
      const xDisplacement = gridView[i].x - relativeX;
      const yDisplacement = gridView[i].y - relativeY; 
      const dist = Math.sqrt(xDisplacement * xDisplacement + yDisplacement * yDisplacement)

      if (dist <= DIAMOND_SIZE && dist < min_dist) {
        tile = gridView[i]
        min_dist = dist

      }
    }

    return tile; 
  }

export function isTileOccupied(col, row, placedPlants) {
    return placedPlants.current.some(decor => decor.row === row && decor.col === col);
  };
