import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import AuthOptionsScreen from "./screens/AuthOptionsScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import LoginScreen from "./screens/LoginScreen";
import OTPScreen from "./screens/OTPScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import SignUpScreen from "./screens/SignUpScreen";
import WelcomeScreen1 from "./screens/WelcomeScreen1";
import WelcomeScreen2 from "./screens/WelcomeScreen2";
import WelcomeScreen3 from "./screens/WelcomeScreen3";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Welcome1"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome1" component={WelcomeScreen1} />
      <Stack.Screen name="Welcome2" component={WelcomeScreen2} />
      <Stack.Screen name="Welcome3" component={WelcomeScreen3} />
      <Stack.Screen name="AuthOptions" component={AuthOptionsScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
    // </NavigationContainer>
  );
}
