import { CanvasKitWebGLBuffer } from "@shopify/react-native-skia";
import { addtoDecorInventory } from "./gardenService";
import { addToAccessoryInventory, fetchPoints, deductUserPoints, checkUserHasAccessory, fetchAccessoryInventory } from "./profileService";
import { supabase } from "../lib/supabase";

const ShopService = {
    async hasEnoughPoints(userId, itemCost) {
        const points = await fetchPoints(userId)
        return points >= itemCost 
    },

    async purchaseItem(userId, item) {
        let itemPurchased = false 

        const canPurchase = await this.hasEnoughPoints(userId, item.cost)

        if (!canPurchase) {
            return { success: false, message: "Not enough Points"}
        }

        try {
            if (item.type == "Decor") {
                await addtoDecorInventory(userId, item.id)
                itemPurchased = true
            } else {
                console.log("purchasing accessory")
                const userInventory = await checkUserHasAccessory(userId, item.id)
                if (!userInventory.success) {
                    console.log("Error purchasing accesssory: " + userAccessory.error.message)
                    return { success: false, message: "Check failed" }
                }
                if (userInventory.hasAccessory) {
                    return { success: false, message: "User already has item"}
                }
                await addToAccessoryInventory(userId, item.id)
                itemPurchased = true 

            }
            if (itemPurchased) {
                const deductionResult = await deductUserPoints(userId, item.cost);
                if (!deductionResult.success) {
                    return { success: false, message: deductionResult.error || "Deduction failed" };
                }

            }

            return { success: true, message: "Purchase successful" };
            
 
        } catch (err) {
            return { success: false, message: err.message}
        }


    },

    async fetchUserAccessories(userId) {
        try {
            const result = await fetchAccessoryInventory(userId)

            if (result.error) {
                console.error("Error fetching accessories inventory: " + result.error.message)
                return [] 
            }

            const accessoryIds = result.accessories.map(a => a.item_id);
            return accessoryIds; 

        } catch (error) {
            console.log("Error from fetchUserAccessories in ShopService: " + error)
            return [] 
        }
    }

}

export default ShopService;