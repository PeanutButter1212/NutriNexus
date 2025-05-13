import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase }  from "../lib/supabase";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const AuthContext = createContext(); 

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("");


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
            created_at: new Date().toISOString(),
            is_first_time: true
          });
    
        if (profileError) {
          console.error("Profile Insertion Error:", profileError);
          throw profileError;
        }

        Alert.alert("A verification email has been sent to your profile. Please click on the link attached to verify your account")
        navigation.navigate("Login");
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
            if (error.message.includes("Email not confirmed")) {
              throw new Error("Please verify your email before logging in.");
            }
            throw error;
          }
    
          const userId = data.user?.id;



          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, email, created_at, is_first_time')
            .eq('id', userId)
            .limit(1);

           
          if (profileError) {
            throw profileError;
        }

          navigation.navigate("OTP", { email } ); 
          

        } catch (err) {
        return err.message;
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

      const verifyOtp = async (email, otp, navigation) => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: "magiclink",
          });
      
          if (error) {
            console.error("OTP Verification Error:", error.message);
            throw new Error("OTP verification failed. Please try again.");
          }
      
          const userId = data.user?.id;
          setUserId(userId);
      
          if (!userId) {
            throw new Error("User ID not found after OTP verification.");
          }
      
          // Fetch `is_first_time` flag
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("is_first_time")
            .eq("id", userId)
            .single();
      
          if (profileError) {
            console.error("Profile Fetch Error:", profileError.message);
            throw profileError;
          }
      
          const { is_first_time } = profileData;
      
     
      
          if (is_first_time) {
            console.log("Navigating to DetailScreen...");
            navigation.navigate("Detail", { userId });
          } else {
            console.log("Navigating to ProfileScreen...");
            navigation.navigate("Profile", { userId });
          }
      
        } catch (err) {
          console.error("OTP Verification Error:", err.message);
          Alert.alert("Error", err.message);
        }
      };
      
      const googleSignIn = async (navigation) => {
        console.log("Attempting Google Sign-In...");
        try {
        
          if (Platform.OS === "android") {
            await GoogleSignin.hasPlayServices();
          }
      
          const userInfo = await GoogleSignin.signIn();

      
          if (userInfo.data.idToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: userInfo.data.idToken,
            });
      
            if (error) {
              console.error("Supabase Sign-In Error:", error.message);
              throw error;
            }
    
            const userId = data.user?.id;
            const email = data.user?.email;
            console.log(email); 
            setUserId(userId);

      
            
            const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .single();

            
    
          if (profileError) {

            const username = email ? email.split("@")[0] : "Anonymous";
            console.log("Generated Username:", username);

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              username: username,
              email: email,
              is_first_time: true,
            });

        if (insertError) {
          console.error("Error inserting profile data:", insertError.message);
          throw insertError;
        }

        console.log("New profile created for user:", userId);
      }
            
          
          const { data: profileData2, error: profileError2 } = await supabase
            .from("profiles")
            .select("is_first_time")
            .eq("id", userId)
            .single();
      
          if (profileError2) {
            console.error("Profile Fetch Error:", profileError.message);
            throw profileError;
          }
      
          const { is_first_time } = profileData2;
    
    
          if (is_first_time) {
            console.log("Navigating to DetailScreen...");
            navigation.navigate("Detail", { userId });
          } else {
            console.log("Navigating to ProfileScreen...");
            navigation.navigate("Profile", { userId });
          }
            return data.user;
          } else {
            throw new Error("No ID token returned by Google");
          }
        } catch (error) {
          console.error("Google Sign-In Error:", error.message);
          Alert.alert("Error", error.message || "An unknown error occurred");
        }
      };
      const getUserData = async () => {
        try {
          const { data, error } = await supabase.auth.getUser();
          if (error) throw error;
    
          const userId = data.user?.id;
          setUserId(userId);
    
          if (!userId) return;
    
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", userId)
            .single();

            setUsername(profileData.username);
    
          if (profileError) {
            console.error("Profile Fetch Error:", profileError.message);
            return;
          }
    
    
        } catch (err) {
          console.error("Error fetching user data:", err.message);
        }
      };
    
     
      const logout = async (navigation) => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
    
          console.log("User successfully logged out.");
          setUser(null);
          setUserId(null);
          setUsername("");
          navigation.navigate("Login");
    
        } catch (err) {
          console.error("Logout Error:", err.message);
          Alert.alert("Error", err.message);
        }
      };
    
      
      const value = {
        userId,
        user,
        username,
        signUp,
        signInWithEmail,
        sendOtpEmail,
        verifyOtp,
        googleSignIn,
        getUserData,
        logout
      };
    
      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
      }
    
    export const useAuth = () => {
      return useContext(AuthContext);
    };
