import React from "react";

type OverlayProps = {
  message: string;
};

export const Overlay: React.FC<OverlayProps> = ({ message }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      fontWeight: "bold",
      zIndex: 10,
      pointerEvents: "none", // Prevents blocking clicks unless you want it to
    }}
  >
    {message}
  </div>
);
