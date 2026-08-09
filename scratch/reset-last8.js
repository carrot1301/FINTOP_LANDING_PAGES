const https = require('https');
const API = 'https://api.fintopdata.vn';
function req(m,u,b,t){return new Promise((r,j)=>{const d=b?JSON.stringify(b):'';const o=new URL(u);const h={'Content-Type':'application/json'};if(t)h['Authorization']=`Bearer ${t}`;if(d)h['Content-Length']=Buffer.byteLength(d);const q=https.request({hostname:o.hostname,port:443,path:o.pathname+o.search,method:m,headers:h,timeout:15000},(s)=>{let c='';s.on('data',x=>c+=x);s.on('end',()=>{try{r({status:s.statusCode,body:JSON.parse(c)})}catch{r({status:s.statusCode,body:c})}})});q.on('error',j);if(d)q.write(d);q.end()})}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ids=[121,110,6,37,38,39,40,41];
(async()=>{
  const l=await req('POST',`${API}/auth/login`,{email:'admin@fintop.vn',password:'FinTop@2026'});
  const t=(l.body.data||l.body).accessToken;
  for(const id of ids){
    await sleep(5000);
    const r=await req('PATCH',`${API}/admin/users/${id}`,{emailVerifiedAt:null},t);
    console.log(`ID=${id} → ${r.status===200?'✅ OK':'⚠️ '+r.status}`);
  }
  console.log('Done!');
})();
