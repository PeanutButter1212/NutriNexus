import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { CommonActions } from '@react-navigation/native'; 
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { generateUniqueUsername } from "../utils/generateUniqueUsername";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  {
    /*RefreshFlag for updating of actviitylog*/
  }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMethod, setAuthMethod] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [user, setUser] = useState(null);

  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev); // flip the flag
  };

  useEffect(() => {
    console.log("Configuring Google Sign-In");
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/userinfo.email"],
      webClientId:
        "960982903167-8s5ucem4rqhƒqlbe68f1mml1ngf4b725h.apps.googleusercontent.com",
      iosClientId:
        "960982903167-krh2o19m7vtkcrsao5kspkor8qlfu9af.apps.googleusercontent.com",
      offlineAccess: true,
      behavior: 'web',
    });


    // added
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // added
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );
  }, []);

  /*
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

      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        username,
        email,
        created_at: new Date().toISOString(),
        is_first_time: true,
      });

      if (profileError) {
        throw profileError;
      }

      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Error", err.message || "An unknown error occurred");
    }
  };
  */ 

  const signInWithOTP = async (email, navigation) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email
      });
  
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Please verify your email before logging in.");
        }
        throw error;
      }
  

      navigation.navigate("OTP", { email });
    } catch (err) {
      console.error("signInWithOTP error:", err.message);
      return err.message;
    }
  };

  const verifyOtp = async (email, otp, navigation) => {
    try {
      console.log(email);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
  
      if (error) {
        console.log(error);
        throw new Error("OTP verification failed. Please try again.");
      }
  
      const session = data.session;
      const userId = data?.user?.id;
  
      let { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
  
      if (profileError) throw profileError;
  
      if (!profileData) {
        const base = email.split("@")[0];
        const username = await generateUniqueUsername(base);
  
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          email,
          username,
          is_first_time: true,
        });
  
        if (insertError) throw insertError;
  
    
        await supabase.auth.updateUser({ data: { username } });
  
        const { data: profileReload, error: reloadError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
  
        if (reloadError) throw reloadError;
        profileData = profileReload;
      }
  
    
      setSession(session);
      setProfile(profileData);
      setAuthMethod("email");
      setIsAuthenticated(true);
      setUser(profileData);
  
  
    } catch (err) {
      throw err;
    }
  };

  const googleSignIn = async (navigation) => {
    try {
      console.log("Google SIgn In")
      try {
        const userInfo = await GoogleSignin.signIn();
        console.log(userInfo);
      } catch (error) {
        console.log(JSON.stringify(error, null, 2)); // show full error details
      }
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log("console info: " + JSON.stringify(userInfo, null, 2));

      if (userInfo.data.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });

        if (error) {
          throw error;
        }

        const session = data.session;
        const userId = data.user?.id;
        const email = data.user?.email;

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single();

        if (profileError) {
          const username = email ? email.split("@")[0] : "Anonymous";

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              username: username,
              email: email,
              is_first_time: true,
            });

          if (insertError) {
            throw insertError;
          }
        }

        const { data: profileData2, error: profileError2 } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        const profile = profileData2;



        if (profile.is_first_time) {
          setSession(session);
          setProfile(profile);
          setAuthMethod(authMethod);
          navigation.reset({
            index: 0,
            routes: [{ name: "Detail" }],
          });
        } else {
          setSession(session);
          setProfile(profile);
          setAuthMethod("email");
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        }
        return data.user;
      } else {
        throw new Error("No ID token returned by Google");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async (authMethod, navigation) => {
    try {
      setIsOtpVerified(false); 
      setIsAuthenticated(false);
      setSession(null);
      setProfile(null);
      setUser(null);
      if (authMethod == "google") {
        console.log("Logging out from Google...");
        await GoogleSignin.signOut();
        await GoogleSignin.revokeAccess();
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

   
    } catch (err) {
      throw err;
    }
  };

  const value = {
    session, 
    profile,
    authMethod,
    isOtpVerified,  
    isAuthenticated, 
    signInWithOTP,
    verifyOtp,
    googleSignIn,
    logout,
    triggerRefresh,
    refreshFlag,
    user,
  };
  

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
