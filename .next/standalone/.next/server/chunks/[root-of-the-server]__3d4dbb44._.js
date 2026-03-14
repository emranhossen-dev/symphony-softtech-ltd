module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},25200,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),i=e.i(61916),s=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),c=e.i(95169),p=e.i(47587),u=e.i(66012),f=e.i(70101),x=e.i(26937),h=e.i(10372),v=e.i(93695);e.i(52474);var m=e.i(220),g=e.i(89171);async function w(e,{params:t}){try{let{certificateId:e}=await t,a="CERT-2024-ABC123",r=`
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5; 
            }
            .certificate { 
              background: white; 
              border: 2px solid #gold; 
              border-radius: 10px; 
              padding: 40px; 
              text-align: center; 
              max-width: 800px; 
              margin: 0 auto; 
              box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
            }
            .header { 
              margin-bottom: 30px; 
            }
            .title { 
              font-size: 32px; 
              color: #2c3e50; 
              margin-bottom: 10px; 
              font-weight: bold; 
            }
            .subtitle { 
              font-size: 18px; 
              color: #7f8c8d; 
              margin-bottom: 20px; 
            }
            .content { 
              text-align: left; 
              margin-bottom: 30px; 
            }
            .field { 
              margin-bottom: 15px; 
              font-size: 16px; 
            }
            .label { 
              font-weight: bold; 
              color: #2c3e50; 
              display: inline-block; 
              width: 150px; 
            }
            .value { 
              color: #34495e; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e0e0e0; 
              text-align: center; 
              font-size: 14px; 
              color: #7f8c8d; 
            }
            .verification-id { 
              background: #f8f9fa; 
              padding: 10px; 
              border-radius: 5px; 
              font-family: monospace; 
              font-weight: bold; 
            }
            @media print {
              body { padding: 0; }
              .certificate { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="title">Certificate of Completion</div>
              <div class="subtitle">This is to certify that</div>
            </div>
            
            <div class="content">
              <div class="field">
                <span class="label">Student Name:</span>
                <span class="value">John Doe</span>
              </div>
              <div class="field">
                <span class="label">Course Name:</span>
                <span class="value">Web Development Fundamentals</span>
              </div>
              <div class="field">
                <span class="label">Completion Date:</span>
                <span class="value">${new Date("2024-01-15T10:00:00Z").toLocaleDateString()}</span>
              </div>
              <div class="field">
                <span class="label">Instructor:</span>
                <span class="value">John Smith</span>
              </div>
              <div class="field">
                <span class="label">Duration:</span>
                <span class="value">8 weeks</span>
              </div>
              <div class="field">
                <span class="label">Grade:</span>
                <span class="value">A</span>
              </div>
            </div>
            
            <div class="footer">
              <div class="verification-id">
                Verification ID: ${a}
              </div>
              <p>Verify this certificate at: http://localhost:3000/certificates/verify/${a}</p>
            </div>
          </div>
        </body>
      </html>
    `;return new g.NextResponse(r,{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Content-Disposition":`attachment; filename="certificate-${e}.html"`}})}catch(e){return console.error("Error downloading certificate:",e),g.NextResponse.json({error:"Failed to download certificate"},{status:500})}}async function R(e,{params:t}){try{let{certificateId:e}=await t;return console.log("[CERTIFICATE DOWNLOADED]",`Certificate ${e} downloaded`),g.NextResponse.json({success:!0,message:"Certificate marked as downloaded"})}catch(e){return console.error("Error marking certificate as downloaded:",e),g.NextResponse.json({error:"Failed to mark certificate as downloaded"},{status:500})}}e.s(["GET",()=>w,"POST",()=>R],4709);var b=e.i(4709);let y=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/student/certificates/[certificateId]/download/route",pathname:"/api/student/certificates/[certificateId]/download",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/student/certificates/[certificateId]/download/route.ts",nextConfigOutput:"standalone",userland:b}),{workAsyncStorage:E,workUnitAsyncStorage:C,serverHooks:A}=y;function T(){return(0,r.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:C})}async function N(e,t,r){y.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let g="/api/student/certificates/[certificateId]/download/route";g=g.replace(/\/index$/,"")||"/";let w=await y.prepare(e,t,{srcPage:g,multiZoneDraftMode:!1});if(!w)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:R,params:b,nextConfig:E,parsedUrl:C,isDraftMode:A,prerenderManifest:T,routerServerContext:N,isOnDemandRevalidate:k,revalidateOnlyGenerated:D,resolvedPathname:O,clientReferenceManifest:P,serverActionsManifest:I}=w,S=(0,o.normalizeAppPath)(g),j=!!(T.dynamicRoutes[S]||T.routes[O]),q=async()=>((null==N?void 0:N.render404)?await N.render404(e,t,C,!1):t.end("This page could not be found"),null);if(j&&!A){let e=!!T.routes[O],t=T.dynamicRoutes[S];if(t&&!1===t.fallback&&!e){if(E.experimental.adapterPath)return await q();throw new v.NoFallbackError}}let _=null;!j||y.isDev||A||(_="/index"===(_=O)?"/":_);let H=!0===y.isDev||!j,U=j&&!H;I&&P&&(0,s.setManifestsSingleton)({page:g,clientReferenceManifest:P,serverActionsManifest:I});let $=e.method||"GET",F=(0,i.getTracer)(),M=F.getActiveScopeSpan(),K={params:b,prerenderManifest:T,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:H,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:E.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>y.onRequestError(e,t,r,n,N)},sharedContext:{buildId:R}},L=new l.NodeNextRequest(e),B=new l.NodeNextResponse(t),z=d.NextRequestAdapter.fromNodeNextRequest(L,(0,d.signalFromNodeResponse)(t));try{let s=async e=>y.handle(z,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=F.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${$} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${$} ${g}`)}),o=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var i,l;let d=async({previousCacheEntry:a})=>{try{if(!o&&k&&D&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let l=K.renderOpts.pendingWaitUntil;l&&r.waitUntil&&(r.waitUntil(l),l=void 0);let d=K.renderOpts.collectedTags;if(!j)return await (0,u.sendResponse)(L,B,i,K.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(i.headers);d&&(t[h.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,r=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await y.onRequestError(e,t,{routerKind:"App Router",routePath:g,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:k})},!1,N),t}},c=await y.handleResponse({req:e,nextConfig:E,cacheKey:_,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:T,isRoutePPREnabled:!1,isOnDemandRevalidate:k,revalidateOnlyGenerated:D,responseGenerator:d,waitUntil:r.waitUntil,isMinimalMode:o});if(!j)return null;if((null==c||null==(i=c.value)?void 0:i.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(l=c.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",k?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),A&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let v=(0,f.fromNodeOutgoingHttpHeaders)(c.value.headers);return o&&j||v.delete(h.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||v.get("Cache-Control")||v.set("Cache-Control",(0,x.getCacheControlHeader)(c.cacheControl)),await (0,u.sendResponse)(L,B,new Response(c.value.body,{headers:v,status:c.value.status||200})),null};M?await l(M):await F.withPropagatedContext(e.headers,()=>F.trace(c.BaseServerSpan.handleRequest,{spanName:`${$} ${g}`,kind:i.SpanKind.SERVER,attributes:{"http.method":$,"http.target":e.url}},l))}catch(t){if(t instanceof v.NoFallbackError||await y.onRequestError(e,t,{routerKind:"App Router",routePath:S,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:k})},!1,N),j)throw t;return await (0,u.sendResponse)(L,B,new Response(null,{status:500})),null}}e.s(["handler",()=>N,"patchFetch",()=>T,"routeModule",()=>y,"serverHooks",()=>A,"workAsyncStorage",()=>E,"workUnitAsyncStorage",()=>C],25200)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__3d4dbb44._.js.map