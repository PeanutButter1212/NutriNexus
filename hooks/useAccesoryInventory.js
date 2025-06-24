import { useEffect, useState } from "react";
import { retrieveAccessoryInventory } from "../services/avatarService";
import { useAuth } from "../contexts/AuthContext";

export default function useAccessoryInventory() {
  const { session } = useAuth();
  const [accessoryInventory, setAccessoryInventory] = useState([]);
  const userId = session?.user?.id;

  if (!userId) return;

  useEffect(() => {
    async function fetchAccessoryInventory() {
      try {
        const data = await retrieveAccessoryInventory(userId);
        setDecorInventory(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAccessoryInventory();
  }, [session]);

  return accessoryInventory;
}
