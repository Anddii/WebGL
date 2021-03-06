varying highp vec2 vTextureCoord;
varying highp vec4 vColor;
varying highp vec3 vNormal;
varying highp vec3 vFragPos;
varying highp vec4 vFragPosLightSpace;

uniform highp vec3 uLightPosition;
uniform highp vec3 uCameraPosition;
uniform sampler2D uSampler;   
uniform sampler2D uShadowMap;

highp float ShadowCalculation(highp vec4 fragPosLightSpace, highp vec3 lightDir)
{
      // perform perspective divide
      highp vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
      // transform to [0,1] range
      projCoords = projCoords * 0.5 + 0.5;
      // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
      highp float closestDepth = texture2D(uShadowMap, projCoords.xy).r; 
      // get depth of current fragment from light's perspective
      highp float currentDepth = projCoords.z;

      highp float bias = max(1.0*(0.1-dot(vNormal, lightDir)), 0.0);
      // check whether current frag pos is in shadow
      highp float shadow = 0.0;
      highp vec2 texelSize = vec2(3)/vec2(2024,2024);
      for(int x = -1; x <= 1; ++x)
      {
            for(int y = -1; y <= 1; ++y)
            {
                  highp float pcfDepth = texture2D(uShadowMap, projCoords.xy + vec2(x, y) * texelSize).r; 
                  shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;        
            }    
      }
      shadow /= 10.0;
      return shadow;
} 
void main(void) {

      highp vec3 color = texture2D(uSampler, vTextureCoord).xyz*vColor.xyz;
      highp vec3 normal = normalize(vNormal);
      highp vec3 lightColor = vec3(.3);

      //ambient
      highp vec3 ambient = 0.7 * color;

      // diffuse
      highp vec3 lightPos = uLightPosition;
      highp vec3 lightDir = normalize(lightPos);
      highp float diff = max(dot(lightDir, normal), 0.0);
      highp vec3 diffuse = diff * lightColor;

      // specular
      highp vec3 viewDir = normalize(uCameraPosition - vFragPos);
      highp float spec = 0.0;
      highp vec3 halfwayDir = normalize(lightDir + viewDir);  
      spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0)*0.8;
      highp vec3 specular = spec * lightColor;

      highp float shadow = ShadowCalculation(vFragPosLightSpace, lightDir); 

      
      // highp vec3 lighting = ((ambient+(vec3(1)-vec3(shadow))) * (specular + diffuse)) * color;
      highp vec3 lighting = (ambient + specular*(vec3(1)-shadow) + diffuse*(vec3(1)-shadow)) * color;

      gl_FragColor = vec4(lighting, texture2D(uSampler, vTextureCoord).a*vColor.a);
}