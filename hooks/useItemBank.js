import { fetchItemBank } from "../services/gardenService";
import { useState, useEffect } from "react";

export default function useItemBank() {
    const [itemBank, setItemBank] = useState([])

    useEffect(() => {
        const loadItemBank = async () => {
            const retrievedItemBank = await fetchItemBank(); 
            setItemBank(retrievedItemBank);

        };
        loadItemBank()
    }, [])

    return itemBank;
}

