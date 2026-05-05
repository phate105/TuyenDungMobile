import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import { COLORS, RADII } from "../../constants/theme";
import { jobService } from "../../services/jobService";
import { searchHistoryService } from "../../services/searchHistoryService";

export default function SearchScreen({ navigation, route }) {
  const inputRef = useRef(null);
  const initialKeyword = route.params?.keyword || "";
  const [keyword, setKeyword] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const trimmedKeyword = keyword.trim();
  const isTyping = trimmedKeyword.length > 0;

  useFocusEffect(
    useCallback(() => {
      setKeyword(initialKeyword);
      loadRecentSearches();
      const timer = setTimeout(() => inputRef.current?.focus(), 120);

      return () => clearTimeout(timer);
    }, [initialKeyword])
  );

  useEffect(() => {
    let mounted = true;

    if (!trimmedKeyword) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const results = await jobService.getSearchSuggestions(trimmedKeyword);

        if (mounted) {
          setSuggestions(results);
        }
      } finally {
        if (mounted) {
          setLoadingSuggestions(false);
        }
      }
    }, 220);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [trimmedKeyword]);

  async function loadRecentSearches() {
    const history = await searchHistoryService.getSearchHistory();
    setRecentSearches(history);
  }

  async function runSearch(value = keyword) {
    const nextKeyword = value.trim();

    if (!nextKeyword) {
      return;
    }

    const nextHistory = await searchHistoryService.addSearchHistory(nextKeyword);
    setRecentSearches(nextHistory);
    navigation.navigate("SearchResult", { keyword: nextKeyword });
  }

  async function removeRecentSearch(keywordToRemove) {
    const nextHistory = await searchHistoryService.removeSearchHistory(keywordToRemove);
    setRecentSearches(nextHistory);
  }

  async function clearRecentSearches() {
    const nextHistory = await searchHistoryService.clearSearchHistory();
    setRecentSearches(nextHistory);
  }

  function handleSelectKeyword(value) {
    setKeyword(value);
    runSearch(value);
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.searchHeader}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons color={COLORS.text} name="chevron-back" size={24} />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons color={COLORS.muted} name="search-outline" size={18} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setKeyword}
            onSubmitEditing={() => runSearch()}
            placeholder="Tìm kiếm công việc, công ty..."
            placeholderTextColor={COLORS.mutedLight}
            ref={inputRef}
            returnKeyType="search"
            style={styles.input}
            value={keyword}
          />
          {isTyping ? (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setKeyword("")}>
              <Ionicons color={COLORS.muted} name="close-circle" size={18} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isTyping ? (
        <SuggestionSection
          loading={loadingSuggestions}
          suggestions={suggestions}
          onSelect={handleSelectKeyword}
        />
      ) : (
        <RecentSection
          items={recentSearches}
          onClear={clearRecentSearches}
          onRemove={removeRecentSearch}
          onSelect={handleSelectKeyword}
        />
      )}
    </Screen>
  );
}

function RecentSection({ items, onClear, onRemove, onSelect }) {
  if (items.length === 0) {
    return <Text style={styles.emptyText}>Chưa có tìm kiếm gần đây</Text>;
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderTitle}>Tìm kiếm gần đây</Text>
        <TouchableOpacity activeOpacity={0.75} onPress={onClear}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <Pressable
          key={item}
          onPress={() => onSelect(item)}
          style={({ pressed }) => [styles.listRow, pressed && styles.pressedRow]}
        >
          <View style={styles.rowLeft}>
            <Ionicons color={COLORS.muted} name="time-outline" size={18} />
            <Text numberOfLines={1} style={styles.rowTitle}>
              {item}
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.6} hitSlop={8} onPress={() => onRemove(item)}>
            <Ionicons color={COLORS.mutedLight} name="close" size={18} />
          </TouchableOpacity>
        </Pressable>
      ))}
    </View>
  );
}

function SuggestionSection({ loading, suggestions, onSelect }) {
  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator color={COLORS.action} />
        <Text style={styles.mutedText}>Đang tìm gợi ý...</Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View>
      <Text style={styles.suggestionTitle}>Gợi ý tìm kiếm</Text>
      {suggestions.map((item) => (
        <Pressable
          key={`${item.type}-${item.text}`}
          onPress={() => onSelect(item.text)}
          style={({ pressed }) => [styles.suggestionRow, pressed && styles.pressedRow]}
        >
          <View style={styles.rowLeft}>
            <View style={styles.rowIconWrap}>
              <Ionicons color={COLORS.muted} name={getSuggestionIcon(item.type)} size={18} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text numberOfLines={1} style={styles.rowTitle}>
                {item.text}
              </Text>
              <Text numberOfLines={1} style={styles.rowSubtitle}>
                {item.description}
              </Text>
            </View>
          </View>
          <View style={styles.trailingIconWrap}>
            <Ionicons color={COLORS.mutedLight} name="arrow-up-outline" size={16} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function getSuggestionIcon(type) {
  const iconNames = {
    category: "grid-outline",
    company: "business-outline",
    job: "briefcase-outline",
    location: "location-outline",
  };

  return iconNames[type] || "search-outline";
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.surface,
  },
  searchHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 28,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    flex: 1,
    gap: 9,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6,
    paddingTop: 8,
  },
  sectionHeaderTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  suggestionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    paddingBottom: 6,
    paddingTop: 8,
  },
  clearText: {
    color: COLORS.action,
    fontSize: 13,
    fontWeight: "600",
  },
  listRow: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 2,
    paddingVertical: 9,
  },
  suggestionRow: {
    alignItems: "flex-start",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 2,
    paddingVertical: 11,
  },
  rowLeft: {
    alignItems: "flex-start",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  rowIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
    width: 20,
  },
  rowTextWrap: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  rowSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  trailingIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
    paddingLeft: 10,
    width: 28,
  },
  pressedRow: {
    backgroundColor: COLORS.surfaceMuted,
  },
  centerBox: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 28,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    paddingTop: 8,
  },
});
