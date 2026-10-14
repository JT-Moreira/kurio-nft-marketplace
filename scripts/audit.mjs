import fs from 'node:fs/promises'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { chromium } from '@playwright/test'

const root='http://127.0.0.1:4173'
const out='lighthouse-reports'
await fs.mkdir(out,{recursive:true})
const chrome=await chromeLauncher.launch({chromePath:process.env.CHROME_PATH||chromium.executablePath(),chromeFlags:['--headless=new','--no-sandbox']})
const summary=[]
try {
 for(const path of ['','/nft/nft-01']) for(const profile of ['mobile','desktop']){
   const score=[]
   for(let i=1;i<=3;i++){
     const config=profile==='desktop'?{extends:'lighthouse:default',settings:{formFactor:'desktop',screenEmulation:{mobile:false,width:1440,height:900,deviceScaleFactor:1,disabled:false}}}:undefined
     const result=await lighthouse(root+path,{port:chrome.port,output:['html','json'],onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'},config)
     if(!result)throw new Error('Lighthouse não retornou resultado')
     const key=`${path? 'detalhe':'inicio'}-${profile}-${i}`
     await fs.writeFile(`${out}/${key}.html`,result.report[0])
     await fs.writeFile(`${out}/${key}.json`,result.report[1])
     score.push({performance:100*result.lhr.categories.performance.score,accessibility:100*result.lhr.categories.accessibility.score,bestPractices:100*result.lhr.categories['best-practices'].score,seo:100*result.lhr.categories.seo.score,LCP:result.lhr.audits['largest-contentful-paint'].numericValue,CLS:result.lhr.audits['cumulative-layout-shift'].numericValue,TBT:result.lhr.audits['total-blocking-time'].numericValue})
   }
   const median=Object.fromEntries(Object.keys(score[0]).map(k=>[k,score.map(item=>item[k]).sort((a,b)=>a-b)[1]]))
   summary.push({page:path||'/',profile,median})
 }
 await fs.writeFile(`${out}/summary.json`,JSON.stringify({timestamp:new Date().toISOString(),node:process.version,summary},null,2))
 console.table(summary.map(({page,profile,median})=>({page,profile,...median})))
}finally{await chrome.kill()}
