import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchActivityLog } from "../services/profileService";

export default function useActivityLog() {
    const { session, refreshFlag } = useAuth()
    const userId = session?.user?.id; 
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const loadEntries = async () => {
        try {
            const userLog = await fetchActivityLog(session.user.id)
            setEntries(userLog || [])
        } catch (err) {
            console.error(err)
        }
        };
        loadEntries(); 
    }, [refreshFlag, userId])
   //whenever the refresh flag changes(ie when updated table then it 

   return entries; 
}