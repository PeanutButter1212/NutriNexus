import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
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
      
  
      const value = {
        user,
        loading,
        signUp,
      };
    
      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };
    
    export const useAuth = () => {
      return useContext(AuthContext);
    };