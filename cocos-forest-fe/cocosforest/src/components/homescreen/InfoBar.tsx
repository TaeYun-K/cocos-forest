import React from "react";
import { View, Text } from "react-native";
import { homeStyles as s } from "../../styles/homeStyles";

type Props = { points: string; growth: string };

export default function InfoBar({ points, growth }: Props) {
  return (
    <View style={s.infoBar}>
      <View style={s.infoBlock}>
        <Text style={s.infoLabel}>💰 보유 포인트</Text>
        <Text style={s.infoValue}>{points}</Text>
      </View>
      <View style={s.infoDivider} />
      <View style={s.infoBlock}>
        <Text style={s.infoLabel}>🌱 숲 성장률</Text>
        <Text style={[s.infoValue, s.growthValue]}>{growth}%</Text>
      </View>
    </View>
  );
}

