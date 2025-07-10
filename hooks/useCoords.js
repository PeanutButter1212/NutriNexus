import { useState, useEffect } from "react";
import { retrieveCoords } from "../services/hawkerService";

export default function useCoordsdata() {
  const [coords, setCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoords = async () => {
      const data = await retrieveCoords();

      setCoords(data || []);
      setLoading(false);
    };

    fetchCoords();
  }, []);

  return { coords, loading };
}
