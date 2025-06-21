export const getIsometricPosition = (col, row) => {
    const alignmentX = (col - row) * (41 * 0.866); 
    const alignmentY = (col + row) * (41 * 0.5);
  
    return {
      x: 430 / 2 + alignmentX, 
      y: 932 * 0.25 + alignmentY 
    }
  
  }