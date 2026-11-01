// Tests de compatibilité des fichiers : node tests/compat.test.js   (aucune dépendance)
// Extrait de index.html les blocs ==CHORDS== et ==COMPAT== et les confronte aux fichiers de tests/fixtures/.
const fs=require('fs'), path=require('path'), assert=require('assert');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('// ==CHORDS=='), b=html.indexOf('// ==/COMPAT==');
assert(a>0&&b>a,'blocs ==CHORDS== / ==COMPAT== introuvables dans index.html');
const L=new Function(html.slice(a,b)+'\nreturn {parse,N,QUALITY_ID,chordToStructure,structureToChord,normalizeImport,resolveChords,SCHEMA_VERSION,APP_VERSION};')();
const fx=n=>JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures',n),'utf8'));
let fails=0; const t=(name,f)=>{try{f();console.log('  ok     '+name);}catch(e){fails++;console.log('  ÉCHEC  '+name+'\n         '+e.message);}};

t('les identifiants de type sont figés (on peut en ajouter, pas en renommer)',()=>{
  const frozen={'':'major',m:'minor','7':'7',m7:'m7',maj7:'maj7',sus2:'sus2',sus4:'sus4','5':'5','5(2)':'5(2)'};
  for(const [q,id] of Object.entries(frozen)) assert.strictEqual(L.QUALITY_ID[q],id,'identifiant modifié pour « '+q+' »');
});
t('chaque symbole pris en charge fait l\'aller-retour symbole -> structure -> symbole',()=>{
  for(let r=0;r<12;r++) for(const q of Object.keys(L.QUALITY_ID)){
    const sym=L.N[r]+q, s=L.chordToStructure(sym); assert(s,sym+' non reconnu'); assert.strictEqual(L.structureToChord(s),sym);
    const sb=sym+'/'+L.N[(r+4)%12]; assert.strictEqual(L.structureToChord(L.chordToStructure(sb)),sb);
  }
});
t('la version de l\'appli est identique dans index.html et sw.js',()=>{
  const sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); assert.strictEqual(/const VERSION='([^']+)'/.exec(sw)[1],L.APP_VERSION);
});
const check=(name,doc,expect)=>t(name,()=>{
  const r=L.normalizeImport(doc); assert(!r.error,'document refusé'); assert.strictEqual(r.doc.schema,L.SCHEMA_VERSION);
  const rc=L.resolveChords(r.doc); assert.deepStrictEqual(rc.bad,[]); assert.deepStrictEqual(rc.chords,expect||doc.chords);
});
check('fichier du format 1 (sans numéro de format) : migré et lu',fx('v1-export.json'));
check('charge utile de lien du format 1 : migrée et lue',fx('v1-share-payload.json'));
check('fichier du format courant',fx('v2-export.json'));
check('fichier du format courant avec le champ origine',fx('v2-export-origine.json'));
t('le champ origine ne contient que « manuel » ou « auto »',()=>{
  const d=fx('v2-export-origine.json');
  for(const e of [...d.guitare,...d.piano]) assert(['manuel','auto'].includes(e.origine),'valeur inattendue : '+e.origine);
});
t('fichier d\'un format plus récent : lu au mieux, avec avertissement',()=>{
  const r=L.normalizeImport(fx('future-schema.json')); assert(r.warnings.length===1);
  assert.deepStrictEqual(L.resolveChords(r.doc).chords,fx('future-schema.json').chords); // type inconnu -> retombe sur le symbole
});
t('la structure prime sur le symbole ; un symbole illisible est rattrapé par la structure',()=>{
  const r=L.normalizeImport({app:'diagrammes-accords',schema:2,chords:['Zz9','Am'],structure:[[2,'major',null],[9,'major',null]]});
  assert.deepStrictEqual(L.resolveChords(r.doc).chords,['D','A']);
});
t('documents invalides refusés',()=>{
  for(const d of [null,{},{app:'autre',chords:['C']},{app:'diagrammes-accords'},{app:'diagrammes-accords',schema:0,chords:['C']}]) assert(L.normalizeImport(d).error);
});
console.log(fails?'\n'+fails+' test(s) en échec':'\nTous les tests passent');
process.exitCode=fails?1:0;
