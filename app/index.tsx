import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { UserProvider } from "./context/UserContext";
// import AgeScreen from "./screens/AgeScreen";
import AuthOptionsScreen from "./screens/AuthOptionsScreen";
import CaloriePlanScreen from "./screens/CaloriePlanScreen";
import CurrentScreen from "./screens/CurrentWeightScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import GenderScreen from "./screens/GenderScreen";
import GoalSelectionScreen from "./screens/GoalSelectionScreen";
import HeightScreen from "./screens/HeightScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import NameScreen from "./screens/NameScreen";
import OTPScreen from "./screens/OTPScreen";
import PasswordChangedScreen from "./screens/PasswordChangedScreen";
import PersonalizationScreen from "./screens/PersonalizationScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import SignUpScreen from "./screens/SignUpScreen";
import TargetScreen from "./screens/TargetWeightScreen";
import WelcomeScreen1 from "./screens/WelcomeScreen1";
import WelcomeScreen2 from "./screens/WelcomeScreen2";
import WelcomeScreen3 from "./screens/WelcomeScreen3";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tracker" component={() => null} />
      <Tab.Screen name="Insights" component={() => null} />
      <Tab.Screen name="Articles" component={() => null} />
      <Tab.Screen name="Account" component={() => null} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [finishedOnboarding, setFinishedOnboarding] = useState(false);

  return (
    <UserProvider>
      <Stack.Navigator
        initialRouteName="Welcome1"
        screenOptions={{ headerShown: false }}
      >
        {!finishedOnboarding ? (
          <>
            <Stack.Screen name="Welcome1" component={WelcomeScreen1} />
            <Stack.Screen name="Welcome2" component={WelcomeScreen2} />
            <Stack.Screen name="Welcome3" component={WelcomeScreen3} />
            <Stack.Screen name="AuthOptions" component={AuthOptionsScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen name="OTPScreen" component={OTPScreen} />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
            <Stack.Screen
              name="PasswordChanged"
              component={PasswordChangedScreen}
            />
            <Stack.Screen name="Name" component={NameScreen} />
            <Stack.Screen name="Gender" component={GenderScreen} />
            <Stack.Screen name="Height" component={HeightScreen} />
            <Stack.Screen name="Current" component={CurrentScreen} />
            <Stack.Screen name="Target" component={TargetScreen} />

            {/* <Stack.Screen name="Age" component={AgeScreen} /> */}
            <Stack.Screen name="Goals" component={GoalSelectionScreen} />
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
          </>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </UserProvider>
  );
}
