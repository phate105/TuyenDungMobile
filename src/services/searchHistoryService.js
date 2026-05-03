import AsyncStorage from "@react-native-async-storage/async-storage";

const SEARCH_HISTORY_KEY = "vietjob.searchHistory";
const MAX_HISTORY_ITEMS = 8;

function normalizeKeyword(keyword) {
  return String(keyword || "").trim();
}

export async function getSearchHistory() {
  const rawHistory = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);

  if (!rawHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(rawHistory);
    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch {
    return [];
  }
}

export async function addSearchHistory(keyword) {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return [];
  }

  const currentHistory = await getSearchHistory();
  const nextHistory = [
    normalizedKeyword,
    ...currentHistory.filter(
      (item) => item.toLowerCase() !== normalizedKeyword.toLowerCase()
    ),
  ].slice(0, MAX_HISTORY_ITEMS);

  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}

export async function removeSearchHistory(keyword) {
  const normalizedKeyword = normalizeKeyword(keyword);
  const currentHistory = await getSearchHistory();
  const nextHistory = currentHistory.filter(
    (item) => item.toLowerCase() !== normalizedKeyword.toLowerCase()
  );

  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}

export async function clearSearchHistory() {
  await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  return [];
}

export const searchHistoryService = {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
};
