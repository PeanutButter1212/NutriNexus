import { useCallback,  useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { retrieveDecorInventory } from "../services/gardenService";
import { useAuth } from "../contexts/AuthContext";
export default function useDecorInventory() {
    const { session } = useAuth()
    const [decorInventory, setDecorInventory] = useState([]);
    const userId = session?.user?.id 

    const fetchDecorInventory = useCallback(async() =>  {
        if (!userId) return;
        try {
            const data = await retrieveDecorInventory(userId)
            setDecorInventory(data)
        } catch (err) {
            console.error(err)
        }
    }, [userId])

    useFocusEffect(
        useCallback(() => {
          fetchDecorInventory();
        }, [fetchDecorInventory])
      );
    

    return decorInventory; 
}
