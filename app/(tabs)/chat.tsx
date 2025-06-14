import { Image } from "expo-image";
import { StyleSheet } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import { NativeWindTest } from "@/components/NativeWindTest";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Chat & NativeWind Demo</ThemedText>
      </ThemedView>

      {/* NativeWind Test Component */}
      <NativeWindTest />

      <ThemedText>
        This tab demonstrates NativeWind integration with Tailwind CSS classes.
      </ThemedText>

      <Collapsible title="NativeWind Setup">
        <ThemedText>
          NativeWind has been successfully configured for this project. You can
          now use Tailwind CSS classes directly in your React Native components.
        </ThemedText>
        <ThemedText>
          The <ThemedText type="defaultSemiBold">AppCard</ThemedText> component
          and parts of the home screen have been converted to use NativeWind
          classes instead of StyleSheet.
        </ThemedText>
      </Collapsible>

      <Collapsible title="File-based routing">
        <ThemedText>
          This app has three screens:{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          (Store),{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/chat.tsx</ThemedText>{" "}
          (Chat), and{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{" "}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Tailwind CSS Classes">
        <ThemedText>
          With NativeWind, you can use familiar Tailwind classes like{" "}
          <ThemedText type="defaultSemiBold">flex-row</ThemedText>,{" "}
          <ThemedText type="defaultSemiBold">justify-center</ThemedText>,{" "}
          <ThemedText type="defaultSemiBold">bg-blue-500</ThemedText>, and{" "}
          <ThemedText type="defaultSemiBold">rounded-xl</ThemedText>.
        </ThemedText>
        <ThemedText>
          Custom colors from tailwind.config.js are also available: primary,
          secondary, and accent.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the
          web version, press <ThemedText type="defaultSemiBold">w</ThemedText>{" "}
          in the terminal running this project.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the{" "}
          <ThemedText type="defaultSemiBold">@2x</ThemedText> and{" "}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to
          provide files for different screen densities
        </ThemedText>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={{ alignSelf: "center" }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
