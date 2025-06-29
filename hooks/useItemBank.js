import { fetchItemBank } from "../services/gardenService";
import { useState, useEffect } from "react";

export default function useItemBank() {
  const [itemBank, setItemBank] = useState([]);

  useEffect(() => {
    const loadItemBank = async () => {
      console.log("loading item bank");
      const retrievedItemBank = await fetchItemBank();
      setItemBank(retrievedItemBank);
    };
    loadItemBank();
  }, []);

  //console.log("item bank: " + itemBank)
  return itemBank;
}
