import { useFonts } from 'expo-font'


export const getCustomFonts = () => 
    useFonts({
        'pixel-font': require('../assets/fonts/PressStart2P-Regular.ttf'),
    })