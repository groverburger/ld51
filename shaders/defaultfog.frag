precision mediump float;
// #extension GL_OES_standard_derivatives : enable

varying vec2 uv;
varying vec3 normal;
varying vec3 origNormal;
varying vec4 worldPosition;
varying vec4 viewPosition;

uniform sampler2D texture;
uniform vec4 color;
uniform vec3 fogColor;
uniform float fogDensity;
uniform int useAlphaAsEmission;

void main() {
    // Get diffuse color from texture
    vec4 diffuse = texture2D(texture, uv) * color;
    if (diffuse.a == 0.0 && useAlphaAsEmission == 0) { discard; }

    // Apply basic shading
    vec4 shaded = vec4(diffuse.rgb * max(origNormal.z, mix(0.25, 1.0, origNormal.x/2.0 + 0.5)), diffuse.a);

    // Calculate the distance from the camera to the fragment position
    float distance = length(viewPosition.xyz);

    // Calculate the fog factor based on the distance and fog density
    float fogFactor = (log(distance*0.01)/(1.0/fogDensity)) * 1.13;
    fogFactor = min(fogFactor, 1.0);
    fogFactor = max(fogFactor, 0.0);

    // Apply the fog effect by blending the fragment color with the fog color
    vec4 fogColor = vec4(fogColor.rgb, 1.0);
    vec4 result = mix(shaded, fogColor, fogFactor);

    // Apply emission
    if (useAlphaAsEmission != 0) {
        result = mix(result, diffuse, 1.0-diffuse.a);
        result.a = 1.0;
    }

    gl_FragColor = result;
}