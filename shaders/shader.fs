varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;
varying lowp vec3 vNormal;
varying lowp vec3 vFragPos;
varying lowp vec4 vFragPosLightSpace;

uniform sampler2D uSampler;
uniform sampler2D uShadowMap;


highp float ShadowCalculation(highp vec4 fragPosLightSpace)
{
      // perform perspective divide
      highp vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
      // transform to [0,1] range
      projCoords = projCoords * 0.5 + 0.5;
      // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
      highp float closestDepth = texture2D(uShadowMap, projCoords.xy).r; 
      // get depth of current fragment from light's perspective
      highp float currentDepth = projCoords.z;

      highp float bias = -0.00005;
      // check whether current frag pos is in shadow
      highp float shadow = 0.0;
      highp vec2 texelSize = vec2(1)/vec2(2048,2048);
      for(int x = -1; x <= 1; ++x)
      {
            for(int y = -1; y <= 1; ++y)
            {
                  highp float pcfDepth = texture2D(uShadowMap, projCoords.xy + vec2(x, y) * texelSize).r; 
                  shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;        
            }    
      }
      shadow /= 9.0;
      return shadow;
} 
void main(void) {

      highp vec3 color = texture2D(uSampler, vTextureCoord).xyz*vColor.xyz;
      highp vec3 normal = normalize(vNormal);
      highp vec3 lightColor = vec3(0.5);

      //ambient
      highp vec3 ambient = 0.7 * color;

      // diffuse
      highp vec3 lightPos = vec3(2,2,0);
      highp vec3 lightDir = normalize(lightPos-vFragPos);
      highp float diff = max(dot(lightDir, normal), 0.0);
      highp vec3 diffuse = diff * lightColor;

      highp float shadow = ShadowCalculation(vFragPosLightSpace); 
      highp vec3 lighting = ambient+(vec3(1)-vec3(shadow)) * (diffuse * color);
      
      gl_FragColor = vec4(lighting, texture2D(uSampler, vTextureCoord).a*vColor.a);
}