/* Flagship silicon field — WebGL fragment shader, pause offscreen. */
(function flagshipShader() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (document.querySelector("canvas[data-flagship-shader]")) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("data-flagship-shader", "true");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    zIndex: "-1",
    pointerEvents: "none",
    opacity: "0.55"
  });
  document.documentElement.style.background = "#061925";

  function mount() {
    if (!document.body) return;
    if (!canvas.parentNode) document.body.insertBefore(canvas, document.body.firstChild);
  }

  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "high-performance" });
  if (!gl) return;

  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, "attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}");
  gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, [
    "precision highp float;",
    "uniform vec2 r; uniform float t;",
    "void main(){",
    " vec2 uv=gl_FragCoord.xy/r;",
    " vec2 p=uv*2.0-1.0; p.x*=r.x/max(r.y,1.0);",
    " float field=0.0;",
    " for(int i=0;i<5;i++){",
    "  float fi=float(i);",
    "  vec2 q=p* (1.15+fi*0.35);",
    "  q.x+=sin(t*0.07+fi*1.7)*0.35;",
    "  q.y+=cos(t*0.05+fi)*0.25;",
    "  field+=0.018/length(sin(q*3.2+t*0.12));",
    " }",
    " float grid=abs(sin(uv.x*70.0))+abs(sin(uv.y*40.0));",
    " grid=smoothstep(0.96,1.0,grid)*0.08;",
    " vec3 midnight=vec3(0.024,0.098,0.145);",
    " vec3 copper=vec3(0.82,0.58,0.30);",
    " vec3 ink=midnight + copper*field + vec3(0.05,0.12,0.14)*grid;",
    " ink*=smoothstep(1.15,0.15,length(p));",
    " gl_FragColor=vec4(ink,1.0);",
    "}"
  ].join("\n"));
  gl.compileShader(fs);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(prog, "r");
  const uT = gl.getUniformLocation(prog, "t");

  let running = true;
  let raf = 0;
  const start = performance.now();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(Math.max(1, window.innerWidth) * dpr);
    canvas.height = Math.floor(Math.max(1, window.innerHeight) * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function frame(now) {
    if (!running) return;
    gl.uniform2f(uR, canvas.width, canvas.height);
    gl.uniform1f(uT, (now - start) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  }

  function play() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  resize();
  window.addEventListener("resize", resize);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) play(); else stop(); });
    }, { threshold: 0.01 });
    io.observe(canvas);
  }
  running = true;
  raf = requestAnimationFrame(frame);
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
