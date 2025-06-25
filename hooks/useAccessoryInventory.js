//rn its not being used oops

import { useEffect, useState } from "react";
import { retrieveAccessoryInventory } from "../services/avatarService";
import { useAuth } from "../contexts/AuthContext";

export default function useAccessoryInventory() {
  const { session } = useAuth();
  const [accessoryInventory, setAccessoryInventory] = useState([]);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    async function fetchAccessoryInventory() {
      try {
        const data = await retrieveAccessoryInventory(userId);
        setAccessoryInventory(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAccessoryInventory();
  }, [userId]);

  return accessoryInventory;
}
