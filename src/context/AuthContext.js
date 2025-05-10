import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase }  from "../lib/supabase";

const AuthContext = createContext(); 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const signUp = async (username, email, password) => {
        try {

          // Step 1: Register the user
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
    
          if (error) throw error;
    
          // Step 2: Insert user data into profiles table
          const userId = data.user?.id;
          if (userId) {
            const { error: profileError } = await supabase
              .from("profiles")
              .insert([{ id: userId, username }]);
    
            if (profileError) throw profileError;
          }
    
          Alert.alert("Success", "User registered successfully");
        } catch (error) {
          console.error("Sign Up Error: ", error.message);
          Alert.alert("Error", error.message);
          console.error("Network Request Error: ", error);

        } finally {
          setLoading(false);
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