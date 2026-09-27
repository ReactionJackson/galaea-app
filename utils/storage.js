import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEY = {
  CONTENT: "galaea/content",
  SETTINGS: "galaea/settings",
};

export async function loadContent(key, onLoad) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) onLoad(JSON.parse(raw));
  } catch {
    // best-effort — leave defaults in place
  }
}

export async function saveContent(key, content) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(content));
  } catch {
    // best-effort — a failed save shouldn't crash the app
  }
}
