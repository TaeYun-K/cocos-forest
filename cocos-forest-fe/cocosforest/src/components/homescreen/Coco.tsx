import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { homeStyles as s } from "../../styles/homeStyles";
import { useUIStore } from "../../store/homeStore";

const COCO_IMG = require("../../../assets/coco.png");

export default function Coco() {
  const showCocoTip = useUIStore((st) => st.showCocoTip);
  const toggleCocoTip = useUIStore((st) => st.toggleCocoTip);

  return (
    <View style={s.cocoRow}>
      <Pressable
        onPress={toggleCocoTip}
        style={s.cocoBtn}
        accessibilityLabel="코코 말풍선 토글"
      >
        <Image source={COCO_IMG} style={s.cocoImg} />
      </Pressable>
      {showCocoTip && (
        <View style={s.bubbleWrap}>
          <View style={s.bubble}>
            <Text style={s.bubbleText}>
              음식물 쓰레기를 줄이면 메탄가스 배출을 크게 감소시킬 수 있어요! 🥬
            </Text>
          </View>
          <View style={s.bubbleTail} />
        </View>
      )}
    </View>
  );
}
