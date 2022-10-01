precision mediump float;

uniform sampler2D texture;
uniform vec4 color;

varying vec2 uv;
varying vec3 normal;

void main() {
  vec4 result = texture2D(texture, uv) * color;
  //result.rgb *= mix(0.25, 1.0, normal.z/2.0 + 0.5);
  //result.rgb *= mix(0.25, 1.0, normal.z/2.0 + 0.5);
  result.rgb *= max(normal.z, mix(0.5, 1.0, normal.x/2.0 + 0.5));
  if (result.a == 0.0) { discard; }
  gl_FragColor = result;
}
