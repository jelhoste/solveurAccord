// Tests de la synthèse sonore : node tests/synth.test.js   (aucune dépendance)
// Extrait de index.html le bloc ==SYNTH== (pur : ni DOM, ni AudioContext) et vérifie justesse, niveau, extinction et notes jouées.
const fs=require('fs'), path=require('path'), assert=require('assert');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('// ==SYNTH=='), b=html.indexOf('// ==/SYNTH==');
assert(a>0&&b>a,'bloc ==SYNTH== introuvable dans index.html');
const S=new Function(html.slice(a,b)+'\nreturn {midiHz,guitarNotes,pianoNotes,renderGuitar,renderPiano,RHYTHMS,DRUMS,changesPerMin,renderDrum};')();
const sr=44100;
let fails=0; const t=(name,f)=>{try{f();console.log('  ok     '+name);}catch(e){fails++;console.log('  ÉCHEC  '+name+'\n         '+e.message);}};
// Fréquence estimée : on cherche, au demi-centième de ton près, le maximum du spectre autour de la fréquence attendue.
function pitchCents(x,f){
  const a0=Math.round(0.03*sr), L=Math.round(0.5*sr); let best=-1, bc=0;
  for(let c=-60;c<=60;c+=0.5){
    const w=2*Math.PI*f*Math.pow(2,c/1200)/sr; let re=0, im=0;
    for(let i=0;i<L;i++){ const v=x[a0+i]*(0.5-0.5*Math.cos(2*Math.PI*i/L)); re+=v*Math.cos(w*i); im+=v*Math.sin(w*i); }
    if(re*re+im*im>best){ best=re*re+im*im; bc=c; }
  }
  return bc;
}
const mag=(x,f,t0)=>{ const a0=Math.round(t0*sr), L=Math.round(0.2*sr), w=2*Math.PI*f/sr; let re=0, im=0;
  for(let i=0;i<L;i++){ const v=x[a0+i]*(0.5-0.5*Math.cos(2*Math.PI*i/L)); re+=v*Math.cos(w*i); im+=v*Math.sin(w*i); } return Math.hypot(re,im); };

t('guitare : chaque note est juste à 1 centième de ton près (du mi grave au mi très aigu)',()=>{
  for(const m of [40,45,52,57,64,67,72,79,86]){ const c=pitchCents(S.renderGuitar(sr,m),S.midiHz(m)); assert(Math.abs(c)<=1,'midi '+m+' : écart '+c+' cents'); }
});
t('piano : chaque note est juste à 1 centième de ton près',()=>{
  for(const m of [48,55,60,64,67,72,83]){ const c=pitchCents(S.renderPiano(sr,m),S.midiHz(m)); assert(Math.abs(c)<=1,'midi '+m+' : écart '+c+' cents'); }
});
t('aucune valeur invalide, jamais de saturation, jamais de silence',()=>{
  for(const [fn,notes] of [[S.renderGuitar,[40,52,64,79,86]],[S.renderPiano,[48,60,72,83]]]) for(const m of notes){
    const x=fn(sr,m); let pk=0; for(const v of x){ assert(Number.isFinite(v),'valeur non finie (midi '+m+')'); pk=Math.max(pk,Math.abs(v)); }
    assert(pk>0.2&&pk<=1.0001,'crête '+pk+' (midi '+m+')');
    assert(Math.abs(x[x.length-1])<1e-3,'la fin du son n\'est pas adoucie (clic) pour midi '+m);
  }
});
t('guitare : la fondamentale décroît comme prévu (60 dB en 3,4 s pour le mi grave, 2,4 s pour les notes hautes)',()=>{
  for(const m of [40,52,64,76]){
    const x=S.renderGuitar(sr,m), f=S.midiHz(m), got=20*Math.log10(mag(x,f,1.3)/mag(x,f,0.1)), want=-60*1.2/(3.4-Math.min(1,Math.max(0,(m-40)/40)));
    assert(Math.abs(got-want)<1.5,'midi '+m+' : '+got.toFixed(1)+' dB au lieu de '+want.toFixed(1));
  }
});
t('piano : le son s\'éteint (énergie de la 2e seconde nettement inférieure à celle de la 1re)',()=>{
  const en=(x,t0)=>{ const a0=Math.round(t0*sr); let s=0; for(let i=0;i<sr;i++) s+=x[a0+i]*x[a0+i]; return s; };
  for(const m of [48,60,72,83]){ const x=S.renderPiano(sr,m), r=en(x,1)/en(x,0); assert(r<0.5,'midi '+m+' : rapport '+r.toFixed(2)); }
});
t('calcul rapide : un accord de 6 notes se prépare en moins d\'une demi-seconde',()=>{
  const t0=Date.now(); for(const m of [40,47,52,56,59,64]) S.renderGuitar(sr,m); for(const m of [48,60,64,67,72]) S.renderPiano(sr,m); assert(Date.now()-t0<500,(Date.now()-t0)+' ms');
});
t('notes de guitare : cordes à vide, barré, muettes, capo',()=>{
  assert.deepStrictEqual(S.guitarNotes([-1,3,2,0,1,0],0),[48,52,55,60,64],'do majeur ouvert');
  assert.deepStrictEqual(S.guitarNotes([3,5,5,4,3,3],0),[43,50,55,59,62,67],'sol majeur barré case 3');
  assert.deepStrictEqual(S.guitarNotes([-1,3,2,0,1,0],2),[50,54,57,62,66],'forme de do avec capo 2 = ré majeur');
  assert.deepStrictEqual(S.guitarNotes([-1,-1,-1,-1,-1,-1],0),[],'tout muet');
  assert.deepStrictEqual(S.guitarNotes([0,0,0,0,0,0],0),[40,45,50,55,59,64],'cordes à vide');
});
t('notes de piano : la basse d\'abord, puis la main droite',()=>{ assert.deepStrictEqual(S.pianoNotes({bm:48,n:[64,67,72]}),[48,64,67,72]); });

// ---- Mode entraînement : rythmes, compteur de changements, batterie synthétisée ----
const R=id=>S.RHYTHMS.find(r=>r.id===id), cnt=(r,d,b)=>r.hits.filter(h=>h[1]===d&&(b===undefined||Math.floor(h[0]+1e-9)===b)).length;
t('rythmes : quatre, chacun avec des coups bien formés (position dans [0,4[, instrument connu, force dans ]0,1])',()=>{
  assert.deepStrictEqual(S.RHYTHMS.map(r=>r.id),['click','bin','ter','swing']);
  for(const r of S.RHYTHMS){ assert(r.name&&r.hits.length>0,r.id); r.hits.forEach(([p,d,f],i)=>{ assert(p>=0&&p<4,r.id+' position '+p); assert(S.DRUMS[d],r.id+' instrument '+d); assert(f>0&&f<=1,r.id+' force '+f); if(i) assert(p>=r.hits[i-1][0],'trié'); }); }
});
t('métronome : un clic par temps, accent sur le un',()=>{ const r=R('click'); assert.strictEqual(r.hits.length,4); assert.strictEqual(r.hits[0][1],'clickHi'); assert(r.hits.slice(1).every(h=>h[1]==='clickLo')); assert.deepStrictEqual(r.hits.map(h=>h[0]),[0,1,2,3]); });
t('binaire « poum, ti, tati » : grosse caisse sur 1 et 3, caisse claire sur 2 et 4, charleston en croches (8 coups)',()=>{
  const r=R('bin'); assert.deepStrictEqual(r.hits.filter(h=>h[1]==='kick').map(h=>h[0]),[0,2]); assert.deepStrictEqual(r.hits.filter(h=>h[1]==='snare').map(h=>h[0]),[1,3]); assert.strictEqual(cnt(r,'hat'),8);
  assert.deepStrictEqual(r.hits.filter(h=>h[1]==='hat').map(h=>h[0]),[0,0.5,1,1.5,2,2.5,3,3.5]);
});
t('ternaire : trois coups de charleston par temps (12 par mesure, à 0, 1/3, 2/3), même grosse caisse et caisse claire',()=>{
  const r=R('ter'); for(let b=0;b<4;b++) assert.strictEqual(cnt(r,'hat',b),3,'temps '+(b+1));
  const h=r.hits.filter(x=>x[1]==='hat').map(x=>x[0]); [0,1,2,3].forEach(b=>{ assert(Math.abs(h[b*3]-b)<1e-12&&Math.abs(h[b*3+1]-(b+1/3))<1e-12&&Math.abs(h[b*3+2]-(b+2/3))<1e-12); });
  assert.deepStrictEqual(r.hits.filter(x=>x[1]==='kick').map(x=>x[0]),[0,2]); assert.deepStrictEqual(r.hits.filter(x=>x[1]==='snare').map(x=>x[0]),[1,3]);
});
t('shabada (swing de ride) : ride à chaque temps + note « a » aux 2/3 des temps 2 et 4, charleston au pied sur 2 et 4',()=>{
  const r=R('swing'); assert.strictEqual(cnt(r,'ride'),6);
  assert.deepStrictEqual(r.hits.filter(h=>h[1]==='ride').map(h=>+h[0].toFixed(4)),[0,1,1.6667,2,3,3.6667]);
  assert.deepStrictEqual(r.hits.filter(h=>h[1]==='hatp').map(h=>h[0]),[1,3]);
  const ride=r.hits.filter(h=>h[1]==='ride'); assert(ride.filter(h=>h[0]%1>0).every(h=>h[2]<ride[0][2]),'les notes « a » sont plus douces que les temps');
});
t('compteur de changements par minute : grille en boucle, retour de la fin au début compris',()=>{
  const c=S.changesPerMin; assert.strictEqual(c(['Am','F','C','G7'],80),20); assert.strictEqual(c(['Am','Am','F','F'],80),10);   // 2 changements sur 4 mesures
  assert.strictEqual(c(['Am','F'],120),30); assert.strictEqual(c(['Am','Am','Am'],100),0); assert.strictEqual(c(['Am'],100),0); assert.strictEqual(c([],100),0);
  assert.strictEqual(c(['Am','F','C','G7'],160),40); assert.strictEqual(c(['C','G','Am','F','C'],60),Math.round(4*60/(4*5)*1000)/1000+0, 'C…C : le dernier C et le premier C sont identiques : 4 changements sur 5 mesures');
});
t('batterie synthétisée : un son non vide, sans dépassement, qui finit à zéro, pour chaque instrument ; clic plus aigu que clic grave',()=>{
  for(const k of Object.keys(S.DRUMS)){ const d=S.renderDrum(sr,k); assert(d.length>0,k); let pk=0,bad=false; for(const v of d){ if(!Number.isFinite(v)) bad=true; pk=Math.max(pk,Math.abs(v)); } assert(!bad,k+' NaN'); assert(pk>0.8&&pk<=0.91,k+' crête '+pk); assert(Math.abs(d[d.length-1])<1e-3,k+' fin'); }
  assert.strictEqual(S.renderDrum(sr,'inconnu').length,0);
  const zc=a=>{ let n=0; for(let i=1;i<a.length;i++) if((a[i]>=0)!==(a[i-1]>=0)) n++; return n/a.length*sr/2; };
  assert(zc(S.renderDrum(sr,'clickHi'))>zc(S.renderDrum(sr,'clickLo'))+300,'hauteurs des clics');
});
t('batterie synthétisée : grosse caisse grave, charleston aigu et bref, ride qui dure',()=>{
  const e=(a,from,to)=>{ let s=0; for(let i=Math.round(from*sr);i<Math.min(a.length,Math.round(to*sr));i++) s+=a[i]*a[i]; return s; };
  const kick=S.renderDrum(sr,'kick'), hat=S.renderDrum(sr,'hat'), ride=S.renderDrum(sr,'ride'), snare=S.renderDrum(sr,'snare');
  const zc=a=>{ let n=0; for(let i=1;i<a.length;i++) if((a[i]>=0)!==(a[i-1]>=0)) n++; return n/a.length*sr/2; };
  assert(zc(kick.subarray(0,Math.round(0.15*sr)))<400,'grosse caisse grave'); assert(zc(hat)>3000,'charleston aigu '+zc(hat));
  assert(e(hat,0.05,0.09)<0.02*e(hat,0,0.05),'charleston bref'); assert(e(ride,0.4,0.8)>0.02*e(ride,0,0.4),'le ride se prolonge');
  assert(zc(snare)>zc(kick),'caisse claire plus claire que la grosse caisse');
});
t('batterie synthétisée : même sortie à chaque appel (bruit déterministe)',()=>{ const a=S.renderDrum(sr,'snare'), b=S.renderDrum(sr,'snare'); for(let i=0;i<a.length;i++) assert.strictEqual(a[i],b[i]); });
console.log(fails?'\n'+fails+' échec(s)':'\nTous les tests passent'); process.exit(fails?1:0);
