import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase }  from "../lib/supabase";

const AuthContext = createContext(); 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
   
    const signUp = async (username, email, password) => {
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
      
          Alert.alert("Success", "User registered successfully!");
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
          navigation.navigate("OTP", { email }); 
          

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
      
  
      const value = {
        user,
        loading,
        signUp,
        signInWithEmail,
        sendOtpEmail,
        verifyOtp 
      };
    
      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
      }
    
    export const useAuth = () => {
      return useContext(AuthContext);
    };
