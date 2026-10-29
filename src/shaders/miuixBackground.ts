/**
 * 移植自 miuix (compose-miuix-ui/miuix)
 *   example/shared/.../component/effect/OS3BgFrag.kt
 *   Apache-2.0 License
 *
 * 改动仅限：
 *   1. SkSL 的 `vec4 main(vec2 fragCoord)` → GLSL ES 3.0 的 `void main()`
 *   2. 用 gl_FragCoord 还原 Skia 的左上原点坐标系
 *   3. `return` 改为写入 out 变量
 *   4. color.rgb /= color.a 加了除零保护
 * 其余算法（光点混合 / Perlin 调制饱和度 / 抖动）逐行保留。
 */
export const MIUIX_BG_FRAG = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uAnimTime;
uniform vec4 uBound;
uniform float uTranslateY;
uniform vec3 uPoints[4];
uniform vec2 uPointsAnim[4];
uniform vec4 uColors[4];
uniform float uAlphaMulti;
uniform float uNoiseScale;
uniform float uPointRadiusMulti;
uniform float uSaturateOffset;
uniform float uLightOffset;

out vec4 fragColor;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.13);
    p3 += dot(p3, p3.yzx + 3.333);
    return fract((p3.x + p3.y) * p3.z);
}

float perlin(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float gradientNoise(in vec2 uv) {
    return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715))));
}

void main() {
    vec2 fragCoord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);

    vec2 vUv = fragCoord / uResolution;
    vUv.y = 1.0 - vUv.y;
    vec2 uv = vUv;
    uv -= vec2(0.0, uTranslateY);
    uv.xy -= uBound.xy;
    uv.xy /= uBound.zw;

    vec4 color = vec4(0.0);
    float noiseValue = perlin(vUv * uNoiseScale + vec2(-uAnimTime, -uAnimTime));

    for (int i = 0; i < 4; i++) {
        vec4 pointColor = uColors[i];
        pointColor.rgb *= pointColor.a;
        vec2 point = uPointsAnim[i];
        float rad = uPoints[i].z * uPointRadiusMulti;

        float d = distance(uv, point);
        float pct = smoothstep(rad, 0.0, d);
        color.rgb = mix(color.rgb, pointColor.rgb, pct);
        color.a = mix(color.a, pointColor.a, pct);
    }

    float oppositeNoise = smoothstep(0.0, 1.0, noiseValue);
    color.rgb /= max(color.a, 1.0e-5);
    vec3 hsv = rgb2hsv(color.rgb);
    hsv.y = mix(hsv.y, 0.0, oppositeNoise * uSaturateOffset);
    color.rgb = hsv2rgb(hsv);
    color.rgb += oppositeNoise * uLightOffset;

    color.a = clamp(color.a, 0.0, 1.0);
    color.a *= uAlphaMulti;

    color += (10.0 / 255.0) * gradientNoise(fragCoord.xy) - (5.0 / 255.0);

    fragColor = vec4(color.rgb * color.a, color.a);
}
`

export interface BgPreset {
  points: number[]
  colors1: number[]
  colors2: number[]
  colors3: number[]
  colorInterpPeriod: number
  lightOffset: number
  saturateOffset: number
  pointOffset: number
}

/** 参数逐值取自 miuix BgEffectConfig.kt 的 OS3_PHONE_LIGHT / OS3_PHONE_DARK */
export const PRESETS: Record<'dark' | 'light', BgPreset> = {
  dark: {
    points: [0.8, 0.2, 1.0, 0.8, 0.9, 1.0, 0.2, 0.9, 1.0, 0.2, 0.2, 1.0],
    colors1: [
      0.2, 0.06, 0.88, 0.4, 0.3, 0.14, 0.55, 0.5, 0.0, 0.64, 0.96, 0.5, 0.11,
      0.16, 0.83, 0.4,
    ],
    colors2: [
      0.07, 0.15, 0.79, 0.5, 0.62, 0.21, 0.67, 0.5, 0.06, 0.25, 0.84, 0.5, 0.0,
      0.2, 0.78, 0.5,
    ],
    colors3: [
      0.58, 0.3, 0.74, 0.4, 0.27, 0.18, 0.6, 0.5, 0.66, 0.26, 0.62, 0.5, 0.12,
      0.16, 0.7, 0.6,
    ],
    colorInterpPeriod: 8.0,
    lightOffset: 0.0,
    saturateOffset: 0.17,
    pointOffset: 0.4,
  },
  light: {
    points: [0.8, 0.2, 1.0, 0.8, 0.9, 1.0, 0.2, 0.9, 1.0, 0.2, 0.2, 1.0],
    colors1: [
      1.0, 0.9, 0.94, 1.0, 1.0, 0.84, 0.89, 1.0, 0.97, 0.73, 0.82, 1.0, 0.64,
      0.65, 0.98, 1.0,
    ],
    colors2: [
      0.58, 0.74, 1.0, 1.0, 1.0, 0.9, 0.93, 1.0, 0.74, 0.76, 1.0, 1.0, 0.97,
      0.77, 0.84, 1.0,
    ],
    colors3: [
      0.98, 0.86, 0.9, 1.0, 0.6, 0.73, 0.98, 1.0, 0.92, 0.93, 1.0, 1.0, 0.56,
      0.69, 1.0, 1.0,
    ],
    colorInterpPeriod: 5.0,
    lightOffset: 0.1,
    saturateOffset: 0.2,
    pointOffset: 0.2,
  },
}

export const STATIC_UNIFORMS = {
  uTranslateY: 0,
  uAlphaMulti: 0.92,
  uNoiseScale: 1.5,
  uPointRadiusMulti: 1,
}

/** 对应 BgEffectPainter.colorsForCycleIndex：0→c2, 1→c1, 2→c2, 3→c3 */
export function colorsForCycleIndex(preset: BgPreset, index: number): number[] {
  const m = ((index % 4) + 4) % 4
  if (m === 1) return preset.colors1
  if (m === 3) return preset.colors3
  return preset.colors2
}
