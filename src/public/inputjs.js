const L=[9,7,9,4,0,4,-3,null,9,7,9,4,0,4,-3,null,9,11,12,11,12,9,11,9,11,7,9,7,9,5,9,null,9,7,9,4,0,4,-3,null],N=[null,null,-1,null,-8,null,-1,null,-8,null,-1,null,-8,null,-1,null,-8,null,-1,null,-8,null,-3,null,-10,null,-5,null-12,null,-5,null-12,null,-1,null,-8,null,-1,null,-8,null,-1,null,-8,null];function B(c){return 440*Math.pow(2,(c-69)/12)}class g{constructor(n){this.actx=n,this.out=this.comp(),this.out.connect(n.destination),this.A=0,this.D=.75,this.S=0,this.R=0,this.notes={}}envelope(n,r,t,o){this.A=n,this.D=r,this.S=t,this.R=o}osc(n,r,t=0){let o=this.actx.createOscillator();return o.type=n,o.frequency.value=r,o.detune.value=t,o.start(),o}amp(){let n=this.actx.createGain();return n.gain.value=0,n}comp(){let n=this.actx.createDynamicsCompressor();return n.threshold.value=0,n.knee.value=20,n.ratio.value=5,n.attack.value=0,n.release.value=.24,n}play(n,r,t,o=1,a="sawtooth"){if(!n)return;let i=B(n);console.log(i);let l=this.A*t,m=this.D*t,T=this.R*t,E=this.osc(a,i,0),A=this.amp();A.gain.setValueAtTime(0,r),A.connect(this.out),E.connect(A),A.gain.linearRampToValueAtTime(o,r+l),A.gain.linearRampToValueAtTime(0,r+l+m+T),E.stop(r+l+m+T)}}var M=`#version 300 es 

precision highp float;\r
uniform sampler2D u_texture;\r
uniform vec2 iResolution;\r
uniform float iTime;\r
in vec2 vUv;\r
out vec4 fragColor;\r
uniform int boardstate[64];

#define MAX_STEPS 70

const float frameCount = 8.0; \r
const float pixelsPrFrame = 16.0; \r
float pixelsX = frameCount * pixelsPrFrame; 

float sdSphere(vec3 p, float radius) {\r
  return length(p-1.5-sin(iTime)*1.0+vec3(sin(iTime),0.0,0.0)) - radius;\r
}\r
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}\r
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}\r
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){\r
    vec3 a = floor(p);\r
    vec3 d = p - a;\r
    d = d * d * (3.0 - 2.0 * d);\r
    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);\r
    vec4 k1 = perm(b.xyxy);\r
    vec4 k2 = perm(k1.xyxy + b.zzww);\r
    vec4 c = k2 + a.zzzz;\r
    vec4 k3 = perm(c);\r
    vec4 k4 = perm(c + 1.0);\r
    vec4 o1 = fract(k3 * (1.0 / 41.0));\r
    vec4 o2 = fract(k4 * (1.0 / 41.0));\r
    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);\r
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);\r
    return o4.y * d.y + o4.x * (1.0 - d.y);\r
}

float fbm(vec3 p) {\r
  vec3 q = p + iTime * 0.5 * vec3(1.0, -0.2, -1.0);\r
  float g = noise(q);

  float f = 0.0;\r
  float scale = 0.5;\r
  float factor = 2.02;

  for (int i = 0; i < 6; i++) {\r
      f += scale * noise(q);\r
      q *= factor;\r
      factor += 0.21;\r
      scale *= 0.5;\r
  }

  return f;\r
}

float scene(vec3 p) {\r
  float distance = sdSphere(p, 1.0);

  float f = fbm(p);

  return -distance + f;\r
}

const float MARCH_SIZE = 0.08;

vec4 raymarch(vec3 rayOrigin, vec3 rayDirection) {\r
  float depth = 0.0;\r
  vec3 p = rayOrigin + depth * rayDirection;\r
  \r
  vec4 res = vec4(0.0);

  for (int i = 0; i < MAX_STEPS; i++) {\r
    float density = scene(p);

    if (density > 0.0) {\r
      vec4 color = vec4(mix(vec3(1.0,1.0,1.0), vec3(0.0, sin(iTime), 0.0), density), density );\r
      color.rgb *= color.a;\r
      res += color*(1.0-res.a);\r
    }

    depth += MARCH_SIZE;\r
    p = rayOrigin + depth * rayDirection;\r
  }

  return res;\r
}

void main() {\r
    vec3 ro = vec3(0.0, 0.0, 5.0);

    vec2 uv = vUv.xy;\r
    uv += 1.0; \r
    uv *= 0.5; \r
    uv.y = 1.0 - uv.y;\r
    float frame = float(boardstate[0]);\r
    float xPos = float(boardstate[1]);

    float timeScaled = iTime / 10.0; \r
    float deltaX = mod(xPos/1500.0,1.1);\r
    float deltaY = 0.0;
    vec2 catX = vec2(-0.2+deltaX,0.0+deltaX);\r
    vec2 catY = vec2(0.2+deltaY,0.3+deltaY);\r
    float scaleX = 1.0/(catX.y - catX.x);\r
    float scaleY = 1.0/(catY.y - catY.x);\r
  \r
    vec3 ray_direction = normalize(vec3(uv, -1.0));\r
    if (uv.x > catX.x && uv.x < catX.y && uv.y > catY.x && uv.y < catY.y) {\r
      vec2 catPos = vec2(0.0, 0.0);\r
      catPos.x = (uv.x-catX.x)*scaleX/frameCount+frame*pixelsPrFrame/pixelsX;\r
      catPos.y = (uv.y-catY.x)*scaleY;\r
      fragColor = textureLod(u_texture, catPos, 0.0);\r
      if (fragColor.a < 0.1) {\r
        fragColor = vec4(raymarch(ro, ray_direction).rgb, 1.0);\r
      }\r
    } else {\r
        fragColor = vec4(raymarch(ro, ray_direction).rgb, 1.0);\r
   

  }\r
}`;const _=new Int32Array(64);async function k(){const c=document.createElement("style");c.textContent=`
  #c {
    height: 450px;
    aspect-ratio: 1/1;
    background-color: lightgreen;
  }
`,document.head.appendChild(c);const n=document.createElement("canvas");n.id="c",document.body.appendChild(n);const r=document.createElement("button");r.textContent="When not running with autoplay enabled this must be clicked",r.onclick=function(){h=new AudioContext,y=new g(h),y.envelope(.01,.2,0,.01),R=new g(h),R.envelope(.01,.2,.2,.01),h.resume(),v=h.currentTime,p=[...S],x=[...w],requestAnimationFrame(b),D()},document.body.appendChild(r);const t=n.getContext("webgl2",{antialias:!0},"true");if(!t){console.error("WebGL not supported");return}const o=`#version 300 es 
precision highp float;

in vec4 position;
out vec2 vUv;

void main() {
    vUv = position.xy;
    gl_Position = position; 
  }
  `;function a(e,f){const s=document.createElement("img");s.id="texture",s.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAAAVCAMAAAAn8RGpAAAAAXNSR0IArs4c6QAAAA9QTFRFAAAAAAAAOjo6UVFRbW1t/kAd+gAAAAV0Uk5TAP////8c0CZSAAABH0lEQVRIieWXAQ7DIAhFRbn/mVdBLHRaMavZzMhi5/vsi7HVNYQcAKEZ23DEprIPT01hI56qAmfr4j2fp7ijHiMAXaUd8+kJT3JfPUZIEIB6Tl6NFnFnPVoAEvw8LOb39fDCiAAxlQAXNwMs4I56yg/wFA4f+ni5GWABH9TDS4PlhGAjZCMnrwMs4oN6+B6qe0FWEPN6+rgyWsId9RwdmuA1nFwNsIQ76uGHI1KUS4xOHjs+T3FHPSLYOHeDAX8b4GE+rufDCXyf/1xBfzgBQFQacsA2nI7xa0CHy5+/qfyef89nlvN7jo56XFshgkwgfzfpEW7yu/5tH8pW+2rp9sfNN5F51ZQunR2gcOny4afTg/Bm/o1/ywdqU7E0zfwXvmIbea4eByYAAAAASUVORK5CYII=",document.body.appendChild(s),s.onload=()=>{const d=document.getElementById("texture");if(d){const u=e.createTexture();e.bindTexture(e.TEXTURE_2D,u),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,d);const O=e.getUniformLocation(f,"u_texture");e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,u),e.uniform1i(O,0)}else return console.log("No image texture found, most shaders here do not use them"),""}}function i(e,f,s){const d=e.createShader(f);return e.shaderSource(d,s),e.compileShader(d),e.getShaderParameter(d,e.COMPILE_STATUS)?d:(console.error("Error compiling shader:",e.getShaderInfoLog(d)),e.deleteShader(d),null)}async function l(e){const f=M,s=i(e,e.FRAGMENT_SHADER,f),d=i(e,e.VERTEX_SHADER,o),u=e.createProgram();return e.attachShader(u,d),e.attachShader(u,s),e.linkProgram(u),e.useProgram(u),e.getProgramParameter(u,e.LINK_STATUS)?(a(e,u),u):(console.error("Error linking program:",e.getProgramInfoLog(u)),e.deleteProgram(u),null)}const m=await l(t),T=t.getAttribLocation(m,"position"),E=t.getUniformLocation(m,"iResolution"),A=t.getUniformLocation(m,"iTime"),P=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,P);const C=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];t.bufferData(t.ARRAY_BUFFER,new Float32Array(C),t.STATIC_DRAW);function I(e){const f=e.clientWidth,s=e.clientHeight;(e.width!==f||e.height!==s)&&(e.width=f,e.height=s)}let U=0;function b(){I(t.canvas);let e=h.currentTime;t.viewport(0,0,t.canvas.width,t.canvas.height),t.clear(t.COLOR_BUFFER_BIT),t.enableVertexAttribArray(T),t.bindBuffer(t.ARRAY_BUFFER,P),t.vertexAttribPointer(T,2,t.FLOAT,!1,0,0),t.uniform2f(E,t.canvas.width,t.canvas.height),t.uniform1f(A,e);const f=t.getUniformLocation(m,"boardstate");let s=e*4%8;U+=1,t.uniform1iv(f,_),_[0]=parseInt(s),_[1]=parseInt(U),t.drawArrays(t.TRIANGLES,0,6),requestAnimationFrame(b)}}let h,y,R,v=0;const X=.25,S=L.reduce(function(c,n,r){let o=c[r-1]?.on||0,a=c[r-1]?.dur||0,i={note:n==null?n:n+60,on:o+a,dur:1*X};return c.push(i),c},[]),w=N.reduce(function(c,n,r){let o=c[r-1]?.on||0,a=c[r-1]?.dur||0,i={note:n==null?n:n+41,on:o+a,dur:1*X};return c.push(i),c},[]);let F;const Y=.75;let p=[...S];console.log(p);let x=[...w];function D(c){let n=S[S.length-2],r=n.on+n.dur,t=h.currentTime-v;if(F=requestAnimationFrame(D),t>r){cancelAnimationFrame(F);return}let o=t+Y;for(;p.length&&p[0].on<o;){let{note:a,on:i,dur:l}=p[0];console.log("pop from queue for scheudling",a,i,l),p.splice(0,1),a!=null&&(y.play(a,v+i,l,1,"sawtooth"),y.play(a+4,v+i+.02,l,.2,"sine"),y.play(a+7,v+i+.04,l,.3,"sine"))}for(;x.length&&x[0].on<o;){let{note:a,on:i,dur:l}=x[0];x.splice(0,1),console.log("pop from bass queue for scheudling",a,i,l),a!=null&&(R.play(a,v+i,l*2,3,"sawtooth"),R.play(a+7,v+i+.04,l*4,.3,"sawtooth"))}}k();
