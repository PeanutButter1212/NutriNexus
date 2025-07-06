import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchPoints } from '../services/profileService';

export default function useHasEnoughPoints(itemCost) {
    const [loading, setLoading] = useState(false)
    const [enoughPoints, setEnoughPoints] = useState(false)
    const { session } = useAuth() 
    const userId = session?.user?.id 

    useEffect(() => {
        if (!userId) {
            return;
          }
        const checkPoints = async () => {
            try {
                const userPoints = await fetchPoints(userId)
                setEnoughPoints(userPoints >= parseInt(itemCost))
            } catch (err) {
                console.error("Error checking points from profile: " + err.message)
                setEnoughPoints(false)
            } finally {
                setLoading(false)
            }
        } 
        checkPoints(), [itemCost, session]  
    })

    return { enoughPoints, loading }
}