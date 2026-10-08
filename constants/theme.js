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
  background: "#fff",
  backgroundBlurTint: "rgba(255, 255, 255, 0.4)",
  lightboxCropBox: "rgba(255, 255, 255, 0.2)",
  surfaceTint: "rgba(0, 0, 0, 0.03)",
  emptySlotBackground: "rgba(0, 0, 0, 0.025)",
  thumbnailOverlay: "rgba(0, 0, 0, 0.075)",
  editButtonBackground: "rgba(255, 255, 255, 0.8)",
  selectedBorder: "rgba(255, 255, 255, 0.85)",
  accents: {
    red: "#f96156",
    green: "mediumseagreen",
    blue: "dodgerblue",
    yellow: "gold",
    purple: "rebeccapurple",
    orange: "darkorange",
    black: "#333",
  },
  tags: {
    default: {
      border: "#777",
      fill: "#eee",
    },
    green: {
      border: "#56ba40",
      fill: "#ddf1d9",
    },
    blue: {
      border: "#3f88e6",
      fill: "#d9e8fd",
    },
    yellow: {
      border: "#c7a000",
      fill: "#fde9b9",
    },
    purple: {
      border: "#9b59b6",
      fill: "#e8d5f0",
    },
    red: {
      border: "#e74c3c",
      fill: "#f5d7d5",
    },
    orange: {
      border: "#e8833a",
      fill: "#fde8d5",
    },
    pink: {
      border: "#d4427a",
      fill: "#f7d5e7",
    },
    teal: {
      border: "#2a9d8f",
      fill: "#d5f0ee",
    },
    lime: {
      border: "#7cb518",
      fill: "#e6f4c2",
    },
  },
};

Colors.button = {
  primary: {
    text: "white",
    fill: Colors.accents.red,
    border: Colors.buttonBorder,
  },
  secondary: {
    text: "black",
    fill: Colors.transparent,
    border: Colors.buttonBorder,
  },
  "secondary-dark": {
    text: "white",
    fill: Colors.transparent,
    border: Colors.overlayBorder,
  },
};

Colors.interactButton = {
  primary: {
    fill: Colors.accents.red,
    border: Colors.buttonBorder,
    icon: Colors.white,
  },
  secondary: {
    fill: Colors.editButtonBackground,
    border: Colors.tags.default.border,
    icon: Colors.tags.default.border,
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
