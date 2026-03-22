import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";

export default function FriendsScreen() {
  return (
    <View style={styles.continer}>
      <ThemedText type="title">Friends</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  continer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
