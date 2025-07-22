import { Text, View, ImageBackground, Image, TouchableOpacity, ScrollView , Modal, Alert, Platform} from 'react-native'
import React, { Component, useState, useCallback, useMemo } from 'react'
import woodenBackground from '../assets/backgrounds/shopBackground.png'
import woodenSquare from '../assets/backgrounds/woodenSquare.png'
import { useAuth } from '../contexts/AuthContext'
import ShopRow from '../components/ShopRow'
import ShopOrder from '../components/ShopOrder'
import useItemBank from '../hooks/useItemBank'
import useProfileData from '../hooks/useProfileData'
import ShopService from '../services/shopService'
import { useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import AccessoryPopUp from '../components/AccessoryPopup'

export default function ShopScreen({navigation}) {

    const [showPopup, setShowPopup] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)

    const { session, profile } = useAuth();

    const itemBank = useItemBank() 

    const { points } = useProfileData() 

    const [ownedAccessories, setOwnedAccessories] = useState([])

    const [localPoints, setLocalPoints] = useState(0)

    const [showSuccessfulPurchasePopup, setShowSuccessfulPurchasePopup] = useState(false)

    const [showUnsuccessfulPurchasePopup, setShowUnsuccessfulPurchasePopup] = useState(false)





    useEffect( () => {
        setLocalPoints(points) }
    , [points])

    useFocusEffect(
        useCallback(() => {
            const fetchOwnedAccessories = async () => {
                try {
                    if (!session?.user?.id) {
                        console.log("No user ID available");
                        return;
                    }
                    
                    const listOfAccessoriesOwned = await ShopService.fetchUserAccessories(session.user.id);
                    
                    console.log("output from listOfAccessoriesOwned: " + JSON.stringify(listOfAccessoriesOwned, null, 2));
                    

                    setOwnedAccessories(listOfAccessoriesOwned)
                } catch (error) {
                    console.log(error.message)
                    setOwnedAccessories([]);
                }
            }
            fetchOwnedAccessories()
        }, [session?.user?.id])
    )

    const isAccessoryOwned = useCallback((item) => {
        return item.type === "Accessory" && ownedAccessories.includes(item.id);
    }, [ownedAccessories]);
    


    const handleGet = useCallback((item) => {
        setSelectedItem(item)
        setShowPopup(true)
    }, [])

    const handleClosePopup = useCallback(() => {
        setShowPopup(false)
        setSelectedItem(null)
    }, [])

    const handlePurchaseConfirm = useCallback(async () => {
        const purchaseResult = await ShopService.purchaseItem(session.user.id, selectedItem)
        handleClosePopup() 
        if (purchaseResult.success) {
            setLocalPoints(localPoints -  selectedItem.cost)
            if (selectedItem.type == "Accessory") {
                setOwnedAccessories(prev => [...prev, selectedItem.id])
            }
            setShowSuccessfulPurchasePopup(true)
        } else {
            setShowUnsuccessfulPurchasePopup(true)
        }
    }, [selectedItem, handleClosePopup])

    const handlePurchaseCancel = useCallback(() => {
        handleClosePopup()
    }, [selectedItem, handleClosePopup])


    const renderShopItemRows = () => {

        console.log("ownedAccessories: ", ownedAccessories);

        const columns = [];
        const filteredItemBank = itemBank.filter(item => item.type === currentTab)

        if (filteredItemBank.length == 0) {
          return [];
        } 

      

        for (let i = 0; i < filteredItemBank.length; i += 2) {
          const leftItemInfo = filteredItemBank[i];
          const rightItemInfo = filteredItemBank[i + 1];

          const isLeftOwned = isAccessoryOwned(leftItemInfo);
          const isRightOwned = rightItemInfo ? isAccessoryOwned(rightItemInfo) : false;

          const isFirstRow = i === 0;

          columns.push(
            <View
            key={`row-${leftItemInfo.id}-${rightItemInfo?.id || 'empty'}`} 
            style={{
                marginTop: isFirstRow ? 0 : 10
              }}
            > 
            <ShopRow
              onGetPress={handleGet}
              leftItem={{
                children: (
                    <Image
                    source={{ uri: leftItemInfo?.image_url }}
                    style={{ width: 90, height: 90 }}
                    />
                ),
                cost: leftItemInfo.cost,
                name: leftItemInfo.name,
                item: leftItemInfo,
                isOwned: isLeftOwned,

              }}
              rightItem={
                rightItemInfo
                  ? {
                      children: (
                        <Image
                        source={{ uri: rightItemInfo?.image_url }}
                        style={{ width: 90, height: 90 }}
                    />
                      ),
                      cost: rightItemInfo.cost,
                      name: rightItemInfo.name,
                      item: rightItemInfo,
                      isOwned: isRightOwned, 
                    }
                  : undefined
              }
            />
            </View> 
          );
      
      };

      return columns;
    }

    const TABS = ["Decor", "Accessory"]

    const [currentTab, setCurrentTab] = useState("Decor")

    return (
        <View 
        className="flex-1 flex-column"
        > 
            <ImageBackground
                    source={woodenBackground}
                    resizeMode="stretch"
                    className="flex-1"
                    style 
            >
            
            <View className="justify-between flex-row"> 
                <View
                className="border-green-500 border-2 rounded-xl px-3 py-3 bg-amber-900 mt-16 self-start w-[150px] ml-3"
                > 
                    <View
                    className="flex-row justify-center items-center" 
                    > 
                        <Image
                        source={require("../assets/Points.png")}
                        className="w-8 h-8"
                        />
                        <Text
                        className="text-white font-nunito-bold text-xl"
                        > {localPoints}
                        </Text>
                    </View>
              

                </View>

                <View
                className="mt-16 mr-5 justify-center"
                >
                    <Text
                    className="text-white font-nunito-extrabold text-3xl"
                    > 
                    
                    </Text>

                </View>

          
            </View>

           
            
            <View
                className='justify-center flex-row'
                > 
                <Image
                    source={require("../assets/shop/ShopTent.png")}
                    className="w-32 h-32"
                    />
                <Image
                    source={require("../assets/shop/ShopSign.png")}
                    className="w-32 h-32"
                    />
                
              
            </View>

            <View
            className="flex-row px-6 rounded-2xl mb-4"
            >
                <View
                className="bg-amber-900 flex-row flex-1 rounded-2xl"
                > 
                    {TABS.map((tab) => (
                        <TouchableOpacity
                        key={tab}
                        className="flex-1 py-3 rounded-2xl"
                        onPress={() => setCurrentTab(tab)}
                        style={{
                            backgroundColor: currentTab == tab ? "#419e34" : "transparent"
                        }}
                        > 
                            <Text
                            className="text-center text-white text-xl"
                            style={{
                                fontFamily: currentTab == tab ? 'Nunito-ExtraBold' : 'Nunito-Bold'
                            }}
                            > 
                            {tab}
                            </Text>

                        </TouchableOpacity>
                    ))
                    
                    }

                </View>

            </View>

            <View
            className={`${Platform.OS === 'ios' ? "h-[512px]" : "h-[440px]"} border-2 mx-[22px]`}
            style={{ overflow: 'hidden' }}
            >
                <ImageBackground
                source={woodenSquare}
                resizeMode='stretch'
                className="flex-1 p-[28px]"
                >
                 <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    > 
                    {renderShopItemRows()}
                </ScrollView>

                </ImageBackground>
                
            </View>

            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="self-center items-center justify-center bg-red-600 rounded-xl mt-6 py-3 px-16 mb-6"
            >
                <Text className="text-white text-base font-medium font-bold">Back</Text>
            </TouchableOpacity>




        </ImageBackground>


      {/* Modal for Shop Popup */}
      <Modal
            visible={showPopup}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClosePopup}
        >
           <View className="flex-1 bg-black/50">
                    <ShopOrder
                        item={selectedItem}
                        onConfirm={handlePurchaseConfirm}
                        onCancel={handlePurchaseCancel}
                    />
                </View>
        </Modal>

        <Modal
            visible={showSuccessfulPurchasePopup}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSuccessfulPurchasePopup(false)}
        >
            <View 
            className="flex-1 bg-black/50"
            >
            <AccessoryPopUp 
            success={true}
            messageHeading={"Item purchased!"}
            messageDescription={"This has been successfully added into your inventory"}
            onContinue={() => setShowSuccessfulPurchasePopup(false)}/> 
            </View>
        </Modal>

        <Modal
            visible={showUnsuccessfulPurchasePopup}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowUnsuccessfulPurchasePopup(false)}
        >
            <View 
            className="flex-1 bg-black/50"
            >
            <AccessoryPopUp 
            success={false}
            messageHeading={"Failed to Purchase Item!"}
            messageDescription={"You do not have enough points to purchase this!"}
            onContinue={() => setShowUnsuccessfulPurchasePopup(false)}/> 
            </View>
        </Modal>



        </View>
        
    )
}