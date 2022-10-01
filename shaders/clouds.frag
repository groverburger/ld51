precision mediump float;

uniform sampler2D texture;
uniform vec2 offset;
uniform float scale;
uniform vec4 color;
uniform float cutoff;

varying vec2 uv;
varying vec4 worldPosition;

void main() {
  vec4 result = texture2D(texture, worldPosition.xy*scale + offset);
  if (result.a <= 0.5) { discard; }
  if ((result.r + result.g + result.b) / 3.0 < cutoff) { discard; }
  gl_FragColor = color;
}
