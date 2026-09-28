const FLOW = /* glsl */ `
// Analytic curl of a trig potential: divergence-free, so particles swirl instead of clumping.
vec3 curlOctave(vec3 p, float t) {
  float ay = p.y * 1.1 + t;        float az = p.z * 0.9 - t * 0.7;
  float bz = p.z * 1.3 + t * 0.8;  float bx = p.x * 0.7 - t * 0.6;
  float cx = p.x * 1.2 + t * 0.9;  float cy = p.y * 0.8 - t * 1.1;
  float dAdy = 1.1 * cos(ay) * cos(az);
  float dAdz = -0.9 * sin(ay) * sin(az);
  float dBdz = 1.3 * cos(bz) * cos(bx);
  float dBdx = -0.7 * sin(bz) * sin(bx);
  float dCdx = 1.2 * cos(cx) * cos(cy);
  float dCdy = -0.8 * sin(cx) * sin(cy);
  return vec3(dCdy - dBdz, dAdz - dCdx, dBdx - dAdy);
}

vec3 flowField(vec3 p, float t) {
  return curlOctave(p, t) + curlOctave(p * 2.1 + vec3(1.7, 9.2, 3.3), t * 1.4) * 0.45;
}
`;

export const velocityShader = /* glsl */ `
uniform float uTime;
uniform float uDelta;
uniform float uMotion;
uniform vec3 uPointer;
uniform vec3 uPointerVel;
uniform float uPointerActive;
uniform float uGravity;
uniform float uHold;
uniform vec4 uShock;
uniform float uShockPower;
uniform float uLaunch;
uniform sampler2D uShapeA;
uniform sampler2D uShapeB;
uniform vec3 uOffsetA;
uniform vec3 uOffsetB;
uniform vec2 uSpinA;
uniform vec2 uSpinB;
uniform vec3 uScaleA;
uniform vec3 uScaleB;
uniform float uMorph;
uniform float uStrength;
uniform float uFlow;
uniform vec3 uBounds;

${FLOW}

vec3 orient(vec3 p, vec2 spin, vec3 scale) {
  float cy = cos(spin.x), sy = sin(spin.x);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cz = cos(spin.y), sz = sin(spin.y);
  p = vec3(cz * p.x - sz * p.y, sz * p.x + cz * p.y, p.z);
  return p * scale;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 p4 = texture2D(texturePosition, uv);
  vec4 v4 = texture2D(textureVelocity, uv);
  vec3 pos = p4.xyz;
  vec3 vel = v4.xyz;
  float dt = uDelta * uMotion;
  float mass = mix(0.55, 1.45, fract(p4.w * 7.13));

  vec4 sa = texture2D(uShapeA, uv);
  vec4 sb = texture2D(uShapeB, uv);
  vec3 target = mix(orient(sa.xyz, uSpinA, uScaleA) + uOffsetA, orient(sb.xyz, uSpinB, uScaleB) + uOffsetB, uMorph);
  float member = mix(sa.w, sb.w, uMorph);

  // Relax toward a divergence-free flow velocity: dust drifts along streamlines without clumping into voids.
  vec3 flowVel = flowField(pos * 0.22, uTime * 0.12) * uFlow * 0.45;
  vec3 acc = (flowVel - vel) * 0.8 * (1.0 - member * 0.75);

  vec3 toC = uPointer - pos;
  float d2 = dot(toC, toC);
  float d = sqrt(d2) + 1e-4;
  vec3 dir = toC / d;
  float reach = 3.4 + uHold * 3.0;
  float near = 1.0 - smoothstep(0.0, reach, d);
  near *= near;
  float G = uGravity * uPointerActive;
  acc += dir * (G * mass / (d2 + 0.45)) * near;
  acc += vec3(-dir.y, dir.x, 0.0) * (G * 0.9 / (d + 0.6)) * near;
  float horizon = 0.32 + uHold * 0.22;
  acc -= dir * (1.0 - smoothstep(0.0, horizon, d)) * 60.0 * uPointerActive;
  acc += uPointerVel * near * 2.2 * uPointerActive;

  float spring = uStrength * member * (1.0 - near * 0.9 * uPointerActive);
  acc += (target - pos) * spring;
  acc -= vel * spring * 0.35;

  if (uShock.w >= 0.0) {
    vec3 fromS = pos - uShock.xyz;
    float ds = length(fromS) + 1e-4;
    float band = exp(-pow((ds - uShock.w * 10.0) / 1.1, 2.0));
    acc += (fromS / ds) * band * exp(-uShock.w * 1.8) * uShockPower * mass;
  }

  vec3 over = max(abs(pos) - uBounds, 0.0) * sign(pos);
  acc -= over * 2.0;

  vel += acc * dt;
  vel -= dir * uLaunch * uMotion * (1.0 - smoothstep(0.0, reach * 1.8, d)) * mass;
  vel *= exp(-dt * (0.5 + member * uStrength * 0.1));
  float speed = length(vel);
  if (speed > 18.0) vel *= 18.0 / speed;

  gl_FragColor = vec4(vel, member);
}
`;

export const positionShader = /* glsl */ `
uniform float uDelta;
uniform float uMotion;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 p4 = texture2D(texturePosition, uv);
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  gl_FragColor = vec4(p4.xyz + vel * uDelta * uMotion, p4.w);
}
`;

export const pointsVertex = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uVel;
uniform float uSize;
uniform float uScale;
uniform float uOpacity;
uniform vec3 uPointer;
uniform float uPointerActive;
attribute vec2 aRef;
attribute float aRand;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec4 p = texture2D(uPos, aRef);
  vec4 v4 = texture2D(uVel, aRef);
  vec3 v = v4.xyz;
  vec4 mv = modelViewMatrix * vec4(p.xyz, 1.0);
  gl_Position = projectionMatrix * mv;

  float speed = length(v);
  float depth = -mv.z;
  float rSize = fract(aRand * 5.31);
  float rTint = fract(aRand * 91.7);
  float star = step(0.986, fract(aRand * 13.37));
  float size = uSize * (0.6 + 1.2 * pow(rSize, 4.0)) * (1.0 + star * 1.6) * (1.0 + clamp(speed * 0.05, 0.0, 0.7));
  gl_PointSize = max(size * uScale * (16.0 / depth), 1.0);

  vec3 white = vec3(0.94, 0.95, 1.0);
  vec3 blue = vec3(0.4, 0.58, 1.0);
  vec3 violet = vec3(0.66, 0.52, 1.0);
  vec3 tint = mix(blue, violet, fract(aRand * 37.0));
  float highlight = step(0.955, rTint) * 0.8;
  float heat = smoothstep(4.0, 14.0, speed) * 0.55;
  vec3 col = mix(white, tint, max(highlight, heat));
  float core = 1.0 - smoothstep(0.0, 1.8, length(p.xyz - uPointer));
  col += blue * 0.3 * core * uPointerActive;
  vColor = col;

  float dust = mix(0.42, 1.0, v4.w);
  vAlpha = mix(0.3, 0.85, aRand) * dust * (1.0 + star) * smoothstep(34.0, 11.0, depth) * uOpacity;
}
`;

export const pointsFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float r = length(gl_PointCoord - 0.5);
  float glow = smoothstep(0.5, 0.0, r);
  float a = (pow(glow, 3.0) + pow(glow, 1.2) * 0.25) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor, a);
}
`;
