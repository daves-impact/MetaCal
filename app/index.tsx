import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext, useEffect, useState } from "react";
import "./setupFonts";

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/nunito";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { AuthFlowProvider } from "./context/AuthFlowContext";
import { AlertProvider } from "./context/AlertContext";
import { MealsProvider } from "./context/MealsContext";
import { UserContext, UserProvider } from "./context/UserContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./config/firebase";
import * as SecureStore from "expo-secure-store";
import MainTabs from "./navigation/MainTabs";
import AdjustMacrosScreen from "./screens/AdjustMacrosScreen";
import AgeScreen from "./screens/AgeScreen";
import ArticleDetailsScreen from "./screens/ArticleDetailsScreen";
import AuthOptionsScreen from "./screens/AuthOptionsScreen";
import CaloriePlanScreen from "./screens/CaloriePlanScreen";
import CurrentScreen from "./screens/CurrentWeightScreen";
import FoodDetailsScreen from "./screens/FoodDetailsScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import GenderScreen from "./screens/GenderScreen";
import GoalSelectionScreen from "./screens/GoalSelectionScreen";
import HeightScreen from "./screens/HeightScreen";
import LanguageScreen from "./screens/LanguageScreen";
import LogFoodScreen from "./screens/LogFoodScreen";
import LoginEmailScreen from "./screens/LoginEmailScreen";
import LoginPasswordScreen from "./screens/LoginPasswordScreen";
import LoginVerifyScreen from "./screens/LoginVerifyScreen";
import LoginVerifiedScreen from "./screens/LoginVerifiedScreen";
import NameScreen from "./screens/NameScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import PasswordChangedScreen from "./screens/PasswordChangedScreen";
import PersonalDetailsScreen from "./screens/PersonalDetailsScreen";
import PersonalizationScreen from "./screens/PersonalizationScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import ScanScreen from "./screens/ScanScreen";
import SignUpEmailScreen from "./screens/SignUpEmailScreen";
import SignUpPasswordScreen from "./screens/SignUpPasswordScreen";
import SignUpTermsScreen from "./screens/SignUpTermsScreen";
import SignUpVerifyScreen from "./screens/SignUpVerifyScreen";
import TargetScreen from "./screens/TargetWeightScreen";
import WelcomeScreen1 from "./screens/WelcomeScreen1";
import WelcomeScreen2 from "./screens/WelcomeScreen2";
import WelcomeScreen3 from "./screens/WelcomeScreen3";
import ActivityLevelScreen from "./screens/ActivityLevelScreen";
import TermsScreen from "./screens/TermsScreen";

const Stack = createNativeStackNavigator();

function RootNavigator({
  finishedOnboarding,
  setFinishedOnboarding,
}: {
  finishedOnboarding: boolean | null;
  setFinishedOnboarding: React.Dispatch<React.SetStateAction<boolean | null>>;
}) {
  const { authUser, authLoading } = useContext(AuthContext);
  const { setUser, initialUser } = useContext(UserContext);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      if (!authUser) {
        setFinishedOnboarding(false);
        setUser(initialUser);
        setProfileLoading(false);
        return;
      }
      const gate = await SecureStore.getItemAsync("metacal_onboarding_gate");
      const gateValue = gate === "done";
      if (!authUser.emailVerified) {
        setFinishedOnboarding(false);
        setProfileLoading(false);
        return;
      }
      const snap = await getDoc(doc(db, "users", authUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUser((prev: any) => ({ ...prev, ...data }));
        const isComplete = Boolean(data.profileComplete);
        if (gateValue && isComplete) {
          // Onboarding already completed; clear gate to avoid looping.
          await SecureStore.deleteItemAsync("metacal_onboarding_gate");
          setFinishedOnboarding(true);
        } else {
          setFinishedOnboarding(isComplete);
        }
      } else {
        setFinishedOnboarding(false);
      }
      setProfileLoading(false);
    };
    loadProfile();
  }, [authUser, setUser, setFinishedOnboarding, initialUser]);

  if (authLoading || profileLoading || finishedOnboarding == null) return null;

  const isVerified = Boolean(authUser?.emailVerified);
  const showOnboarding = !authUser || !isVerified;
  const initialRoute = !authUser
    ? "Welcome1"
    : !isVerified
      ? "Login"
      : finishedOnboarding
        ? "MainTabs"
        : "Name";

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      {showOnboarding ? (
        <>
          <Stack.Screen name="Welcome1" component={WelcomeScreen1} />
          <Stack.Screen name="Welcome2" component={WelcomeScreen2} />
          <Stack.Screen name="Welcome3" component={WelcomeScreen3} />
          <Stack.Screen name="AuthOptions" component={AuthOptionsScreen} />
          <Stack.Screen name="SignUp" component={SignUpEmailScreen} />
          <Stack.Screen name="SignUpPassword" component={SignUpPasswordScreen} />
          <Stack.Screen name="SignUpTerms" component={SignUpTermsScreen} />
          <Stack.Screen name="SignUpVerify" component={SignUpVerifyScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Login" component={LoginEmailScreen} />
          <Stack.Screen name="LoginPassword" component={LoginPasswordScreen} />
          <Stack.Screen name="LoginVerify" component={LoginVerifyScreen} />
          <Stack.Screen name="LoginVerified" component={LoginVerifiedScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="PasswordChanged" component={PasswordChangedScreen} />
        </>
      ) : null}
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="Height" component={HeightScreen} />
      <Stack.Screen name="Current" component={CurrentScreen} />
      <Stack.Screen name="Target" component={TargetScreen} />
      <Stack.Screen name="Goals" component={GoalSelectionScreen} />
      <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
      <Stack.Screen
        name="Personalization"
        component={PersonalizationScreen}
      />
      <Stack.Screen name="CaloriePlan">
        {(props) => (
          <CaloriePlanScreen
            {...props}
            onFinish={() => setFinishedOnboarding(true)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="LogFood" component={LogFoodScreen} />
      <Stack.Screen name="FoodDetails" component={FoodDetailsScreen} />
      <Stack.Screen name="ArticleDetails" component={ArticleDetailsScreen} />
      <Stack.Screen name="AdjustMacros" component={AdjustMacrosScreen} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Age" component={AgeScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [finishedOnboarding, setFinishedOnboarding] = useState<boolean | null>(
    null,
  );
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <NavigationContainer>
            <AuthProvider>
              <AuthFlowProvider>
                <MealsProvider>
                  <UserProvider>
                    <AlertProvider>
                      <RootNavigator
                        finishedOnboarding={finishedOnboarding}
                        setFinishedOnboarding={setFinishedOnboarding}
                      />
                    </AlertProvider>
                  </UserProvider>
                </MealsProvider>
              </AuthFlowProvider>
            </AuthProvider>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
