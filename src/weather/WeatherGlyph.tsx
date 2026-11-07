import { useId } from 'react';
import { Circle, Defs, G, Line, LinearGradient, Mask, Path, Rect, Stop, Svg } from 'react-native-svg';

import type { SkyCondition } from '../types';
import type { SkyPalette } from '../lib/sky';

type WeatherGlyphProps = {
  condition: SkyCondition;
  isDay: boolean;
  palette: SkyPalette;
  size?: number;
};

const CLOUD_PATH =
  'M 34 132 C 20 132 11 121 11 108 C 11 94 22 84 36 84 C 40 62 58 45 81 45 C 102 45 120 58 127 77 C 132 73 139 71 146 71 C 164 71 179 86 179 104 C 179 120 166 132 150 132 Z';

const STARS = [
  { x: 42, y: 38, r: 2.2 },
  { x: 156, y: 48, r: 1.6 },
  { x: 171, y: 96, r: 1.3 },
  { x: 28, y: 93, r: 1.4 },
  { x: 139, y: 21, r: 1.4 },
  { x: 64, y: 70, r: 1.1 },
];

function rays(cx: number, cy: number, inner: number, outer: number, color: string, count = 8) {
  return Array.from({ length: count }, (_, index) => {
    const angle = ((index * 360) / count - 90) * (Math.PI / 180);
    return (
      <Line
        key={index}
        x1={cx + Math.cos(angle) * inner}
        y1={cy + Math.sin(angle) * inner}
        x2={cx + Math.cos(angle) * outer}
        y2={cy + Math.sin(angle) * outer}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  });
}

export function WeatherGlyph({ condition, isDay, palette, size = 160 }: WeatherGlyphProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const sunId = `sun-${uid}`;
  const cloudId = `cloud-${uid}`;
  const moonId = `moon-${uid}`;
  const moonMaskId = `moon-mask-${uid}`;
  const stormId = `storm-${uid}`;

  const showSun = condition === 'clear' || condition === 'partly';
  const showMoon = showSun && !isDay;
  const showCloud = !['clear'].includes(condition);
  const isStorm = condition === 'storms';
  const cloudY = condition === 'fog' ? 24 : isStorm ? -10 : 0;
  const cloudScale = condition === 'fog' ? 0.72 : condition === 'wind' ? 0.82 : 1;
  const cloudX = condition === 'wind' ? 24 : 0;

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id={sunId} x1="0" y1="0" x2="0.65" y2="1">
          <Stop offset="0" stopColor="#FFF8DF" />
          <Stop offset="0.45" stopColor={palette.light} />
          <Stop offset="1" stopColor={palette.accent} />
        </LinearGradient>
        <LinearGradient id={cloudId} x1="0" y1="0" x2="0.2" y2="1">
          <Stop offset="0" stopColor={palette.cloud} />
          <Stop offset="1" stopColor={palette.cloudShade} />
        </LinearGradient>
        <LinearGradient id={moonId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor={palette.accent} />
        </LinearGradient>
        <LinearGradient id={stormId} x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor="#FFF1B8" />
          <Stop offset="1" stopColor={palette.accent} />
        </LinearGradient>
        <Mask id={moonMaskId} x="0" y="0" width="200" height="200">
          <Rect x="0" y="0" width="200" height="200" fill="white" />
          <Circle cx="118" cy="76" r="42" fill="black" />
        </Mask>
      </Defs>

      {showSun ? (
        <G>
          <Circle cx={condition === 'partly' ? 130 : 100} cy={condition === 'partly' ? 70 : 98} r={74} fill={palette.glow} opacity={0.55} />
          <Circle cx={condition === 'partly' ? 130 : 100} cy={condition === 'partly' ? 70 : 98} r={63} stroke={palette.accent} strokeOpacity={0.16} strokeWidth={1} fill="none" />
          {!showMoon ? (
            <G opacity={condition === 'partly' ? 0.7 : 0.9}>
              {rays(
                condition === 'partly' ? 130 : 100,
                condition === 'partly' ? 70 : 98,
                condition === 'partly' ? 37 : 53,
                condition === 'partly' ? 47 : 66,
                palette.accent,
                condition === 'partly' ? 8 : 12,
              )}
            </G>
          ) : null}
          {showMoon ? (
            <G>
              <Circle cx="98" cy="96" r="46" fill={`url(#${moonId})`} mask={`url(#${moonMaskId})`} />
              {STARS.map((star, index) => (
                <Circle key={index} cx={star.x} cy={star.y} r={star.r} fill={palette.star} opacity={0.8} />
              ))}
            </G>
          ) : (
            <Circle
              cx={condition === 'partly' ? 130 : 100}
              cy={condition === 'partly' ? 70 : 98}
              r={condition === 'partly' ? 32 : 46}
              fill={`url(#${sunId})`}
            />
          )}
        </G>
      ) : null}

      {showCloud ? (
        <G transform={`translate(${cloudX}, ${cloudY}) scale(${cloudScale})`}>
          {condition === 'cloudy' || isStorm ? (
            <Path d={CLOUD_PATH} fill={palette.cloudShade} opacity={0.34} transform="translate(-14, -22) scale(0.9)" />
          ) : null}
          <Path d={CLOUD_PATH} fill={`url(#${cloudId})`} />
          <Path
            d="M 31 112 C 38 96 58 88 76 94 C 88 75 114 70 129 85 C 143 82 158 91 162 104"
            fill="none"
            stroke="white"
            strokeOpacity={0.27}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </G>
      ) : null}

      {condition === 'rain' ? (
        <G stroke={palette.rain} strokeWidth={4.2} strokeLinecap="round">
          <Line x1="68" y1="151" x2="62" y2="171" />
          <Line x1="100" y1="153" x2="94" y2="178" />
          <Line x1="132" y1="151" x2="126" y2="171" />
        </G>
      ) : null}

      {condition === 'storms' ? (
        <G>
          <Path
            d="M 105 139 L 84 170 L 100 170 L 90 194 L 124 158 L 107 158 L 118 139 Z"
            fill={`url(#${stormId})`}
          />
          <G stroke={palette.rain} strokeWidth={3.4} strokeLinecap="round" opacity={0.95}>
            <Line x1="62" y1="153" x2="57" y2="171" />
            <Line x1="139" y1="151" x2="134" y2="169" />
          </G>
        </G>
      ) : null}

      {condition === 'snow' ? (
        <G stroke={palette.rain} strokeWidth={3} strokeLinecap="round">
          {[64, 100, 136].map((cx, index) => (
            <G key={cx} opacity={index === 1 ? 1 : 0.8}>
              <Line x1={cx - 8} y1={index === 1 ? 167 : 160} x2={cx + 8} y2={index === 1 ? 167 : 160} />
              <Line x1={cx} y1={index === 1 ? 157 : 150} x2={cx} y2={index === 1 ? 177 : 170} />
              <Line x1={cx - 6} y1={index === 1 ? 161 : 154} x2={cx + 6} y2={index === 1 ? 173 : 166} />
              <Line x1={cx + 6} y1={index === 1 ? 161 : 154} x2={cx - 6} y2={index === 1 ? 173 : 166} />
            </G>
          ))}
        </G>
      ) : null}

      {condition === 'sleet' ? (
        <G stroke={palette.rain} strokeWidth={3.3} strokeLinecap="round">
          <Line x1="66" y1="154" x2="61" y2="174" />
          <Line x1="134" y1="154" x2="129" y2="174" />
          <G opacity={0.95}>
            <Line x1="92" y1="174" x2="108" y2="174" />
            <Line x1="100" y1="166" x2="100" y2="182" />
            <Line x1="94" y1="168" x2="106" y2="180" />
            <Line x1="106" y1="168" x2="94" y2="180" />
          </G>
        </G>
      ) : null}

      {condition === 'fog' ? (
        <G stroke={palette.rain} strokeLinecap="round">
          <Line x1="34" y1="143" x2="166" y2="143" strokeWidth={6} opacity={0.8} />
          <Line x1="48" y1="161" x2="152" y2="161" strokeWidth={5} opacity={0.55} />
          <Line x1="60" y1="179" x2="140" y2="179" strokeWidth={4} opacity={0.35} />
        </G>
      ) : null}

      {condition === 'wind' ? (
        <G stroke={palette.accent} strokeWidth={4.6} strokeLinecap="round" fill="none" opacity={0.9}>
          <Path d="M 34 154 C 56 154 60 136 47 130 C 36 125 29 136 35 143" />
          <Path d="M 70 171 C 108 171 126 154 112 144 C 101 136 92 145 98 152" />
          <Path d="M 117 188 C 145 188 161 178 166 166" opacity={0.55} />
        </G>
      ) : null}
    </Svg>
  );
}
