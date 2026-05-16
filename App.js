import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Font from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";

import LaunchScreen from "./src/components/LaunchScreen";
import { COLORS } from "./src/constants/appConstants";
import { initializeDatabase } from "./src/database/initDatabase";
import AppNavigator from "./src/navigation/AppNavigator";
import { authService } from "./src/services/authService";

const setCustomText = () => {
  const TextRender = Text.render;
  if (TextRender) {
    Text.render = function render(props, ref) {
      let newProps = { ...props, style: [{ fontFamily: 'Inter' }, props.style] };
      return TextRender.apply(this, [newProps, ref]);
    };
  } else {
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = [{ fontFamily: 'Inter' }, Text.defaultProps.style];
  }
};
setCustomText();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [initialError, setInitialError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const minimumDelay = new Promise((resolve) => setTimeout(resolve, 1400));

      try {
        await Promise.all([
          minimumDelay,
          (async () => {
            await Font.loadAsync({
              "Inter": Inter_400Regular,
              "Inter-Medium": Inter_500Medium,
              "Inter-SemiBold": Inter_600SemiBold,
              "Inter-Bold": Inter_700Bold,
              "Inter-ExtraBold": Inter_800ExtraBold,
              "Inter-Black": Inter_900Black,
            });
            await initializeDatabase();
            const user = await authService.getCurrentUser();

            if (mounted) {
              setCurrentUser(user);
            }
          })(),
        ]);
      } catch (err) {
        if (mounted) {
          setInitialError(err.message);
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (initializing && !initialError) {
    return (
      <>
        <LaunchScreen />
        <StatusBar style="dark" />
      </>
    );
  }

  if (initialError) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={[styles.message, styles.error]}>{initialError}</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  const appContent = (
    <SafeAreaProvider>
      <AppNavigator
        user={currentUser}
        onAuthenticated={setCurrentUser}
        onLogout={() => setCurrentUser(null)}
      />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOuterContainer}>
        <View style={styles.webInnerContainer}>
          {appContent}
        </View>
      </View>
    );
  }

  return appContent;
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  message: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 14,
    textAlign: "center",
  },
  error: {
    color: COLORS.danger,
  },
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#d1d5db', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  webInnerContainer: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
});
