import { css } from "styled-components/native";

export const Colors = {
  transparent: "transparent",
  white: "#fff",
  black: "#000",
  title: "#000",
  text: "#777",
  border: "#e2e2e2",
  faded: "rgba(0, 0, 0, 0.6)",
  disabled: "rgba(0, 0, 0, 0.1)",
  buttonBorder: "rgba(0, 0, 0, 0.1)",
  placeholder: "rgba(0, 0, 0, 0.25)",
  overlay: "rgba(0, 0, 0, 0.9)",
  overlayBorder: "rgba(255, 255, 255, 0.6)",
  imageOverlay: "rgba(0, 0, 0, 0.45)",
  accent: "#f96156",
  accentFaded: "rgba(249, 97, 86, 0.2)",
  background: "#fff",
  backgroundBlurTint: "rgba(255, 255, 255, 0.4)",
  lightboxCropBox: "rgba(255, 255, 255, 0.2)",
  surfaceTint: "rgba(0, 0, 0, 0.03)",
  emptySlotBackground: "rgba(0, 0, 0, 0.02)",
  thumbnailOverlay: "rgba(0, 0, 0, 0.075)",
  editButtonBackground: "rgba(255, 255, 255, 0.8)",
  selectedBorder: "rgba(255, 255, 255, 0.85)",
  tags: {
    default: {
      primary: "#777",
      secondary: "#eee",
    },
    disabled: {
      primary: "rgba(0, 0, 0, 0.1)",
      secondary: "rgba(0, 0, 0, 0.025)",
    },
    green: {
      primary: "#56ba40",
      secondary: "#ddf1d9",
    },
    blue: {
      primary: "#3f88e6",
      secondary: "#d9e8fd",
    },
    yellow: {
      primary: "#c7a000",
      secondary: "#fde9b9",
    },
    purple: {
      primary: "#9b59b6",
      secondary: "#e8d5f0",
    },
    red: {
      primary: "#e74c3c",
      secondary: "#f5d7d5",
    },
    orange: {
      primary: "#e8833a",
      secondary: "#fde8d5",
    },
    pink: {
      primary: "#d4427a",
      secondary: "#f7d5e7",
    },
    teal: {
      primary: "#2a9d8f",
      secondary: "#d5f0ee",
    },
    lime: {
      primary: "#7cb518",
      secondary: "#e6f4c2",
    },
  },
};

Colors.button = {
  primary: {
    text: Colors.white,
    fill: Colors.accent,
    border: Colors.buttonBorder,
  },
  secondary: {
    text: Colors.black,
    fill: Colors.transparent,
    border: Colors.buttonBorder,
  },
  "secondary-dark": {
    text: Colors.white,
    fill: Colors.transparent,
    border: Colors.overlayBorder,
  },
};

Colors.interactButton = {
  primary: {
    fill: Colors.accent,
    border: Colors.buttonBorder,
    icon: Colors.white,
  },
  secondary: {
    fill: Colors.editButtonBackground,
    border: Colors.tags.default.primary,
    icon: Colors.tags.default.primary,
  },
};

export const Fonts = {
  regular: "Outfit400",
  medium: "Outfit500",
  semibold: "Outfit600",
  bold: "Outfit700",
};

export function cardShadow(radius = 8, opacity = 0.12) {
  return css`
    shadow-color: ${Colors.black};
    shadow-offset: 0px 0px;
    shadow-opacity: ${opacity};
    shadow-radius: ${radius}px;
  `;
}

export function collectionCardColor(color) {
  return color && color !== "default" ? color : Colors.white;
}
