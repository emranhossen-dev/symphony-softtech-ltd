module.exports=[93695,(e,t,i)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,i)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,i)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,i)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,i)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,i)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},63021,(e,t,i)=>{t.exports=e.x("@prisma/client-2c3a283f134fdcb6",()=>require("@prisma/client-2c3a283f134fdcb6"))},98043,e=>{"use strict";let t;var i=e.i(63021);let r=globalThis;try{console.log("DATABASE_URL:",process.env.DATABASE_URL),r.prisma?t=r.prisma:r.prisma=t=new i.PrismaClient({log:["error"]})}catch(e){throw console.error("Failed to initialize Prisma client:",e),Error("Database connection failed. Please check your DATABASE_URL configuration.")}e.s(["prisma",()=>t])},24361,(e,t,i)=>{t.exports=e.x("util",()=>require("util"))},54799,(e,t,i)=>{t.exports=e.x("crypto",()=>require("crypto"))},88947,(e,t,i)=>{t.exports=e.x("stream",()=>require("stream"))},83745,e=>{"use strict";var t=e.i(47909),i=e.i(74017),r=e.i(96250),a=e.i(59756),n=e.i(61916),o=e.i(74677),s=e.i(69741),l=e.i(16795),c=e.i(87718),d=e.i(95169),p=e.i(47587),u=e.i(66012),f=e.i(70101),x=e.i(26937),g=e.i(10372),h=e.i(93695);e.i(52474);var m=e.i(220),v=e.i(89171),b=e.i(79832),y=e.i(98043),w=e.i(874);async function R(e){let t=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Certificate of Completion</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .certificate {
          background: white;
          width: 800px;
          height: 600px;
          position: relative;
          border: 20px solid #10b981;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .certificate::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 2px solid #10b981;
          border-radius: 8px;
          pointer-events: none;
        }
        
        .certificate-content {
          padding: 60px;
          text-align: center;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        
        .certificate-logo {
          position: absolute;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 24px;
          font-weight: 700;
          color: #10b981;
          letter-spacing: 2px;
        }
        
        .certificate-title {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          color: #1f2937;
          margin-bottom: 20px;
          font-weight: 700;
        }
        
        .certificate-subtitle {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 40px;
          font-weight: 500;
        }
        
        .student-name {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          color: #10b981;
          margin-bottom: 15px;
          font-weight: 700;
          border-bottom: 2px solid #10b981;
          display: inline-block;
          padding-bottom: 10px;
        }
        
        .course-title {
          font-size: 20px;
          color: #374151;
          margin-bottom: 30px;
          font-weight: 600;
          line-height: 1.4;
        }
        
        .completion-text {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .certificate-date {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 30px;
        }
        
        .verification-section {
          position: absolute;
          bottom: 30px;
          right: 60px;
          text-align: right;
        }
        
        .verification-code {
          font-size: 12px;
          color: #9ca3af;
          font-family: 'Courier New', monospace;
        }
        
        .signatures {
          display: flex;
          justify-content: space-around;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        .signature {
          text-align: center;
        }
        
        .signature-line {
          width: 200px;
          height: 1px;
          background: #9ca3af;
          margin-bottom: 5px;
        }
        
        .signature-title {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .seal {
          position: absolute;
          bottom: 40px;
          left: 60px;
          width: 80px;
          height: 80px;
          border: 3px solid #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #10b981;
          font-weight: 700;
          text-align: center;
          line-height: 1.2;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="certificate-logo">SYMPHONY TRAINING</div>
        <div class="certificate-content">
          <h1 class="certificate-title">Certificate of Completion</h1>
          <p class="certificate-subtitle">This is to certify that</p>
          <div class="student-name">${e.studentName}</div>
          <p class="course-title">has successfully completed the course</p>
          <div style="font-size: 24px; color: #1f2937; margin-bottom: 20px; font-weight: 600;">
            "${e.courseTitle}"
          </div>
          <p class="completion-text">
            demonstrating exceptional dedication and mastery of the subject matter.<br>
            This achievement reflects their commitment to excellence and continuous learning.
          </p>
          <p class="certificate-date">Awarded on ${e.completionDate}</p>
          
          <div class="signatures">
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-title">Course Instructor</div>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-title">Director</div>
            </div>
          </div>
          
          <div class="seal">
            VERIFIED<br>
            CERTIFICATE
          </div>
          
          <div class="verification-section">
            <div class="verification-code">Verification ID: ${e.verificationId}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;return w.Buffer.from(t,"utf-8")}async function E(e){try{let t=e.cookies.get("auth-token")?.value;if(!t)return v.NextResponse.json({error:"Unauthorized"},{status:401});let i=(0,b.verifyToken)(t);if("STUDENT"!==i.role)return v.NextResponse.json({error:"Access denied"},{status:403});let{courseId:r}=await e.json();if(!r)return v.NextResponse.json({error:"Course ID is required"},{status:400});let a=await y.prisma.certificate.findUnique({where:{userId_courseId:{userId:i.id,courseId:r}}});if(a)return v.NextResponse.json({success:!0,certificate:{id:a.id,certificateUrl:a.certificateUrl,verificationId:a.verificationId,issuedAt:a.issuedAt}});let n=await y.prisma.course.findUnique({where:{id:r}});if(!n)return v.NextResponse.json({error:"Course not found"},{status:404});let o=`CERT-${Date.now()}-${Math.random().toString(36).substr(2,9).toUpperCase()}`;await R({studentName:i.name,courseTitle:n.title,completionDate:new Date().toLocaleDateString(),verificationId:o});let s=`certificate-${i.id}-${r}-${Date.now()}.pdf`,l=`/certificates/${s}`,c=await y.prisma.certificate.create({data:{userId:i.id,courseId:r,certificateUrl:l,verificationId:o}});return console.log("Certificate PDF generated (simulated):",s),v.NextResponse.json({success:!0,certificate:{id:c.id,certificateUrl:c.certificateUrl,verificationId:c.verificationId,issuedAt:c.issuedAt}})}catch(e){return console.error("Error generating certificate:",e),v.NextResponse.json({error:"Failed to generate certificate"},{status:500})}}e.s(["POST",()=>E],58121);var C=e.i(58121);let A=new t.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/student/certificate/generate/route",pathname:"/api/student/certificate/generate",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/student/certificate/generate/route.ts",nextConfigOutput:"standalone",userland:C}),{workAsyncStorage:T,workUnitAsyncStorage:I,serverHooks:N}=A;function D(){return(0,r.patchFetch)({workAsyncStorage:T,workUnitAsyncStorage:I})}async function P(e,t,r){A.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let v="/api/student/certificate/generate/route";v=v.replace(/\/index$/,"")||"/";let b=await A.prepare(e,t,{srcPage:v,multiZoneDraftMode:!1});if(!b)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:y,params:w,nextConfig:R,parsedUrl:E,isDraftMode:C,prerenderManifest:T,routerServerContext:I,isOnDemandRevalidate:N,revalidateOnlyGenerated:D,resolvedPathname:P,clientReferenceManifest:j,serverActionsManifest:k}=b,U=(0,s.normalizeAppPath)(v),q=!!(T.dynamicRoutes[U]||T.routes[P]),S=async()=>((null==I?void 0:I.render404)?await I.render404(e,t,E,!1):t.end("This page could not be found"),null);if(q&&!C){let e=!!T.routes[P],t=T.dynamicRoutes[U];if(t&&!1===t.fallback&&!e){if(R.experimental.adapterPath)return await S();throw new h.NoFallbackError}}let O=null;!q||A.isDev||C||(O="/index"===(O=P)?"/":O);let _=!0===A.isDev||!q,$=q&&!_;k&&j&&(0,o.setManifestsSingleton)({page:v,clientReferenceManifest:j,serverActionsManifest:k});let H=e.method||"GET",z=(0,n.getTracer)(),M=z.getActiveScopeSpan(),F={params:w,prerenderManifest:T,renderOpts:{experimental:{authInterrupts:!!R.experimental.authInterrupts},cacheComponents:!!R.cacheComponents,supportsDynamicResponse:_,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:R.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,i,r,a)=>A.onRequestError(e,t,r,a,I)},sharedContext:{buildId:y}},B=new l.NodeNextRequest(e),L=new l.NodeNextResponse(t),K=c.NextRequestAdapter.fromNodeNextRequest(B,(0,c.signalFromNodeResponse)(t));try{let o=async e=>A.handle(K,F).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let i=z.getRootSpanAttributes();if(!i)return;if(i.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${i.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=i.get("next.route");if(r){let t=`${H} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${H} ${v}`)}),s=!!(0,a.getRequestMeta)(e,"minimalMode"),l=async a=>{var n,l;let c=async({previousCacheEntry:i})=>{try{if(!s&&N&&D&&!i)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await o(a);e.fetchMetrics=F.renderOpts.fetchMetrics;let l=F.renderOpts.pendingWaitUntil;l&&r.waitUntil&&(r.waitUntil(l),l=void 0);let c=F.renderOpts.collectedTags;if(!q)return await (0,u.sendResponse)(B,L,n,F.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(n.headers);c&&(t[g.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let i=void 0!==F.renderOpts.collectedRevalidate&&!(F.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&F.renderOpts.collectedRevalidate,r=void 0===F.renderOpts.collectedExpire||F.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:F.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:i,expire:r}}}}catch(t){throw(null==i?void 0:i.isStale)&&await A.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:N})},!1,I),t}},d=await A.handleResponse({req:e,nextConfig:R,cacheKey:O,routeKind:i.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:T,isRoutePPREnabled:!1,isOnDemandRevalidate:N,revalidateOnlyGenerated:D,responseGenerator:c,waitUntil:r.waitUntil,isMinimalMode:s});if(!q)return null;if((null==d||null==(n=d.value)?void 0:n.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",N?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let h=(0,f.fromNodeOutgoingHttpHeaders)(d.value.headers);return s&&q||h.delete(g.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||h.get("Cache-Control")||h.set("Cache-Control",(0,x.getCacheControlHeader)(d.cacheControl)),await (0,u.sendResponse)(B,L,new Response(d.value.body,{headers:h,status:d.value.status||200})),null};M?await l(M):await z.withPropagatedContext(e.headers,()=>z.trace(d.BaseServerSpan.handleRequest,{spanName:`${H} ${v}`,kind:n.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},l))}catch(t){if(t instanceof h.NoFallbackError||await A.onRequestError(e,t,{routerKind:"App Router",routePath:U,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:N})},!1,I),q)throw t;return await (0,u.sendResponse)(B,L,new Response(null,{status:500})),null}}e.s(["handler",()=>P,"patchFetch",()=>D,"routeModule",()=>A,"serverHooks",()=>N,"workAsyncStorage",()=>T,"workUnitAsyncStorage",()=>I],83745)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__b55c3b79._.js.map