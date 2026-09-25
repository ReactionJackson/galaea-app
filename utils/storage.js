import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "galaea/state/v3";
export const CONTENT_STORAGE_KEY = "galaea/content";

export async function loadPersistedState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function savePersistedState(persistable) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    // Best-effort — a failed save shouldn't crash the app.
  }
}

export async function loadContent() {
  try {
    const raw = await AsyncStorage.getItem(CONTENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveContent(content) {
  try {
    await AsyncStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
  } catch {
    // Best-effort — a failed save shouldn't crash the app.
  }
}
