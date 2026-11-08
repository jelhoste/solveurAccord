// Tests de la synthèse sonore : node tests/synth.test.js   (aucune dépendance)
// Extrait de index.html le bloc ==SYNTH== (pur : ni DOM, ni AudioContext) et vérifie justesse, niveau, extinction et notes jouées.
const fs=require('fs'), path=require('path'), assert=require('assert');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('// ==SYNTH=='), b=html.indexOf('// ==/SYNTH==');
assert(a>0&&b>a,'bloc ==SYNTH== introuvable dans index.html');
const S=new Function(html.slice(a,b)+'\nreturn {midiHz,guitarNotes,pianoNotes,renderGuitar,renderPiano};')();
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
console.log(fails?'\n'+fails+' échec(s)':'\nTous les tests passent'); process.exit(fails?1:0);
