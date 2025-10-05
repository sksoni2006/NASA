const API_KEY = 'uknbrXFkPSQSrdqEWQbvzaRhfPPaKvChlyIKVgIr'; // Replace with your NASA key
const neoSelect = document.getElementById('neoSelect');
const output = document.getElementById('output');
const bplane = document.getElementById('bplane');
const ctxB = bplane.getContext('2d');

// Inputs
const astMassInput = document.getElementById('astMass');
const astSpeedInput = document.getElementById('astSpeed');
const astOffsetInput = document.getElementById('astOffset');
const leadDaysInput = document.getElementById('leadDays');
const impMassInput = document.getElementById('impMass');
const impSpeedInput = document.getElementById('impSpeed');
const betaInput = document.getElementById('beta');
const angleInput = document.getElementById('angle');

// Load NEOs for next 7 days
const today = new Date();
const end = new Date(today);
end.setDate(end.getDate()+7);
const fmt = d => d.toISOString().split('T')[0];
const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${fmt(today)}&end_date=${fmt(end)}&api_key=${API_KEY}`;

fetch(url).then(r=>r.json()).then(data=>{
  const neos = [];
  Object.values(data.near_earth_objects).forEach(arr=>{
    arr.forEach(neo=>{
      const ca = neo.close_approach_data[0];
      if (!ca) return;
      neos.push({
        name: neo.name,
        speed: parseFloat(ca.relative_velocity.kilometers_per_second)*1000,
        miss: parseFloat(ca.miss_distance.kilometers),
        diameter: (neo.estimated_diameter.meters.estimated_diameter_min + neo.estimated_diameter.meters.estimated_diameter_max)/2
      });
    });
  });
  neos.sort((a,b)=>a.miss - b.miss);
  neoSelect.innerHTML = neos.map(n=>`<option>${n.name}</option>`).join('');
  neoSelect.dataset.neos = JSON.stringify(neos);
  neoSelect.dispatchEvent(new Event('change'));
});

neoSelect.addEventListener('change', ()=>{
  const neos = JSON.parse(neoSelect.dataset.neos);
  const sel = neos.find(n=>n.name===neoSelect.value);
  if (!sel) return;
  const r = sel.diameter/2;
  const density = 3000;
  const volume = (4/3)*Math.PI*r**3;
  const mass = volume*density;
  astMassInput.value = mass.toExponential(3);
  astSpeedInput.value = sel.speed.toFixed(2);
  astOffsetInput.value = sel.miss.toFixed(0);
  output.textContent = `Loaded ${sel.name}: ~${(sel.diameter).toFixed(0)} m, miss ${sel.miss.toLocaleString()} km, speed ${(sel.speed/1000).toFixed(2)} km/s`;
});

document.getElementById('runBtn').addEventListener('click', ()=>{
  const m_ast = parseFloat(astMassInput.value);
  const v_ast = parseFloat(astSpeedInput.value);
  const miss = parseFloat(astOffsetInput.value);
  const leadSec = parseFloat(leadDaysInput.value)*86400;
  const m_imp = parseFloat(impMassInput.value);
  const v_imp = parseFloat(impSpeedInput.value);
  const beta = parseFloat(betaInput.value);
  const angle = parseFloat(angleInput.value)*Math.PI/180;

  const deltaV = m_imp*v_imp*(1+beta)/m_ast;
  const dvx = deltaV*Math.cos(angle);
  const dvy = deltaV*Math.sin(angle);
  const deflect_km = dvy*leadSec/1000;

  const finalMiss = miss + deflect_km;
  const hit = Math.abs(finalMiss) < 6371;

  output.innerHTML = `
    Δv = ${deltaV.toExponential(3)} m/s<br>
    Deflection = ${deflect_km.toLocaleString(undefined,{maximumFractionDigits:1})} km<br>
    Final B-plane offset = ${finalMiss.toLocaleString(undefined,{maximumFractionDigits:1})} km<br>
    ${hit?'<span style="color:#f87171">HIT</span>':'<span style="color:#4ade80">MISS</span>'}
  `;

  drawBPlane(miss, finalMiss);
});

// Make bplane fill the available space
function resizeBPlane() {
  bplane.width = window.innerWidth - document.querySelector('.panel').offsetWidth - 40;
  bplane.height = window.innerHeight - 40;
}

window.addEventListener('resize', resizeBPlane);
resizeBPlane();

function drawBPlane(miss, finalMiss){
  ctxB.clearRect(0,0,bplane.width,bplane.height);
  const W = bplane.width, H = bplane.height;
  const midX = W/2, midY = H/2;
  const maxRange = Math.max(Math.abs(miss), Math.abs(finalMiss), 10000);
  const scale = (Math.min(W,H)/2-40)/maxRange;

  // Draw Earth image
  const earthRadius = Math.max(6371*scale, 10);
  const earthImg = new Image();
  earthImg.src = 'earth.png';
  earthImg.onload = function() {
    ctxB.save();
    ctxB.beginPath();
    ctxB.arc(midX, midY, earthRadius, 0, Math.PI*2);
    ctxB.closePath();
    ctxB.clip();
    ctxB.drawImage(earthImg, midX-earthRadius, midY-earthRadius, earthRadius*2, earthRadius*2);
    ctxB.restore();

    // Draw axes and points after earth image loads
    drawAxesAndPoints();
  };
  // If image is cached, onload may not fire
  if (earthImg.complete) {
    earthImg.onload();
  }

  function drawAxesAndPoints() {
    // Axes
    ctxB.strokeStyle='#334155';
    ctxB.beginPath();
    ctxB.moveTo(0, midY);
    ctxB.lineTo(W, midY);
    ctxB.moveTo(midX, 0);
    ctxB.lineTo(midX, H);
    ctxB.stroke();

    // Original B-plane point
    ctxB.fillStyle='#f59e0b';
    ctxB.beginPath();
    ctxB.arc(midX, midY - miss*scale, 5, 0, Math.PI*2);
    ctxB.fill();
    ctxB.fillText('Original', midX+10, midY - miss*scale);

    // Post impact B-plane point
    ctxB.fillStyle='#4ade80';
    ctxB.beginPath();
    ctxB.arc(midX, midY - finalMiss*scale, 5, 0, Math.PI*2);
    ctxB.fill();
    ctxB.fillText('After impact', midX+10, midY - finalMiss*scale);
  }
}