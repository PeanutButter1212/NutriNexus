import { Image as SkiaImage, useImage } from "@shopify/react-native-skia";

export default function SkiaImageItem({item, x, y, width = 64, height = 64}) {
    const skiaImage = useImage(item.image_url) 

    console.log("SkiaImage: ", skiaImage)
    if (!skiaImage) return null; 

    return (
        <SkiaImage
        image={skiaImage}
        x={x}
        y={y}
        width={width}
        height={height}
        /> 
    );
}