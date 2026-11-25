import * as THREE from './assets/vendor/three.module.min.js';

async function initializeAuren(host=document.querySelector('.hero-visual'), section=document.querySelector('.cine'), variant=null) {
const startupTime = performance.now();
const yieldPaint = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
// Modelo procedural original AUREN. Todas as peças são malhas tridimensionais.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 760px)');
const clamp = THREE.MathUtils.clamp;
const ease = (a, b, value) => THREE.MathUtils.smoothstep(value, a, b);

try {
  host.setAttribute('aria-busy', 'true');
  await yieldPaint();
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile.matches ? 1.25 : 1.5));
  renderer.setClearColor(0x0b0a09, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const canvas = renderer.domElement;
  canvas.className = 'watch-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Relógio AUREN tridimensional. Role para girar, desmontar e remontar as peças.');
  if(variant)canvas.setAttribute('aria-label','Relógio Rolex '+variant+' em 3D. Role ou arraste para explorar.');
  host.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 90);
  camera.position.set(0, .15, 21.4);
  camera.lookAt(0, 0, -.4);

  // Estúdio virtual: painéis de luz refletidos no metal via ambiente prefiltrado.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#55514c');
  function softbox(x, y, z, width, height, color, intensity) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    panel.material.color.multiplyScalar(intensity);
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    studio.add(panel);
  }
  softbox(-6, 3, 5, 3, 10, '#f4f1ea', 5);
  softbox(5, 1, 3, 1.6, 9, '#f6e4cd', 3.6);
  softbox(0, 7, -2, 9, 3, '#ffffff', 4);
  softbox(1, -5, 5, 6, 1, '#d3dbe5', 2.2);
  softbox(-1, 0, -8, 4, 6, '#171511', .4);
  const studioTarget = new THREE.WebGLCubeRenderTarget(128, { type: THREE.HalfFloatType });
  const studioCamera = new THREE.CubeCamera(.1, 100, studioTarget);
  studioCamera.update(renderer, studio);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromCubemap(studioTarget.texture);
  studioTarget.dispose();
  scene.environment = environment.texture;
  pmrem.dispose();
  studio.traverse(o => { if(o.isMesh){o.geometry.dispose();o.material.dispose();} });
  scene.add(new THREE.HemisphereLight(0xf7ecd8, 0x171a20, 1.3));
  const key = new THREE.DirectionalLight(0xfff5e5, 3.1);
  key.position.set(-5, 6, 8); scene.add(key);
  const edge = new THREE.DirectionalLight(0xdce8ff, 2.3);
  edge.position.set(6, 1, -3); scene.add(edge);
  const warm = new THREE.DirectionalLight(0xe3b17d, 1.2);
  warm.position.set(-3, -4, 3); scene.add(warm);

  await yieldPaint();
  function brushTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#999'; ctx.fillRect(0, 0, 256, 256);
    let seed = 7189;
    for(let i=0;i<1800;i++) {
      seed = (seed * 16807) % 2147483647;
      const shade = 105 + seed % 75;
      ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
      ctx.lineWidth = .35;
      ctx.beginPath(); ctx.moveTo(seed % 256, (seed >> 8) % 256); ctx.lineTo(seed % 256, 256); ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
  }
  const brushed = brushTexture();
  const steel = new THREE.MeshStandardMaterial({ color: '#73767b', metalness: 1, roughness: .29, bumpMap: brushed, bumpScale: .008 });
  const polished = new THREE.MeshStandardMaterial({ color: '#c0c2c5', metalness: 1, roughness: .15 });
  const graphite = new THREE.MeshStandardMaterial({ color: '#242729', metalness: .95, roughness: .32, bumpMap: brushed, bumpScale: .006 });
  const copper = new THREE.MeshStandardMaterial({ color: '#bc805d', metalness: .94, roughness: .27 });
  const gold = new THREE.MeshStandardMaterial({ color: '#9e8549', metalness: .95, roughness: .3 });
  const black = new THREE.MeshStandardMaterial({ color: '#0e1012', metalness: .7, roughness: .38 });
  const ivory = new THREE.MeshStandardMaterial({ color: '#f2e4c6', metalness: .35, roughness: .3, emissive: '#625845', emissiveIntensity: .08 });
  const jewel = new THREE.MeshPhysicalMaterial({ color: '#7d1646', metalness: .4, roughness: .16, clearcoat: 1 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#c8e2eb', metalness: .05, roughness: .08, transparent: true, opacity: .075, depthWrite: false, side: THREE.DoubleSide });

  const watch = new THREE.Group(); scene.add(watch);
  const parts = {};
  const moving = [];
  function layer(name, z) { const g = new THREE.Group(); g.name = name; g.position.z = z; g.userData.home = z; watch.add(g); parts[name] = g; return g; }
  const back = layer('back', -.44);
  const body = layer('case', -.15);
  const movement = layer('movement', .02);
  const bridges = layer('bridges', .24);
  const dial = layer('dial', .40);
  const bezel = layer('bezel', .48);
  const hands = layer('hands', .59);
  const crystal = layer('crystal', .76);
  const strap = layer('bracelet', -.22);

  function mesh(geometry, material, parent, x=0,y=0,z=0) {
    const m = new THREE.Mesh(geometry, material); m.position.set(x,y,z); parent.add(m); return m;
  }
  function extrude(shape, depth=.08, bevel=.015) {
    return new THREE.ExtrudeGeometry(shape,{depth, bevelEnabled:bevel>0, bevelSegments:2, steps:1, bevelSize:bevel, bevelThickness:bevel, curveSegments:12});
  }
  function disc(radius, depth, material, parent, x=0,y=0,z=0) {
    const g = new THREE.CylinderGeometry(radius,radius,depth,64); g.rotateX(Math.PI/2);
    return mesh(g,material,parent,x,y,z);
  }
  function ring(outer, inner, depth, material, parent, z=0) {
    const s = new THREE.Shape(); s.absarc(0,0,outer,0,Math.PI*2,false);
    const h = new THREE.Path(); h.absarc(0,0,inner,0,Math.PI*2,true); s.holes.push(h);
    return mesh(extrude(s,depth,.008),material,parent,0,0,z);
  }
  function octagon(width,height,cut,hole=0) {
    const s = new THREE.Shape();
    const p=[[-width+cut,-height],[width-cut,-height],[width,-height+cut],[width,height-cut],[width-cut,height],[-width+cut,height],[-width,height-cut],[-width,-height+cut]];
    p.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y)); s.closePath();
    if(hole){const h=new THREE.Path();h.absarc(0,0,hole,0,Math.PI*2,true);s.holes.push(h);} return s;
  }
  function roundedBox(width,height,depth,r=.06) {
    const s = new THREE.Shape(), w=width/2,h=height/2;
    s.moveTo(-w+r,-h);s.lineTo(w-r,-h);s.quadraticCurveTo(w,-h,w,-h+r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);s.quadraticCurveTo(-w,h,-w,h-r);s.lineTo(-w,-h+r);s.quadraticCurveTo(-w,-h,-w+r,-h);
    const g=extrude(s,depth,.025);g.translate(0,0,-depth/2);return g;
  }
  function bar(ax,ay,bx,by,width,depth,mat,parent,z=0) {
    const dx=bx-ax,dy=by-ay;
    const m=mesh(roundedBox(width,Math.hypot(dx,dy),depth,Math.min(.04,width/3)),mat,parent,(ax+bx)/2,(ay+by)/2,z);
    m.rotation.z=-Math.atan2(dx,dy);return m;
  }
  const screwHead=new THREE.CylinderGeometry(.061,.061,.036,20);screwHead.rotateX(Math.PI/2);
  const screwSlot=new THREE.BoxGeometry(.07,.012,.006);
  function screw(parent,x,y,z,material=copper) {
    const m=mesh(screwHead,material,parent,x,y,z);m.rotation.z=x+y;
    const slot=mesh(screwSlot,black,m,0,0,.021); return m;
  }

  // Fond, carrure, chanfreins et lunette ajourée.
  mesh(extrude(octagon(1.91,2.02,.65),.11,.05),graphite,back,0,0,-.1);
  disc(1.58,.025,black,back,0,0,.035);
  ring(1.69,1.59,.025,polished,back,.04);
  mesh(extrude(octagon(2.02,2.11,.65,1.53),.42,.07),steel,body,0,0,-.17);
  mesh(extrude(octagon(2.07,2.15,.68,1.71),.07,.04),polished,body,0,0,.2);
  mesh(extrude(octagon(2.03,2.11,.66,1.63),.09,.045),steel,bezel);
  ring(1.68,1.60,.025,polished,bezel,.08);
  const screwPositions=[[-1.25,1.75],[1.25,1.75],[1.88,.75],[1.88,-.75],[1.25,-1.75],[-1.25,-1.75],[-1.88,-.75],[-1.88,.75]];
  screwPositions.forEach(([x,y])=>screw(bezel,x,y,.135));

  // Couronne cannelée et protège-couronne, véritables volumes latéraux.
  const crown=new THREE.Group();body.add(crown);crown.position.set(2.22,0,.03);crown.rotation.y=Math.PI/2;
  disc(.27,.32,copper,crown);
  ring(.285,.235,.045,polished,crown,.13);
  for(let i=0;i<32;i++) {
    const a=i*Math.PI/16;
    const rib=mesh(new THREE.BoxGeometry(.024,.055,.27),copper,crown,Math.cos(a)*.274,Math.sin(a)*.274,0);rib.rotation.z=a;
  }
  disc(.22,.02,copper,crown,0,0,.182);
  mesh(roundedBox(.37,.3,.34),steel,body,2.02,.48,.01);
  mesh(roundedBox(.37,.3,.34),steel,body,2.02,-.48,.01);

  // Platine ajourée, cercles de perlage et rouages dentés.
  ring(1.57,1.42,.06,graphite,movement,-.015);
  for(let i=0;i<5;i++) {
    const a=i*Math.PI*2/5;
    bar(Math.cos(a)*.35,Math.sin(a)*.35,Math.cos(a)*1.45,Math.sin(a)*1.45,.22,.08,graphite,movement,0);
  }
  const gearSpecs=[[-.73,.64,.52,40,1],[.43,.85,.40,32,-1],[.84,.10,.43,34,1],[.27,-.56,.55,42,-1],[-.79,-.49,.43,32,1],[-.18,.14,.31,26,-1],[.81,-.86,.28,24,1]];
  function gear(radius,teeth,x,y,z,index,direction) {
    const group=new THREE.Group();group.position.set(x,y,z);movement.add(group);
    const s=new THREE.Shape();
    for(let i=0;i<teeth*4;i++) {
      const a=i/(teeth*4)*Math.PI*2;
      const r=radius*(i%4===0||i%4===3?.92:1);
      i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    s.closePath();const h=new THREE.Path();h.absarc(0,0,radius*.68,0,Math.PI*2,true);s.holes.push(h);
    mesh(extrude(s,.045,.004),index%2?steel:gold,group);
    for(let j=0;j<6;j++){
      const a=j*Math.PI/3;
      bar(0,0,Math.cos(a)*radius*.8,Math.sin(a)*radius*.8,.055,.04,index%2?steel:gold,group,.02);
    }
    disc(radius*.17,.07,copper,group,0,0,.04);
    disc(radius*.075,.08,polished,group,0,0,.06);
    moving.push({object:group,direction,speed:.08/radius});return group;
  }
  gearSpecs.forEach(([x,y,r,n,d],i)=>gear(r,n,x,y,.06+(i%3)*.025,i,d));
  for(let i=0;i<18;i++){
    const a=i*Math.PI/9;
    screw(movement,1.38*Math.cos(a),1.38*Math.sin(a),.07,polished);
  }
  // Balancier et spiral concentrique.
  const balance=new THREE.Group();balance.position.set(-.30,-1.05,.17);movement.add(balance);
  ring(.36,.31,.04,copper,balance);
  for(let i=0;i<4;i++) { const a=i*Math.PI/2;bar(0,0,Math.cos(a)*.33,Math.sin(a)*.33,.04,.025,gold,balance,.03); }
  const spiralPoints=[];
  for(let i=0;i<200;i++){const a=i/199*Math.PI*12,r=.025+i/199*.22;spiralPoints.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,.07));}
  const spiral=new THREE.Line(new THREE.BufferGeometry().setFromPoints(spiralPoints),new THREE.LineBasicMaterial({color:'#95a2b3'}));balance.add(spiral);
  disc(.068,.045,jewel,balance,0,0,.09);

  // Ponts en cuivre: chaque pont et chaque rubis possède une épaisseur.
  [[-1.35,.87,.05,.18],[1.30,1.02,.05,.18],[.05,.18,-.82,-1.18],[.05,.18,1.29,-.83]].forEach(([ax,ay,bx,by])=>{
    bar(ax,ay,bx,by,.17,.075,copper,bridges,.02);
    screw(bridges,ax,ay,.085,polished);
  });
  [[-.73,.64],[.43,.85],[.27,-.56],[-.30,-1.05]].forEach(([x,y])=>{
    const mount=new THREE.Group();mount.position.set(x,y,.05);bridges.add(mount);
    ring(.125,.07,.04,copper,mount);disc(.065,.045,jewel,mount,0,0,.04);disc(.022,.05,polished,mount,0,0,.06);
  });

  ring(1.60,1.37,.065,black,dial);
  ring(1.605,1.585,.022,copper,dial,.07);
  for(let i=0;i<60;i++) {
    const a=-i*Math.PI/30,major=i%5===0;
    const mark=mesh(new THREE.BoxGeometry(major?.065:.015,major?.22:.07,.028),major?copper:ivory,dial,-Math.sin(a)*(major?1.46:1.51),Math.cos(a)*(major?1.46:1.51),.085);mark.rotation.z=a;
    if(major){const fill=mesh(new THREE.BoxGeometry(.032,.16,.009),ivory,mark,0,0,.02);}
  }
  function label(text,w,h,font,color) {
    const c=document.createElement('canvas');c.width=1024;c.height=256;
    const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=font;ctx.fillText(text,512,128);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  }
  mesh(roundedBox(.91,.23,.025,.03),graphite,dial,0,.92,.1);
  const brand=label('A U R E N',.82,.20,'76px Georgia','#f0e8d9');brand.position.set(0,.92,.124);dial.add(brand);
  const signature=label('S K E L E T O N',.57,.14,'52px Arial','#c9ac86');signature.position.set(0,-.87,.105);dial.add(signature);

  function hand(length,width,angle) {
    const group=new THREE.Group();hands.add(group);group.rotation.z=angle;
    const shape=new THREE.Shape();shape.moveTo(-width/2,-.18);shape.lineTo(width/2,-.18);shape.lineTo(width*.42,length*.8);shape.lineTo(0,length);shape.lineTo(-width*.42,length*.8);shape.closePath();
    mesh(extrude(shape,.025,.008),copper,group);
    mesh(new THREE.BoxGeometry(width*.35,length*.65,.012),ivory,group,0,length*.43,.038);
    return group;
  }
  hand(.97,.12,Math.PI/3);hand(1.30,.09,-Math.PI/3);
  const second=hand(1.38,.025,Math.PI*.9);second.position.z=.055;
  disc(.12,.08,copper,hands,0,0,.06);disc(.055,.09,polished,hands,0,0,.075);
  disc(1.58,.025,glass,crystal);
  ring(1.594,1.578,.013,polished,crystal,-.01);

  // Bracelet articulé en boucle, y compris ses maillons arrière.
  const linkGeometry=roundedBox(.72,.41,.17,.045);
  const edgeGeometry=roundedBox(.42,.44,.20,.045);
  const topStrap=new THREE.Group(),bottomStrap=new THREE.Group();
  strap.add(topStrap,bottomStrap);
  const braceletLinks=[{object:topStrap,home:new THREE.Vector3(),sign:1},{object:bottomStrap,home:new THREE.Vector3(),sign:-1}];
  const count=60;
  for(let i=0;i<count;i++) {
    const a=i/count*Math.PI*2;
    const y=4.25*Math.sin(a),z=-1.9+1.9*Math.cos(a);
    if(Math.abs(y)<2.1 && Math.cos(a)>0)continue;
    const link=new THREE.Group();link.position.set(0,y,z);link.rotation.x=Math.atan2(-1.9*Math.sin(a),4.25*Math.cos(a));(y>=0?topStrap:bottomStrap).add(link);
    const spacing=Math.hypot(4.25*Math.cos(a),1.9*Math.sin(a))*Math.PI*2/count;
    link.scale.y=spacing/.48;
    mesh(linkGeometry,graphite,link,0,0,.035);
    mesh(edgeGeometry,steel,link,-.59,0,0);mesh(edgeGeometry,steel,link,.59,0,0);
    const seam=new THREE.BoxGeometry(.015,.35,.009);
    mesh(seam,polished,link,-.365,0,.13);mesh(seam,polished,link,.365,0,.13);
  }
  [-1,1].forEach(sign=>{
    mesh(roundedBox(1.65,.37,.32),steel,body,0,sign*2.10,-.07);
    mesh(roundedBox(.73,.37,.34),graphite,body,0,sign*2.10,-.04);
  });

  if(variant) {
    // Distinct circular cases and dials; original procedural interpretations.
    for(const group of [back,body,bezel]) {
      for(const child of [...group.children]) {
        if(child.isMesh && child.geometry.type==='ExtrudeGeometry') {child.removeFromParent();child.geometry.dispose();}
      }
    }
    disc(1.90,.12,steel,back,0,0,-.06);
    ring(1.98,1.54,.38,steel,body,-.12);
    ring(2.04,1.54,.065,polished,body,.24);
    for(const child of [...bezel.children])child.removeFromParent();
    ring(2.02,1.62,.12,variant==='datejust'?polished:black,bezel);
    const faceMaterial=new THREE.MeshStandardMaterial({color:variant==='daytona'?'#eee9da':variant==='datejust'?'#224d3a':'#111719',metalness:.55,roughness:.32});
    disc(1.39,.025,faceMaterial,dial,0,0,.06);
    brand.removeFromParent();signature.removeFromParent();
    const rolex=label('ROLEX',.65,.18,'bold 84px Georgia',variant==='daytona'?'#202322':'#e8e0c7');rolex.position.set(0,.85,.17);dial.add(rolex);
    const model=label(variant==='submariner'?'SUBMARINER':variant==='daytona'?'DAYTONA':'DATEJUST',.83,.13,'52px Arial',variant==='daytona'?'#b33b35':'#ddd2b3');model.position.set(0,-.68,.17);dial.add(model);
    const oyster=label('OYSTER PERPETUAL',.8,.12,'45px Arial',variant==='daytona'?'#30332e':'#ddd2b3');oyster.position.set(0,.61,.17);dial.add(oyster);
    // Applied crown emblem with five raised prongs.
    for(let i=0;i<5;i++){const x=(i-2)*.07;bar(x*.65,1.10,x,1.28-Math.abs(i-2)*.035,.018,.018,gold,dial,.13);disc(.025,.02,gold,dial,x,1.28-Math.abs(i-2)*.035,.13);}
    bar(-.10,1.08,.10,1.08,.025,.02,gold,dial,.13);
    if(variant==='datejust') {
      for(let i=0;i<100;i++){const a=i*Math.PI/50;const ridge=mesh(new THREE.BoxGeometry(.026,.32,.035),polished,bezel,Math.cos(a)*1.82,Math.sin(a)*1.82,.15);ridge.rotation.z=a-Math.PI/2;}
      const date=label('24',.22,.21,'bold 100px Arial','#181b19');const plate=mesh(new THREE.PlaneGeometry(.30,.25),ivory,dial,1.05,0,.13);date.position.set(1.05,0,.14);dial.add(date);
      disc(.22,.04,glass,crystal,1.05,0,.04);
    } else {
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6;const number=label(String(variant==='submariner'?i*5:60+i*20),.25,.16,'70px Arial','#d9d8d0');number.position.set(Math.sin(a)*1.82,Math.cos(a)*1.82,.19);number.rotation.z=-a;bezel.add(number);
      }
    }
    if(variant==='submariner') {
      for(let i=1;i<12;i++){const a=i*Math.PI/6;disc(.075,.025,ivory,dial,Math.sin(a)*1.17,Math.cos(a)*1.17,.12);}
    }
    if(variant==='daytona') {
      for(const [x,y] of [[-.78,0],[.78,0],[0,-.7]]) {
        disc(.36,.025,black,dial,x,y,.105);
        const sub=new THREE.Group();sub.position.set(x,y,.13);dial.add(sub);ring(.36,.32,.025,polished,sub);
        for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=mesh(new THREE.BoxGeometry(.015,.055,.008),ivory,sub,Math.sin(a)*.285,Math.cos(a)*.285,.04);tick.rotation.z=-a;}
        bar(0,0,.1,.22,.018,.012,ivory,sub,.05);
      }
      for(const y of [-.67,.67]){const button=disc(.15,.35,polished,body,2.08,y,.06);button.rotation.y=Math.PI/2;}
    }
    copper.color.set('#b9b6a5');graphite.color.set('#8b8c88');
    host.dataset.model=variant;
  }
  await yieldPaint();
  // Batch immutable geometry by material; retain separately animated assemblies.
  // This avoids hundreds of draw calls while keeping real gears and layers movable.
  const dynamic=new Set([...moving.map(g=>g.object),balance,second,topStrap,bottomStrap]);
  function batchStatic(root) {
    root.updateWorldMatrix(true,true);
    const inverse=root.matrixWorld.clone().invert(),batches=new Map(),old=[];
    function visit(node) {
      for(const child of [...node.children]) {
        if(dynamic.has(child))continue;
        if(child.isMesh){
          const geometry=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();
          geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,child.matrixWorld));
          if(!batches.has(child.material))batches.set(child.material,[]);
          batches.get(child.material).push(geometry);old.push(child);
        }
        visit(child);
      }
    }
    visit(root);
    for(const [material,geometries] of batches) {
      const merged=new THREE.BufferGeometry();
      for(const name of ['position','normal','uv']) {
        const size=name==='uv'?2:3;
        const total=geometries.reduce((n,g)=>n+g.getAttribute('position').count*size,0);
        const data=new Float32Array(total);let offset=0;
        for(const geometry of geometries){const attribute=geometry.getAttribute(name);if(attribute)data.set(attribute.array,offset);offset+=geometry.getAttribute('position').count*size;}
        merged.setAttribute(name,new THREE.BufferAttribute(data,size));
      }
      merged.computeBoundingSphere();mesh(merged,material,root);
      geometries.forEach(g=>g.dispose());
    }
    old.forEach(m=>m.removeFromParent());
  }
  moving.forEach(g=>batchStatic(g.object));
  batchStatic(balance);batchStatic(second);batchStatic(topStrap);batchStatic(bottomStrap);
  Object.values(parts).forEach(batchStatic);

  // Choreography is reversible: assembled → exploded → assembled.
  const offsets={back:-1.28,case:-.6,movement:.18,bridges:.92,dial:1.65,bezel:2.28,hands:2.88,crystal:3.55,bracelet:-.8};
  let progress=0,targetProgress=0,explosion=0,manual=null,dragX=0,dragY=0,dragging=false,lastX=0,lastY=0;
  let visible=true,frameId=0,previous=0,mechanicalTime=0,lost=false;
  const control=section.querySelector('[data-explode],#watch-explode');
  const reset=section.querySelector('[data-reset],#watch-reset');
  const hint=section.querySelector('.watch-hint');
  let ready=false,warming=true;
  function scrollProgress() {
    const rect=section.getBoundingClientRect();
    return variant ? clamp((innerHeight*.8-rect.top)/(innerHeight*.8+rect.height),0,1) : clamp(-rect.top/Math.max(1,section.offsetHeight-innerHeight),0,1);
  }
  function targetExplosion(p) {return ease(.18,.52,p)*(1-ease(.72,.98,p));}
  function resize() {
    const width=host.clientWidth,height=host.clientHeight;
    if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;
    camera.position.z=mobile.matches?22.4:21.4;
    camera.updateProjectionMatrix();wake();
  }
  function animate(ms) {
    frameId=0;if(lost||document.hidden||!visible)return;
    const delta=Math.min((ms-(previous||ms))/1000,.05);previous=ms;
    const damping=1-Math.exp(-delta*8);
    targetProgress=reduce.matches?0:scrollProgress();
    progress+= (targetProgress-progress)*damping;
    const goal=manual===null?targetExplosion(progress):manual;
    explosion=reduce.matches?goal:THREE.MathUtils.lerp(explosion,goal,damping);
    if(!reduce.matches)mechanicalTime+=delta;
    const e=explosion;
    for(const [name,g] of Object.entries(parts)) {
      g.position.z=g.userData.home+offsets[name]*e;
      if(name==='bezel'||name==='dial'||name==='crystal')g.position.y=e*(name==='crystal'?.30:.12);
    }
    braceletLinks.forEach(({object,home,sign})=>{object.position.copy(home);object.position.y+=sign*e*.42;});
    watch.rotation.set(.12+e*.25+dragY,-.25+e*.92+progress*(variant?1.1:.20)+dragX,-.08-e*.11);
    watch.position.set(-e*.85,.10-e*.12,-e*.60);
    watch.scale.setScalar(1-e*.08);
    moving.forEach(({object,direction,speed})=>{object.rotation.z=mechanicalTime*direction*speed+e*direction*.35;});
    balance.rotation.z=Math.sin(mechanicalTime*9)*.34;
    second.rotation.z=Math.PI*.9-mechanicalTime*Math.PI/30;
    renderer.render(scene,camera);
    if(!ready){
      ready=true;host.querySelector('.watch-loading')?.remove();host.setAttribute('aria-busy','false');host.dataset.readyMs=String(Math.round(performance.now()-startupTime));host.classList.add('three-ready');host.dataset.renderer='webgl';host.dataset.meshes=String(renderer.info.render.calls);
      control.hidden=false;reset.hidden=false;if(hint)hint.hidden=false;
      window.dispatchEvent(new CustomEvent('auren:3d-ready'));
    }
    host.dataset.explosion=e.toFixed(3);
    host.dataset.rotation=watch.rotation.y.toFixed(3);
    host.dataset.triangles=String(renderer.info.render.triangles);
    host.dataset.progress=progress.toFixed(3);
    host.dataset.motion=reduce.matches?'reduced':'full';
    const expanded=(manual===null?targetExplosion(targetProgress):manual)>.45;
    control.textContent=expanded?'Remontar o relógio':'Desmontar o relógio';control.setAttribute('aria-pressed',String(expanded));
    if(!reduce.matches||Math.abs(goal-explosion)>.001) frameId=requestAnimationFrame(animate);
  }
  function wake() {if(!warming&&!frameId&&!document.hidden&&visible&&!lost){previous=0;frameId=requestAnimationFrame(animate);}}
  control.addEventListener('click',()=>{manual=(manual===null?targetExplosion(progress):manual)>.45?0:1;wake();});
  reset.addEventListener('click',()=>{dragX=dragY=0;manual=null;wake();});
  addEventListener('scroll',()=>{manual=null;wake();},{passive:true});
  addEventListener('resize',resize);
  reduce.addEventListener('change',()=>{progress=0;manual=null;wake();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;}else wake();});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frameId);frameId=0;}else wake();},{threshold:0}).observe(section);
  canvas.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')return;dragging=true;lastX=event.clientX;lastY=event.clientY;canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');});
  canvas.addEventListener('pointermove',event=>{if(!dragging)return;dragX+=(event.clientX-lastX)*.008;dragY=clamp(dragY+(event.clientY-lastY)*.006,-.7,.7);lastX=event.clientX;lastY=event.clientY;wake();});
  function stopDrag(){dragging=false;canvas.classList.remove('dragging');}
  canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frameId);frameId=0;host.classList.remove('three-ready');host.dataset.renderer='fallback';control.hidden=reset.hidden=true;if(hint)hint.hidden=true;});
  canvas.addEventListener('webglcontextrestored',()=>{lost=false;ready=false;resize();wake();});
  await yieldPaint();
  await renderer.compileAsync(scene,camera);
  warming=false;
  resize();wake();
} catch(error) {
  host.dataset.renderer='fallback';
  host.querySelector('.watch-loading')?.remove();
  host.setAttribute('aria-busy','false');
  console.warn('AUREN: apresentação estática disponível; WebGL não pôde iniciar.',error.message);
}

}
initializeAuren();

// Build section scenes just before they enter view, one at a time.
let sceneQueue=Promise.resolve();
const lazyScenes=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){
    lazyScenes.unobserve(entry.target);
    const container=entry.target;
    sceneQueue=sceneQueue.then(()=>initializeAuren(container.querySelector('.section-watch'),container,container.dataset.rolex));
  }
},{rootMargin:'400px'});
document.querySelectorAll('[data-rolex]').forEach(el=>lazyScenes.observe(el));
