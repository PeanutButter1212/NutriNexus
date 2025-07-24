import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { CommonActions } from "@react-navigation/native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { generateUniqueUsername } from "../utils/generateUniqueUsername";
import {
  insertDefaultInventoryItems,
  updateProfileDetails,
} from "../services/profileService";
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
        "40873347659-k56jrhdf11ipoqsihkqcg43aacjo2h06.apps.googleusercontent.com",
      iosClientId:
        "40873347659-vecf58o4qml6t89rirffpsitnvnddqru.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      profileImageSize: 120,
    });

    const fetchProfile = async (userId) => {
      try {
        console.log("Fetching profile for userId:", userId);
        const { data: profileData, error } = await supabase
          .from("profile_page")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        console.log("Profile fetched successfully:", profileData?.username);
        setProfile(profileData);
        setUser(profileData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error in fetchProfile:", err);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      console.log("Initial session:", session ? "exists" : "null");
      setSession(session);

      if (session?.user?.id) {
        fetchProfile(session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user?.id) {
          await fetchProfile(newSession.user.id);
        } else {
          console.log("Clearing profile data");
          setProfile(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      console.log("Cleaning up auth listener");
      listener?.subscription?.unsubscribe();
    };
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
        email,
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

      const session1 = data.session;
      const userId = data?.user?.id;

      let { data: profileData, error: profileError } = await supabase
        .from("profile_page")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      setSession(session1);

      if (!profileData) {
        // New user flow
        const base = email.split("@")[0];
        const username = await generateUniqueUsername(base);

        const { error: insertError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            username: username,
            email: email,
            is_first_time: true,
            height: 173,
            weight: 70,
            calories: 2200,
            age: 36,
            gender: "Male",
          },
          { onConflict: "id" }
        );

        if (insertError) {
          console.error("Profile insertion error:", insertError);
          throw insertError;
        }

        const { error: usernameInsertError } = await supabase
          .from("username")
          .insert({
            username: username,
            user_id: userId,
          });

        if (usernameInsertError) {
          console.error("Username table insertion error:", usernameInsertError);
          throw usernameInsertError;
        }

        console.log("attempting to insert items: ");
        const inventorySuccess = await insertDefaultInventoryItems(userId);
        if (!inventorySuccess) {
          console.warn(
            "Failed to insert default inventory items for new user."
          );
        }

        const { data: extendedProfileData, error: extendedProfileDataError } =
          await supabase.from("profile_page").upsert(
            {
              id: userId,
              username: username,
              email: email,
              height: 173,
              weight: 70,
              calorie_goal: 2200,
              age: 36,
              gender: "Male",
              points: 10000,
              is_first_time: true,
            },
            { onConflict: "id" }
          );

        console.log(
          "Insertion data:",
          JSON.stringify(extendedProfileData, null, 2)
        );

        if (extendedProfileDataError) {
          throw extendedProfileDataError;
        }

        const { data: newProfileData, error: reloadError } = await supabase
          .from("profile_page")
          .select("*")
          .eq("id", userId)
          .single();

        if (reloadError) throw reloadError;

        setProfile(newProfileData);
        setAuthMethod("email");
        setIsAuthenticated(true);
        setUser(newProfileData);

        navigation.navigate("MainTabs");
      } else {
        setProfile(profileData);
        setAuthMethod("email");
        setIsAuthenticated(true);
        setUser(profileData);
        navigation.navigate("MainTabs");
      }
    } catch (err) {
      console.error("verifyOtp error:", err);
      throw err;
    }
  };

  const googleSignIn = async () => {
    try {
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices();
      }

      const userInfo = await GoogleSignin.signIn();
      console.log("Full userInfo object:", JSON.stringify(userInfo, null, 2));

      if (!userInfo.data?.idToken) {
        throw new Error("No ID token returned by Google");
      }

      // Sign in to Supabase using the ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: userInfo.data.idToken,
      });

      if (error) {
        console.error("Supabase Sign-In Error:", error.message);
        throw error;
      }

      const session1 = data.session;
      const userId = data.user?.id;
      const email = data.user?.email;

      // Check if profile_page exists
      let { data: profileData, error: profileError } = await supabase
        .from("profile_page")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      setSession(session1);

      if (!profileData) {
        // New Google user flow
        const base = email.split("@")[0];
        const username = await generateUniqueUsername(base);

        // Insert into profiles table
        const { error: insertError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            username: username,
            email: email,
            is_first_time: true,
            height: 173,
            weight: 70,
            calories: 2200,
            age: 36,
            gender: "Male",
          },
          { onConflict: "id" }
        );

        if (insertError) {
          console.error("Profile insertion error:", insertError);
          throw insertError;
        }

        const { error: usernameInsertError } = await supabase
          .from("username")
          .insert({
            username: username,
            user_id: userId,
          });

        if (usernameInsertError) {
          console.error("Username table insertion error:", usernameInsertError);
          throw usernameInsertError;
        }

        const inventorySuccess = await insertDefaultInventoryItems(userId);
        if (!inventorySuccess) {
          console.warn(
            "Failed to insert default inventory items for Google user."
          );
        }

        const { error: profilePageInsertError } = await supabase
          .from("profile_page")
          .upsert(
            {
              id: userId,
              username: username,
              email: email,
              height: 173,
              weight: 70,
              calorie_goal: 2200,
              age: 36,
              gender: "Male",
              points: 10000,
              is_first_time: true,
            },
            { onConflict: "id" }
          );

        if (profilePageInsertError) {
          console.error(
            "Profile page insertion error:",
            profilePageInsertError
          );
          throw profilePageInsertError;
        }

        const { data: newProfileData, error: reloadError } = await supabase
          .from("profile_page")
          .select("*")
          .eq("id", userId)
          .single();

        if (reloadError) throw reloadError;

        setProfile(newProfileData);
        setAuthMethod("google");
        setIsAuthenticated(true);
        setUser(newProfileData);
      } else {
        setProfile(profileData);
        setAuthMethod("google");
        setIsAuthenticated(true);
        setUser(profileData);
      }

      return data.user;
    } catch (error) {}
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
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
