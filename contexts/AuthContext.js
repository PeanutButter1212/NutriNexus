import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { CommonActions } from '@react-navigation/native'; 
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

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

  const signInWithUsername = async (username, password, navigation) => {
    try {
      const { data: userRecords, error: userError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username)
        .single();
        
      console.log(userRecords)
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
        console.log(error);
        throw error;
      }

      const userId = data.user?.id;
      console.log(userId)

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username, email, created_at, is_first_time")
        .eq("id", userId)
        .limit(1);

      if (profileError) {
        console.log(profileError)
        throw profileError;
      }

      navigation.navigate("OTP", { email });
    } catch (err) {
      return err.message;
    }
  };

  const sendOtpEmail = async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        console.error("Error sending OTP: ", error.message);
        throw new Error("Failed to send OTP. Please try again");
      }

      console.log("OTP sent to", email);
    } catch (err) {
      console.error("Error in sendOtpEmail:", err.message);
      throw err;
    }
  };

  const verifyOtp = async (email, otp, navigation) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "magiclink",
      });

      if (error) {
        console.log(error);
        throw new Error("OTP verification failed. Please try again.");
      }

      const session = data.session;
      const userId = data?.user?.id;

      console.log(userId)

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log(profileData); 

      if (profileError) {
        throw profileError;
      }

      const profile = profileData;
      const authMethod = "email";
      setIsOtpVerified(true);

      if (profile.is_first_time) {
        setSession(session);
        setProfile(profile);
        setAuthMethod(authMethod);
        setIsAuthenticated(true);
    
      } else {
        setSession(session);
        setProfile(profile);
        setAuthMethod(authMethod);
        setIsAuthenticated(true);
        setUser(profile);

      }
    } catch (err) {
      throw err;
    }
  };

  const googleSignIn = async (navigation) => {
    try {
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

      navigation.navigate("Login");
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
    signUp,
    signInWithUsername,
    verifyOtp,
    sendOtpEmail,
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
