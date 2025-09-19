import React from "react";
import { Image } from "react-native";
import { MARKER_SIZE, FOOT_H, WALL_H } from "../../utils/iso";
import type { Marker } from "../../types/forest";

const MARKER_IMG = require("../../../assets/models/tree.png");

type Props = { markers: Marker[] };

export default function MarkersLayer({ markers }: Props) {
  return (
    <>
      {markers.map((m) => (
        <Image
          key={`marker-${m.x}-${m.z}`}
          source={MARKER_IMG}
          style={{
            position: "absolute",
            left: m.sx - MARKER_SIZE / 2,
            top: m.sy - FOOT_H / 2 - WALL_H - MARKER_SIZE / 2 - 2,
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            resizeMode: "contain",
          }}
          pointerEvents="none"
        />
      ))}
    </>
  );
}
