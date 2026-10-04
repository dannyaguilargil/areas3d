import * as THREE from './vendor/three/three.module.js';
import {lighting} from './geometry.js';

const host = document.querySelector('#scene');
try {
  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  host.replaceChildren(renderer.domElement);
  const scene = new THREE.Scene();
  lighting(scene);
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  const assembly = new THREE.Group();
  assembly.rotation.y = .3;
  scene.add(assembly);
  const half = 1.175, count = 48;
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), -half);
  const material = new THREE.MeshPhysicalMaterial({color:0x2a7ddd, transparent:true, opacity:.25, metalness:.15, roughness:.22, side:THREE.DoubleSide, depthWrite:false, clippingPlanes:[clip]});
  const cube = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.35, 2.35, 8, 8, 8), material);
  assembly.add(cube);
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.35,2.35,2.35)), new THREE.LineBasicMaterial({color:0x7cc6ff, transparent:true, opacity:.3}));
  assembly.add(outline);
  const core = new THREE.Mesh(new THREE.BoxGeometry(.85,.85,.85), new THREE.MeshStandardMaterial({color:0x387cda, metalness:.55, roughness:.28, clippingPlanes:[clip]}));
  assembly.add(core);
  const layers = new THREE.Group();
  const layerGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-half,0,-half),new THREE.Vector3(half,0,-half),
    new THREE.Vector3(half,0,half),new THREE.Vector3(-half,0,half)
  ]);
  const layerMaterial = new THREE.LineBasicMaterial({color:0x65b5ff, transparent:true, opacity:.38});
  for(let i=0;i<count;i++) {
    const line = new THREE.LineLoop(layerGeometry, layerMaterial);
    line.position.y = -half + (i+1)*2*half/count;
    layers.add(line);
  }
  assembly.add(layers);
  const metal = new THREE.MeshStandardMaterial({color:0x19304b,metalness:.75,roughness:.35});
  const blue = new THREE.MeshStandardMaterial({color:0x427fd1,metalness:.6,roughness:.3});
  function box(w,h,d,mat,x,y,z,parent=assembly) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    mesh.position.set(x,y,z); parent.add(mesh); return mesh;
  }
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.85,1.95,.16,80),metal);
  platform.position.y = -half-.1; assembly.add(platform);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.87,.012,6,100),new THREE.MeshBasicMaterial({color:0x619fff}));
  rim.rotation.x = Math.PI/2; rim.position.y = -half-.1; assembly.add(rim);
  // A restrained printer frame keeps the original cube as the focal point.
  for(const x of [-1.55,1.55]) box(.075,3.45,.075,metal,x,.45,-1.5);
  box(3.18,.09,.09,metal,0,2.17,-1.5);
  const gantry = new THREE.Group(); assembly.add(gantry);
  box(3.18,.065,.075,blue,0,.52,-1.5,gantry);
  const carriage = new THREE.Group(); gantry.add(carriage);
  const rail = box(.045,.05,3.05,metal,0,.52,0,carriage);
  const nozzle = new THREE.Group(); assembly.add(nozzle);
  const housing = new THREE.MeshStandardMaterial({color:0x659fff,metalness:.35,roughness:.32});
  const silver = new THREE.MeshStandardMaterial({color:0xd9e8f5,metalness:.65,roughness:.3});
  const brass = new THREE.MeshStandardMaterial({color:0xf0b95c,metalness:.55,roughness:.28});
  const dark = new THREE.MeshStandardMaterial({color:0x091525,metalness:.3,roughness:.5});
  box(.52,.44,.42,housing,0,.62,0,nozzle);
  box(.4,.34,.04,dark,0,.62,.23,nozzle);
  // Front fan, fins and brass hotend make the print head readable at laptop scale.
  const fan = new THREE.Mesh(new THREE.TorusGeometry(.13,.022,8,32),silver);
  fan.position.set(0,.62,.26); nozzle.add(fan);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.043,.043,.035,16),silver);
  hub.rotation.x=Math.PI/2; hub.position.set(0,.62,.28); nozzle.add(hub);
  for(let i=0;i<5;i++) {
    const angle=i*Math.PI*2/5;
    const blade=box(.055,.09,.015,blue,Math.sin(angle)*.078,.62+Math.cos(angle)*.078,.27,nozzle);
    blade.rotation.z=-angle+.35;
  }
  for(let i=0;i<4;i++)box(.26,.028,.26,silver,0,.31+i*.045,0,nozzle);
  box(.27,.12,.24,brass,0,.235,0,nozzle);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(.105,.022,.14,24),brass);
  tip.position.y=.105; nozzle.add(tip);
  const outlet = new THREE.Mesh(new THREE.CylinderGeometry(.021,.021,.035,12),silver);
  outlet.position.y=.02; nozzle.add(outlet);
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,.25,12),silver);
  feed.position.y=.965; nozzle.add(feed);
  const filament = new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.32,8),new THREE.MeshBasicMaterial({color:0x91dfff}));
  filament.position.y=1.14; nozzle.add(filament);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(.046,16,8),new THREE.MeshBasicMaterial({color:0xc5f5ff}));
  nozzle.add(glow);
  const workLight = new THREE.PointLight(0x8fdbff,1.2,1.1,2);
  workLight.position.set(0,.12,.2); nozzle.add(workLight);
  // A short, rounded bead follows the nozzle instead of a one-pixel trace alone.
  const bead = new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1,10),new THREE.MeshBasicMaterial({color:0x9feaff}));
  assembly.add(bead);
  const traceGeometry = layerGeometry.clone();
  const trace = new THREE.Line(traceGeometry,new THREE.LineBasicMaterial({color:0xb5edff}));
  const tracePoints = new Float32Array(15);
  traceGeometry.setAttribute('position',new THREE.BufferAttribute(tracePoints,3));
  assembly.add(trace);
  const grid = new THREE.GridHelper(7,24,0x376399,0x192c45);
  grid.position.y = -half-.2; scene.add(grid);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let running = !motion.matches, printing = true, elapsed = 6, drag = false, lastX = 0;
  const pause = document.querySelector('#rotate');
  const mode = document.querySelector('#layers');
  const status = document.querySelector('#print-status');
  function controls() {
    pause.textContent = running ? 'Pausar animación' : 'Activar animación';
    pause.setAttribute('aria-pressed',String(running));
    mode.textContent = printing ? 'Ver cubo completo' : 'Ver impresión';
    mode.setAttribute('aria-pressed',String(printing));
    document.body.classList.toggle('motion-paused',!running);
  }
  pause.onclick = () => {running=!running; controls();};
  mode.onclick = () => {printing=!printing; controls();};
  motion.addEventListener('change',e=>{running=!e.matches;controls();});
  document.querySelector('#wireframe').onclick = e => {
    material.wireframe=!material.wireframe;
    e.currentTarget.setAttribute('aria-pressed',String(material.wireframe));
  };
  controls();
  host.onpointerdown = e=>{drag=true;lastX=e.clientX;host.setPointerCapture(e.pointerId);};
  host.onpointermove = e=>{if(drag){assembly.rotation.y+=(e.clientX-lastX)*.008;lastX=e.clientX;}};
  host.onpointerup = host.onpointercancel = ()=>{drag=false;};
  new ResizeObserver(()=>{
    const w=host.clientWidth,h=host.clientHeight;
    if(!w||!h)return;
    renderer.setSize(w,h); camera.aspect=w/h;
    const distance = Math.max(1, 1/camera.aspect);
    camera.position.set(5.2*distance,3.7*distance,7.6*distance);
    camera.lookAt(0,.2,0); camera.updateProjectionMatrix();
  }).observe(host);
  let visible=true, previous=0, previousLabel='';
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(host);
  const corners=[[-half,-half],[half,-half],[half,half],[-half,half],[-half,-half]];
  function renderPrint() {
    const cycle=elapsed%42, amount=Math.min(cycle/36,1);
    const layer=Math.min(count-1,Math.floor(amount*count));
    const y=-half+(layer+1)*2*half/count;
    const edgeProgress=(amount*count%1)*4;
    const edge=Math.floor(edgeProgress), fraction=edgeProgress-edge;
    const [ax,az]=corners[edge], [bx,bz]=corners[edge+1];
    const x=ax+(bx-ax)*fraction,z=az+(bz-az)*fraction;
    const complete=amount===1 || !printing;
    clip.constant=complete?half+.01:y;
    layers.children.forEach((line,i)=>line.visible=complete||i<layer);
    // Keep the hardware on the printer; only the deposited material stops glowing.
    nozzle.visible=gantry.visible=true;
    trace.visible=bead.visible=glow.visible=workLight.visible=!complete;
    let headX=x, headY=y+.015, headZ=z;
    if(complete) {
      const restTime=printing ? cycle-36 : 2;
      const lift=Math.min(restTime/.5,1);
      const travel=Math.max(0,Math.min((restTime-.5)/1,1));
      const ease=travel*travel*(3-2*travel);
      headX=-half+(-1.48+half)*ease;
      headY=half+.015+.16*lift;
      headZ=-half+(-1.5+half)*ease;
    }
    nozzle.position.set(headX,headY,headZ);
    gantry.position.y=headY-.015;
    carriage.position.x=headX;
    // The support ends at the carriage instead of protruding past the nozzle.
    rail.scale.z=Math.max(.1,headZ+1.5)/3.05;
    rail.position.z=(headZ-1.5)/2;
    const beadLength=Math.min(.32,fraction*2*half);
    const dx=(bx-ax)/(2*half),dz=(bz-az)/(2*half);
    bead.visible=bead.visible&&beadLength>.001;
    bead.scale.y=Math.max(beadLength,.001);
    bead.position.set(x-dx*beadLength/2,y+.018,z-dz*beadLength/2);
    bead.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx,0,dz));
    trace.position.y=y+.005;
    for(let i=0;i<=edge;i++)tracePoints.set([corners[i][0],0,corners[i][1]],i*3);
    tracePoints.set([x,0,z],(edge+1)*3);
    traceGeometry.attributes.position.needsUpdate=true;
    traceGeometry.setDrawRange(0,edge+2);
    trace.frustumCulled=false;
    const label=complete?'CUBO COMPLETO':`IMPRIMIENDO · CAPA ${String(layer+1).padStart(2,'0')} / ${count}`;
    if(label!==previousLabel){status.textContent=label;previousLabel=label;}
  }
  function frame(t) {
    requestAnimationFrame(frame);
    const dt=Math.min((t-previous)/1000,.05);previous=t;
    if(document.hidden||!visible)return;
    if(running&&!drag){elapsed+=dt; if(!printing)assembly.rotation.y+=dt*.16;}
    renderPrint(); renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
} catch(error) {
  host.innerHTML='<p class="scene-fallback">Tu dispositivo no pudo iniciar la vista 3D. El catálogo sigue disponible.</p>';
  for(const id of ['rotate','wireframe','layers'])document.getElementById(id).disabled=true;
}
