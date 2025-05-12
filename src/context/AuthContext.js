import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase }  from "../lib/supabase";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const AuthContext = createContext(); 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      console.log("Configuring Google Sign-In");
      GoogleSignin.configure({
        scopes: ["https://www.googleapis.com/auth/userinfo.email"],
        webClientId: "960982903167-8s5ucem4rqhqlbe68f1mml1ngf4b725h.apps.googleusercontent.com",
        iosClientId: "960982903167-krh2o19m7vtkcrsao5kspkor8qlfu9af.apps.googleusercontent.com", 
        offlineAccess: true,
      });
      console.log("Google Sign-In configured");
    }, []);
   
    const signUp = async (username, email, password, navigation) => {
        try {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
      
          if (signUpError) {
            console.error("Sign Up Error:", signUpError.message);
            throw signUpError;
          }
      
          const userId = data.user?.id;
      
          if (!userId) {
            throw new Error("User ID is undefined");
          }
      
          console.log("Insert Payload:", {
            user_id: userId,
            username,
            created_at: new Date().toISOString()
          });
      
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              username,
              email,
              created_at: new Date().toISOString()
            });
      
          if (profileError) {
            console.error("Profile Insertion Error:", profileError);
            throw profileError;
          }
      
          navigation.navigate("OTP", { email, action: "signup"})
        } catch (err) {
          console.error("Error Details:", err);
          Alert.alert("Error", err.message || "An unknown error occurred");
        }
      };
      
      const signInWithEmail = async (username, password, navigation) => {
        try {
         
          const { data: userRecords, error: userError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', username)
          .single() 

          if (userError) {
            console.error("Error fetching user data", userError.message); 
          }
          const email = userRecords.email;

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error("Login Error:" + error.message);
            throw error; 
          }
          console.log("Auth Data:", data);

          const userId = data.user?.id;



          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username, email, created_at')
            .eq('id', userId)
            .limit(1);

          if (profileError) {
            console.error("Error fetching profile data:", profileError.message);
            throw profileError;
        }

          setUser({ ...data.user, ...profile });
          navigation.navigate("OTP", { email, action: "login" }); 
          

        } catch (err) {
        console.error("Error in signInWithEmail:", err.message);
        Alert.alert("Error", err.message || "An unknown error occurred");
        }
      }

      const sendOtpEmail = async (email) => {
        try {
          const { error } = await supabase.auth.signInWithOtp({email});
          if (error) {
            console.error("Error sending OTP: ", error.message)
            throw new Error("Failed to send OTP. Please try again")
  
          }


          console.log("OTP sent to", email)
        } catch (err) {
          console.error("Error in sendOtpEmail:", err.message);
          throw err;
        }
        

      }

      const verifyOtp = async (email, otp) => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: "email",
          })
          if (error) {
            console.error("OTP Verification Error:", error.message);
            throw new Error("OTP verification failed. Please try again.");
        }

        console.log("OTP Verified:", data);
        Alert.alert("Success", "OTP Verified Successfully!");

        setUser(data.user);

        } catch (err) {
          throw err
        }

      }


      const googleSignIn = async (navigation) => {
        console.log("Attempting Google Sign-In...");
        try {
        
          if (Platform.OS === "android") {
            await GoogleSignin.hasPlayServices();
          }
      
          const userInfo = await GoogleSignin.signIn();
          console.log("User Info after Google Sign-In:", userInfo);
      
          if (userInfo.data.idToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: userInfo.data.idToken,
            });
      
            if (error) {
              console.error("Supabase Sign-In Error:", error.message);
              throw error;
            }
      
            console.log("Supabase User Data:", data);
            Alert.alert("Success", "You are now signed in with Google");
            navigation.navigate("Profile");
            return data.user;
          } else {
            throw new Error("No ID token returned by Google");
          }
        } catch (error) {
          console.error("Google Sign-In Error:", error.message);
          Alert.alert("Error", error.message || "An unknown error occurred");
        }
      };
      
  
      const value = {
        user,
        loading,
        signUp,
        signInWithEmail,
        sendOtpEmail,
        verifyOtp,
        googleSignIn
      };
    
      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
      }
    
    export const useAuth = () => {
      return useContext(AuthContext);
    };
