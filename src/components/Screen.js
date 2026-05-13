import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/theme";

export default function Screen({
  children,
  style,
  contentStyle,
  scroll = false,
  contentContainerStyle,
  stickyHeaderIndices,
  edges = [ "left", "right"],
  withKeyboard = true, // Mặc định bật hỗ trợ bàn phím
}) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const Wrapper = withKeyboard ? KeyboardAvoidingView : View;
  const wrapperProps = withKeyboard 
    ? { 
        behavior: Platform.OS === "ios" ? "padding" : "height", 
        style: { flex: 1 },
        // keyboardVerticalOffset thường cần bằng chiều cao Header + TabBar nếu có
        keyboardVerticalOffset: Platform.OS === "ios" ? 0 : 20 
      } 
    : { style: { flex: 1 } };

  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
        <Wrapper {...wrapperProps}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { 
                paddingBottom: keyboardHeight > 0 
                  ? 100
                  : insets.bottom + 20 
              },
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={stickyHeaderIndices}
          >
            {children}
          </ScrollView>
        </Wrapper>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
      <Wrapper {...wrapperProps}>
        <View style={[styles.content, { paddingBottom: insets.bottom }, contentStyle]}>
          {children}
        </View>
      </Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
});