import { useImage } from "@shopify/react-native-skia"
import { useMemo } from "react";

export default function useSkiaImageMap(items = []) {
    const images = items.map(item => useImage(item.image_url))
    return useMemo(() => {
        const dict = {};
        items.forEach((item, index) => {
            dict[item.id] = images[index];
        });
        return dict; 
    }, [images]);
}
