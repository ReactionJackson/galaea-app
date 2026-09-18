import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "galaea/state/v3";

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
