import { Text, View, ImageBackground, Image, TouchableOpacity, ScrollView , Modal} from 'react-native'
import React, { Component, useState, useCallback, useMemo } from 'react'
import woodenBackground from '../assets/backgrounds/shopBackground.png'
import woodenSquare from '../assets/backgrounds/woodenSquare.png'
import { useAuth } from '../contexts/AuthContext'
import ShopRow from '../components/ShopRow'
import ShopOrder from '../components/ShopOrder'

export default function ShopScreen({navigation}) {

    const [showPopup, setShowPopup] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)

    const { session, profile } = useAuth();

    const mockItemBank = [
        {
           id: "87c30106-bb4c-4796-a61a-6a1fd31be753",
           name: "bougainvilla",
           image_url: "https://rkrdnsnujizdskzbdwlp.supabase.co/storage/v1/object/public/item-images//bougainvilla.png",
           type: "Decor",
           cost: "1000"
        }, 
        {
            id: "87c30106-bb4c-4796-a61a-6a1fd31be753",
            name: "durian",
            image_url: "https://rkrdnsnujizdskzbdwlp.supabase.co/storage/v1/object/public/item-images//durian.png",
            type: "Decor",
            cost: "1800"
        }

    ]

    const handleGet = useCallback((item) => {
        setSelectedItem(item)
        setShowPopup(true)
    }, [])

    const handleClosePopup = useCallback(() => {
        setShowPopup(false)
        setSelectedItem(null)
    }, [])

    const handlePurchaseConfirm = useCallback(() => {
        handleClosePopup()
    }, [selectedItem, handleClosePopup])

    const handlePurchaseCancel = useCallback(() => {
        handleClosePopup()
    }, [selectedItem, handleClosePopup])


    const renderShopItemRows = () => {
        const columns = [];
        const filteredItemBank = mockItemBank.filter(item => item.type === currentTab)

        if (filteredItemBank.length == 0) {
          return [];
        } 

      

        for (let i = 0; i < filteredItemBank.length; i += 2) {
          const leftItemInfo = filteredItemBank[i];
          const rightItemInfo = filteredItemBank[i + 1];
    

          columns.push(
            <ShopRow
              key={`row-${leftItemInfo.id}-${rightItemInfo?.id || 'empty'}`} 
              onGetPress={handleGet}
              topItem={{
                children: (
                    <Image
                    source={{ uri: leftItemInfo?.image_url }}
                    style={{ width: 90, height: 90 }}
                    />
                ),
                cost: leftItemInfo.cost,
                name: leftItemInfo.name,
                item: leftItemInfo

              }}
              bottomItem={
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
                      item: rightItemInfo
                    }
                  : undefined
              }
            />
          );
      
        return columns;
      };
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
                        > 7000 
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
            className="h-[512px] border-2 mx-[22px]" 
            >
                <ImageBackground
                source={woodenSquare}
                resizeMode='stretch'
                className="flex-1 p-6"
                >
                <ScrollView> 
                    {renderShopItemRows()}
                </ScrollView>

                </ImageBackground>
                
            </View>

            <TouchableOpacity
                onPress={() => navigation.navigate("MainTabs")}
                className="self-center items-center justify-center bg-red-600 rounded-xl mt-6 py-3 px-16 mb-6"
            >
                <Text className="text-white text-base font-medium font-bold">Back</Text>
            </TouchableOpacity>




        </ImageBackground>


      {/* Modal for Shop Popup */}
      <Modal
            visible={showPopup}
            transparent={true}
            animationType="none"
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


        </View>
        
    )
}