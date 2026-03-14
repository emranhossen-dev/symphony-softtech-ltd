module.exports=[92037,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(25015),e=a.i(14548),f=a.i(92759),g=a.i(72857),h=a.i(54074),i=a.i(85682),j=a.i(69520),k=a.i(62722);let l=(0,a.i(70106).default)("terminal",[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]]);var m=a.i(44494),n=a.i(1631),o=a.i(15618),p=a.i(6704);function q(){let[a,q]=(0,c.useState)([{id:"1",name:"index.html",content:`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Hello World!</h1>
        <p>Welcome to the coding environment.</p>
        <button id="myButton">Click Me</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,language:"html",isMain:!0},{id:"2",name:"style.css",content:`* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

p {
    color: #666;
    margin-bottom: 1.5rem;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
}

button:hover {
    background: #5a6fd8;
}

button:active {
    transform: scale(0.98);
}`,language:"css",isMain:!1},{id:"3",name:"script.js",content:`document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');
    const container = document.querySelector('.container');
    
    button.addEventListener('click', function() {
        // Create a new element
        const message = document.createElement('div');
        message.textContent = 'Button clicked! Great job!';
        message.style.cssText = \`
            margin-top: 20px;
            padding: 10px;
            background: #4CAF50;
            color: white;
            border-radius: 5px;
            animation: fadeIn 0.5s ease;
        \`;
        
        // Add fade-in animation
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        \`;
        document.head.appendChild(style);
        
        container.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            message.remove();
        }, 3000);
    });
    
    // Add some interactivity
    console.log('Coding environment loaded successfully!');
});`,language:"javascript",isMain:!1}]),[r,s]=(0,c.useState)(a[0]),[t,u]=(0,c.useState)({html:a[0].content,css:a[1].content,js:a[2].content}),[v,w]=(0,c.useState)(null),[x,y]=(0,c.useState)(!1),[z,A]=(0,c.useState)("desktop"),[B,C]=(0,c.useState)([]),[D,E]=(0,c.useState)(!1),[F,G]=(0,c.useState)(!1),[H,I]=(0,c.useState)(!1),J=(0,c.useRef)(null),K=(0,c.useRef)(null),L=(0,c.useRef)(null),M=(0,c.useRef)(null);(0,c.useEffect)(()=>{if(K.current&&!J.current){let a=window.monaco?.editor?.create?.(K.current,{value:r.content,language:r.language,theme:"vs-dark",automaticLayout:!0,minimap:{enabled:!0},fontSize:14,lineNumbers:"on",roundedSelection:!1,scrollBeyondLastLine:!1,wordWrap:"on",bracketPairColorization:{enabled:!0},suggest:{showKeywords:!0,showSnippets:!0}});J.current=a,a.onDidChangeModelContent(()=>{let b=a.getValue();N(r.id,b)}),a.addCommand(window.monaco?.KeyMod?.CtrlCmd|window.monaco?.KeyCode?.KeyS,()=>{Q()}),a.addCommand(window.monaco?.KeyMod?.CtrlCmd|window.monaco?.KeyCode?.Enter,()=>{P()})}return()=>{J.current&&J.current.dispose()}},[]),(0,c.useEffect)(()=>{if(J.current&&r){let a=window.monaco?.editor?.createModel?.(r.content,r.language);J.current.setModel(a)}},[r]),(0,c.useEffect)(()=>{O()},[a]);let N=(b,c)=>{q(a=>a.map(a=>a.id===b?{...a,content:c}:a));let d=a.find(a=>"index.html"===a.name),e=a.find(a=>"style.css"===a.name),f=a.find(a=>"script.js"===a.name);u({html:d?.content||"",css:e?.content||"",js:f?.content||""})},O=()=>{if(L.current){let b=a.find(a=>"index.html"===a.name),c=a.find(a=>"style.css"===a.name),d=a.find(a=>"script.js"===a.name),e=`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <style>
                ${c?.content||""}
            </style>
        </head>
        <body>
            ${b?.content||""}
            <script>
                // Override console.log to capture output
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.log = function(...args) {
                    originalLog.apply(console, args);
                    window.parent.postMessage({
                        type: 'console',
                        level: 'log',
                        message: args.join(' ')
                    }, '*');
                };
                
                console.error = function(...args) {
                    originalError.apply(console, args);
                    window.parent.postMessage({
                        type: 'console',
                        level: 'error',
                        message: args.join(' ')
                    }, '*');
                };
                
                console.warn = function(...args) {
                    originalWarn.apply(console, args);
                    window.parent.postMessage({
                        type: 'console',
                        level: 'warn',
                        message: args.join(' ')
                    }, '*');
                };
                
                // Capture unhandled errors
                window.addEventListener('error', function(e) {
                    window.parent.postMessage({
                        type: 'console',
                        level: 'error',
                        message: e.message + ' at ' + e.filename + ':' + e.lineno
                    }, '*');
                });
                
                ${d?.content||""}
            </script>
        </body>
        </html>
      `;L.current.srcdoc=e}};(0,c.useEffect)(()=>{let a=a=>{"console"===a.data.type&&(C(b=>[...b,`[${a.data.level.toUpperCase()}] ${a.data.message}`]),M.current&&(M.current.scrollTop=M.current.scrollHeight))};return window.addEventListener("message",a),()=>window.removeEventListener("message",a)},[]);let P=()=>{y(!0),C([]),O(),setTimeout(()=>{y(!1),p.default.success("Code executed successfully!")},1e3)},Q=async()=>{G(!0);try{await new Promise(a=>setTimeout(a,1e3)),p.default.success("Code saved successfully!")}catch(a){p.default.error("Failed to save code")}finally{G(!1)}},R=async()=>{if(!v)return void p.default.error("No homework assigned");I(!0);try{v.id,a.map(a=>({name:a.name,content:a.content,language:a.language})),await new Promise(a=>setTimeout(a,2e3)),w(a=>a?{...a,status:"SUBMITTED"}:null),p.default.success("Homework submitted successfully!")}catch(a){p.default.error("Failed to submit homework")}finally{I(!1)}};return(0,b.jsxs)("div",{className:"h-screen flex flex-col bg-gray-900",children:[(0,b.jsx)("div",{className:"bg-gray-800 border-b border-gray-700 px-4 py-2",children:(0,b.jsxs)("div",{className:"flex items-center justify-between",children:[(0,b.jsxs)("div",{className:"flex items-center gap-4",children:[(0,b.jsxs)("h1",{className:"text-xl font-bold text-white flex items-center gap-2",children:[(0,b.jsx)(h.Code,{className:"w-6 h-6"}),"Coding Environment"]}),v&&(0,b.jsxs)("div",{className:"flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-full",children:[(0,b.jsx)(i.FileText,{className:"w-4 h-4"}),(0,b.jsx)("span",{className:"text-sm text-white",children:v.title}),(0,b.jsx)("span",{className:`px-2 py-0.5 rounded-full text-xs ${"PENDING"===v.status?"bg-yellow-500":"SUBMITTED"===v.status?"bg-blue-500":"bg-green-500"}`,children:v.status})]})]}),(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsxs)("button",{onClick:Q,disabled:F,className:"flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50",children:[F?(0,b.jsx)(j.RefreshCw,{className:"w-4 h-4 animate-spin"}):(0,b.jsx)(e.Save,{className:"w-4 h-4"}),"Save"]}),(0,b.jsxs)("button",{onClick:P,disabled:x,className:"flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50",children:[x?(0,b.jsx)(j.RefreshCw,{className:"w-4 h-4 animate-spin"}):(0,b.jsx)(d.Play,{className:"w-4 h-4"}),"Run"]}),(0,b.jsxs)("button",{onClick:R,disabled:H||!v,className:"flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50",children:[H?(0,b.jsx)(j.RefreshCw,{className:"w-4 h-4 animate-spin"}):(0,b.jsx)(f.Send,{className:"w-4 h-4"}),"Submit"]})]})]})}),(0,b.jsxs)("div",{className:"flex-1 flex overflow-hidden",children:[(0,b.jsxs)("div",{className:"w-64 bg-gray-800 border-r border-gray-700 flex flex-col",children:[(0,b.jsxs)("div",{className:"p-4 border-b border-gray-700",children:[(0,b.jsxs)("div",{className:"flex items-center justify-between mb-3",children:[(0,b.jsx)("h3",{className:"text-white font-medium",children:"Files"}),(0,b.jsx)("button",{onClick:()=>{let b={id:Date.now().toString(),name:`file${a.length+1}.html`,content:"",language:"html",isMain:!1};q(a=>[...a,b]),s(b)},className:"text-gray-400 hover:text-white",children:(0,b.jsx)(o.Plus,{className:"w-4 h-4"})})]}),(0,b.jsx)("div",{className:"space-y-1",children:a.map(c=>(0,b.jsxs)("div",{onClick:()=>{s(c)},className:`flex items-center justify-between p-2 rounded cursor-pointer ${r.id===c.id?"bg-gray-700":"hover:bg-gray-700"}`,children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)("span",{children:(a=>{switch(a){case"html":return"🌐";case"css":return"🎨";case"javascript":return"⚡";default:return"📄"}})(c.language)}),(0,b.jsx)("span",{className:"text-white text-sm",children:c.name}),c.isMain&&(0,b.jsx)("span",{className:"text-xs bg-blue-600 text-white px-1 rounded",children:"Main"})]}),(0,b.jsx)("button",{onClick:b=>{var d;b.stopPropagation(),d=c.id,a.length<=1?p.default.error("Cannot delete the last file"):(q(a=>a.filter(a=>a.id!==d)),r.id===d&&s(a.find(a=>a.id!==d)||a[0]))},className:"text-gray-400 hover:text-red-400",children:(0,b.jsx)(k.XCircle,{className:"w-3 h-3"})})]},c.id))})]}),v&&(0,b.jsxs)("div",{className:"flex-1 p-4 overflow-y-auto",children:[(0,b.jsx)("h3",{className:"text-white font-medium mb-3",children:"Homework Details"}),(0,b.jsxs)("div",{className:"space-y-3 text-sm",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-gray-400",children:"Due Date"}),(0,b.jsx)("p",{className:"text-white",children:new Date(v.dueDate).toLocaleDateString()})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-gray-400",children:"Requirements"}),(0,b.jsx)("p",{className:"text-white",children:v.requirements.description})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-gray-400",children:"Languages"}),(0,b.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:v.requirements.languages.map((a,c)=>(0,b.jsx)("span",{className:"text-xs bg-gray-700 text-white px-2 py-1 rounded",children:a},c))})]}),v.grade&&(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-gray-400",children:"Grade"}),(0,b.jsxs)("p",{className:"text-white",children:[v.grade,"%"]})]}),v.feedback&&(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-gray-400",children:"Feedback"}),(0,b.jsx)("p",{className:"text-white",children:v.feedback})]})]})]})]}),(0,b.jsx)("div",{className:"flex-1 flex flex-col",children:(0,b.jsxs)("div",{className:"flex-1 flex",children:[(0,b.jsxs)("div",{className:"flex-1 flex flex-col",children:[(0,b.jsxs)("div",{className:"bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between",children:[(0,b.jsx)("span",{className:"text-white text-sm",children:r.name}),(0,b.jsx)("div",{className:"flex items-center gap-2",children:(0,b.jsxs)("button",{onClick:()=>E(!D),className:`px-2 py-1 rounded text-sm ${D?"bg-blue-600 text-white":"bg-gray-700 text-gray-300"}`,children:[(0,b.jsx)(l,{className:"w-4 h-4"}),"Console"]})})]}),(0,b.jsxs)("div",{className:"flex-1 relative",children:[(0,b.jsx)("div",{ref:K,className:"w-full h-full"}),D&&(0,b.jsx)("div",{className:"absolute bottom-0 left-0 right-0 h-32 bg-black border-t border-gray-700",children:(0,b.jsx)("div",{ref:M,className:"h-full overflow-y-auto p-2 font-mono text-xs",children:0===B.length?(0,b.jsx)("div",{className:"text-gray-500",children:"Console output will appear here..."}):B.map((a,c)=>(0,b.jsx)("div",{className:`mb-1 ${a.includes("[ERROR]")?"text-red-400":a.includes("[WARN]")?"text-yellow-400":"text-green-400"}`,children:a},c))})})]})]}),(0,b.jsxs)("div",{className:"w-1/2 border-l border-gray-700 flex flex-col bg-white",children:[(0,b.jsxs)("div",{className:"bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between",children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)(g.Monitor,{className:"w-4 h-4"}),(0,b.jsx)("span",{className:"text-sm font-medium",children:"Live Preview"})]}),(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)("button",{onClick:()=>A("desktop"),className:`p-1 rounded ${"desktop"===z?"bg-white shadow":"bg-gray-200"}`,children:(0,b.jsx)(g.Monitor,{className:"w-4 h-4"})}),(0,b.jsx)("button",{onClick:()=>A("mobile"),className:`p-1 rounded ${"mobile"===z?"bg-white shadow":"bg-gray-200"}`,children:(0,b.jsx)(n.Smartphone,{className:"w-4 h-4"})}),(0,b.jsx)("button",{onClick:()=>{let a=window.open("","_blank");a&&(a.document.write(L.current?.srcdoc||""),a.document.close())},className:"p-1 rounded bg-gray-200 hover:bg-gray-300",children:(0,b.jsx)(m.Globe,{className:"w-4 h-4"})})]})]}),(0,b.jsx)("div",{className:"flex-1 bg-gray-50 p-4 overflow-auto",children:(0,b.jsx)("div",{className:"mx-auto bg-white shadow-lg",style:{width:"desktop"===z?"100%":"375px"},children:(0,b.jsx)("iframe",{ref:L,className:"w-full h-full min-h-[600px] border-0",sandbox:"allow-scripts allow-same-origin",title:"Live Preview"})})})]})]})})]})]})}a.s(["default",()=>q],92037)}];

//# sourceMappingURL=src_app_student_coding_page_tsx_78a5294a._.js.map