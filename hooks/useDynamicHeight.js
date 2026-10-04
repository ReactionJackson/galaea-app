import { useState } from "react";

export const useDynamicHeight = (stubHeight) => {
  const [dynamicHeight, setDynamicHeight] = useState(stubHeight);

  const onLayout = (e) => {
    const next = e.nativeEvent.layout.height;
    if (next > 0 && next !== dynamicHeight) setDynamicHeight(next);
  };

  return { dynamicHeight, onLayout };
};
