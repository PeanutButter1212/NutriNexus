import { useFonts } from 'expo-font'


export const getCustomFonts = () => 
    useFonts({
        'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
        'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
        'pixel-font': require('../assets/fonts/PressStart2P-Regular.ttf'),
      });