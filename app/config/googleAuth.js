import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";
import {
  googleAndroidClientId,
  googleIosClientId,
  googleWebClientId,
} from "./firebase";

const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";

const owner = Constants.expoConfig?.owner;
const slug = Constants.expoConfig?.slug;

export const googleProxyProjectName =
  owner && slug ? `@${owner}/${slug}` : null;

const proxyRedirectUri = makeRedirectUri({
  useProxy: true,
  ...(googleProxyProjectName
    ? { projectNameForProxy: googleProxyProjectName }
    : {}),
});

const resolvedWebClientId = googleWebClientId || undefined;
const resolvedAndroidClientId =
  googleAndroidClientId || googleWebClientId || undefined;
const resolvedIosClientId = googleIosClientId || googleWebClientId || undefined;

export const googleAuthRequestConfig = {
  expoClientId: resolvedWebClientId,
  webClientId: resolvedWebClientId,
  androidClientId: resolvedAndroidClientId,
  iosClientId: resolvedIosClientId,
  ...(isExpoGo ? { redirectUri: proxyRedirectUri } : {}),
};

export const googlePromptOptions = isExpoGo ? { useProxy: true } : undefined;
export const isGoogleProxyReady = !isExpoGo || Boolean(googleProxyProjectName);
