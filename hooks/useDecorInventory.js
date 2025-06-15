import { useEffect, useState } from "react";
import { retrieveDecorInventory } from "../services/gardenService";
import { useAuth } from "../contexts/AuthContext";
export default function useDecorInventory() {
    const { session } = useAuth()
    const [decorInventory, setDecorInventory] = useState([]);
    const userId = session?.user?.id 


    if (!userId) return;

    useEffect(() => {
        async function fetchDecorInventory() {
            try {
                const data = await retrieveDecorInventory(userId)
                setDecorInventory(data)
            } catch (err) {
                console.error(err)
            }
        }
    
    fetchDecorInventory()
}, [session]);

    return decorInventory; 
}
