import { useEffect, useState } from "react";
import { fetchEquippedItems } from "../services/avatarService";
import { useAuth } from "../contexts/AuthContext";

export default function useEquippedItems() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [equippedItems, setEquippedItems] = useState({
    head: null,
    body: null,
    hand: null,
  });

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadEquipped = async () => {
      const data = await fetchEquippedItems(userId);
      setEquippedItems(data);
    };

    loadEquipped();
  }, [userId]);
  return equippedItems;
}
