// --- CONSTANTS ---
export const MAX_LIMIT = 16384;
export const WORKER_CAP = 1500;

// --- SUITES ---
export const LIGHT_SUITE = [
    { mode: 'FRACTAL', res: 1024, od: 1 }, { mode: 'FRACTAL', res: 1024, od: 2 }, { mode: 'FRACTAL', res: 2048, od: 1 },
    { mode: '3D', res: 1024, od: 1 }, { mode: '3D', res: 1024, od: 2 }, { mode: '3D', res: 2048, od: 1 },
    { mode: 'FIRE', res: 1024, od: 1 }, { mode: 'FIRE', res: 1024, od: 2 }, { mode: 'FIRE', res: 2048, od: 1 },
];

export const NORMAL_SUITE = [
    { mode: 'FRACTAL', res: 1024, od: 1 }, { mode: 'FRACTAL', res: 2048, od: 1 }, { mode: 'FRACTAL', res: 4096, od: 1 },
    { mode: 'FRACTAL', res: 1024, od: 5 }, { mode: 'FRACTAL', res: 2048, od: 5 }, { mode: 'FRACTAL', res: 4096, od: 5 },
    { mode: '3D', res: 1024, od: 1 }, { mode: '3D', res: 2048, od: 1 }, { mode: '3D', res: 4096, od: 1 },
    { mode: '3D', res: 1024, od: 5 }, { mode: '3D', res: 2048, od: 5 }, { mode: '3D', res: 4096, od: 5 },
    { mode: 'FIRE', res: 1024, od: 1 }, { mode: 'FIRE', res: 2048, od: 1 }, { mode: 'FIRE', res: 4096, od: 1 },
    { mode: 'FIRE', res: 1024, od: 5 }, { mode: 'FIRE', res: 2048, od: 5 }, { mode: 'FIRE', res: 4096, od: 5 },
];

export const BURNER_SUITE = [
    { mode: 'FRACTAL', res: 4096, od: 1 }, { mode: 'FRACTAL', res: 4096, od: 5 }, { mode: 'FRACTAL', res: 4096, od: 10 }, { mode: 'FRACTAL', res: 4096, od: 15 },
    { mode: 'FRACTAL', res: 8192, od: 1 },
    { mode: '3D', res: 4096, od: 1 }, { mode: '3D', res: 4096, od: 5 }, { mode: '3D', res: 4096, od: 10 }, { mode: '3D', res: 4096, od: 15 },
    { mode: '3D', res: 8192, od: 1 },
    { mode: 'FIRE', res: 4096, od: 1 }, { mode: 'FIRE', res: 4096, od: 5 }, { mode: 'FIRE', res: 4096, od: 10 }, { mode: 'FIRE', res: 4096, od: 15 },
    { mode: 'FIRE', res: 8192, od: 1 },
];

// --- WEBGL SHADERS ---
export const VERT_SHADER = `precision mediump float; attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

export const FRAG_FRACTAL = `precision mediump float;
uniform vec2 u_resolution; uniform float u_time; uniform float u_intensity;
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    float max_iter = 50.0 + (u_intensity * 150.0); 
    vec2 z = vec2(0.0); vec2 c = uv * 3.0 - vec2(0.5, 0.0);
    float i_val = 0.0;
    for(int n=0; n < 200; n++) {
        if (float(n) > max_iter) break;
        float heavy = sin(float(n) * 0.2 + u_time) * 0.001;
        z = vec2(z.x*z.x - z.y*z.y + heavy, 2.0*z.x*z.y) + c;
        if(dot(z, z) > 16.0) { i_val = float(n); break; }
    }
    col = vec3(i_val/max_iter * 2.0, i_val/max_iter * 0.5, i_val/max_iter * 0.2);
    gl_FragColor = vec4(col, 1.0);
}`;

export const FRAG_3D = `precision mediump float;
uniform vec2 u_resolution; uniform float u_time; uniform float u_intensity;
mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
float map(vec3 p) {
    vec3 q = p; q.xz *= rot(u_time * 0.4); q.xy *= rot(u_time * 0.3);
    float s = 1.0;
    for(int i=0; i<4; i++) {
        q = abs(q) - vec3(0.4); q.xy *= rot(0.5); q.xz *= rot(0.5);
        s *= 1.5; q *= 1.5;
    }
    return length(max(abs(q) - vec3(0.1), 0.0)) / s;
}
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.0, -2.5); vec3 rd = normalize(vec3(uv, 1.2));
    float t = 0.0; float fMaxSteps = 30.0 + u_intensity * 100.0;
    float hit = 0.0; vec3 p = vec3(0.0);
    for(int i=0; i<100; i++) {
        if(float(i) > fMaxSteps) break;
        p = ro + rd * t; float d = map(p);
        if(d < 0.001) { hit = 1.0; break; }
        t += d; if(t > 10.0) break;
    }
    vec3 col = vec3(0.02, 0.02, 0.05);
    if(hit > 0.5) {
        vec3 lig = normalize(vec3(1.0, 1.0, -1.0));
        float d = map(p); vec2 e = vec2(0.01, 0.0);
        vec3 n = normalize(vec3(d - map(p-e.xyy), d - map(p-e.yxy), d - map(p-e.yyx)));
        float diff = max(dot(n, lig), 0.0); col = vec3(0.0, 0.6, 1.0) * diff;
    }
    gl_FragColor = vec4(col, 1.0);
}`;

export const FRAG_FIRE = `precision mediump float;
uniform vec2 u_resolution; uniform float u_time; uniform float u_intensity;
float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
float noise(vec2 p){
    vec2 ip = floor(p); vec2 u = fract(p); u = u*u*(3.0-2.0*u);
    float res = mix(mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x), mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
    return res;
}
float fbm(vec2 p) {
    float f = 0.0; float amp = 0.5;
    for(int i=0; i<4; i++) { f += amp * noise(p); p = p * 2.02; amp *= 0.5; }
    return f;
}
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy; vec2 p = uv * 2.0 - 1.0; p.x *= u_resolution.x / u_resolution.y;
    float speed = u_time * (1.5 + u_intensity);
    vec2 distortion = vec2(fbm(p + vec2(0.0, speed * 0.2)), fbm(p + vec2(43.0, speed * 0.3)));
    p += distortion * 0.1 * u_intensity;
    float q = fbm(p * 3.0 - vec2(0.0, speed)); float r = fbm(p * 5.0 + vec2(q)); 
    float mask = 1.0 - length(p * vec2(0.8, 1.5) + vec2(0.0, -0.8)); mask = clamp(mask, 0.0, 1.0);
    float fire = (q + r) * mask * 2.0; fire = pow(fire, 1.5); 
    vec3 color = mix(vec3(0.1, 0.0, 0.0), vec3(1.0, 0.5, 0.1), fire); color = mix(color, vec3(1.0, 1.0, 0.8), pow(fire, 3.0)); 
    float pd = u_intensity * 2.0;
    if (pd > 0.1) {
        vec2 sparkUV = p * (10.0 + pd * 10.0); sparkUV.y += speed * 2.0;
        float sparks = noise(sparkUV); sparks = pow(sparks, 15.0); 
        color += vec3(1.0, 0.8, 0.2) * sparks * pd;
    }
    gl_FragColor = vec4(color, 1.0);
}`;
