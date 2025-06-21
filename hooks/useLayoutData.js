import { useEffect, useState } from "react";
import { retrieveGardenLayout, fetchItemBank } from "../services/gardenService";
import { useAuth } from "../contexts/AuthContext";
import { getIsometricPosition } from "../utils/getIsometricPosition";
import useItemBank from "./useItemBank";

export default function useLayoutData() {
    const { session } = useAuth()
    const [userLayout, setUserLayout] = useState([]);
    const userId = session?.user?.id 
    const itemBank =  useItemBank() 

    

    useEffect(() => {
        async function fetchGardenLayout() {
            if (!userId || !itemBank || itemBank.length === 0) {
                console.log("❌ Early return - missing data:", { userId: !!userId, itemBank: !!itemBank, itemBankLength: itemBank?.length });
                return;
            }
            try {       
                if (!session?.user?.id || itemBank.length === 0) return;
                const layoutData = await retrieveGardenLayout(userId)
                console.log("layoutdata: " + JSON.stringify(layoutData, null, 2))
                console.log("itembank from uselayoutdata: " + itemBank)
              
                const mapped = layoutData.map(({ id, user_id, row, col, decor_id }) => {
                    const item = itemBank.find(decor => decor.id === decor_id)
                    const {x, y} = getIsometricPosition(row, col)
                    return {
                        item, 
                        x,
                        y,
                        row,
                        col
                    }
                })

                setUserLayout(mapped);
                console.log("mapped: " + mapped)
             
            

            } catch (err) {
                console.error(err);
            }
        }

            fetchGardenLayout()    
        
            
}, [session, itemBank]);

    return userLayout; 
}
