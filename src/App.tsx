import { useState, useEffect, useRef, DragEvent } from "react";
import { 
  FileCode, 
  Eye, 
  Save, 
  Upload, 
  Github, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  HelpCircle, 
  Lock, 
  Code2,
  ListRestart
} from "lucide-react";

interface FileItem {
  name: string;
  content: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"preview" | "editor" | "guide">("preview");
  const [selectedFile, setSelectedFile] = useState<string>("index.html");
  const [files, setFiles] = useState<FileItem[]>([
    { name: "index.html", content: "<!-- Loading default template... -->" },
    { name: "style.css", content: "/* Loading stylesheet... */" },
    { name: "script.js", content: "// Loading scripts... " }
  ]);
  const [editorValue, setEditorValue] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [loadStatus, setLoadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial files from the Express backend
  const fetchFiles = async () => {
    setLoadStatus("loading");
    try {
      const response = await fetch("/api/get-files");
      if (!response.ok) throw new Error("Failed to contact workspace server");
      const data = await response.json();
      if (data.files && data.files.length > 0) {
        setFiles(data.files);
        // Find currently selected file content
        const curr = data.files.find((f: FileItem) => f.name === selectedFile);
        if (curr) {
          setEditorValue(curr.content);
        }
        setLoadStatus("success");
      } else {
        // Fallback to static files or initialize if empty
        setLoadStatus("error");
      }
    } catch (err) {
      console.warn("Express backend offline or starting up. Using local fallback.");
      setLoadStatus("error");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Update editor value when selected file changes
  useEffect(() => {
    const file = files.find(f => f.name === selectedFile);
    if (file) {
      setEditorValue(file.content);
    }
  }, [selectedFile, files]);

  // Handle local text changes in the editor
  const handleEditorChange = (val: string) => {
    setEditorValue(val);
    setFiles(prev => prev.map(f => f.name === selectedFile ? { ...f, content: val } : f));
  };

  // Save files to the server using /api/save-files
  const handleSaveToWorkspace = async () => {
    setSaveStatus("saving");
    try {
      const response = await fetch("/api/save-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files })
      });
      const data = await response.json();
      if (data.success) {
        setSaveStatus("success");
        setPreviewKey(prev => prev + 1); // reload preview iframe
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        throw new Error(data.error || "Save operation failed");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  // Handle raw file upload
  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const fileName = file.name.toLowerCase();
      if (["index.html", "style.css", "script.js"].includes(fileName)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            setFiles(prev => prev.map(f => f.name === fileName ? { ...f, content } : f));
            if (selectedFile === fileName) {
              setEditorValue(content);
            }
          }
        };
        reader.readAsText(file);
      }
    });

    // Automatically trigger save after a short delay
    setTimeout(() => {
      setActiveTab("editor");
    }, 100);
  };

  // Drag & drop handlers
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* Top Banner & Title Area */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-600 text-white p-2 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Generalpdf Workspace Portal
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                ACTIVE CONTAINER
              </span>
            </div>
            <p className="text-xs text-slate-400">Preview, edit and save your HTML/CSS/JS static PDF components directly in AI Studio</p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setPreviewKey(prev => prev + 1);
              fetchFiles();
            }}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all text-xs flex items-center space-x-1.5"
            title="Reload Workspace files"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Workspace</span>
          </button>
          
          <button 
            onClick={handleSaveToWorkspace}
            disabled={saveStatus === "saving"}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center space-x-2 transition-all shadow-md ${
              saveStatus === "success" 
                ? "bg-emerald-600 text-white" 
                : saveStatus === "error"
                ? "bg-rose-700 text-white"
                : "bg-rose-600 hover:bg-rose-700 text-white"
            }`}
          >
            <Save className="w-4 h-4" />
            <span>
              {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved to Disk!" : saveStatus === "error" ? "Save Failed" : "Save to Workspace"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Navigation / Controls */}
        <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-4 space-y-5">
          
          {/* Main Action Tabs */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2 mb-2">Workspace Views</span>
            <button
              onClick={() => setActiveTab("preview")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "preview" 
                  ? "bg-rose-600 text-white font-semibold" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live Application Preview</span>
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "editor" 
                  ? "bg-rose-600 text-white font-semibold" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Static Code Editor</span>
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "guide" 
                  ? "bg-rose-600 text-white font-semibold" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>GitHub Integration Guide</span>
            </button>
          </div>

          {/* Quick File Explorer */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2">Workspace Files</span>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
              {files.map(f => (
                <button
                  key={f.name}
                  onClick={() => {
                    setSelectedFile(f.name);
                    setActiveTab("editor");
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    selectedFile === f.name && activeTab === "editor"
                      ? "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{f.name}</span>
                  </span>
                  <span className="text-[9px] text-slate-500">Edit</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drag and Drop File Upload Area */}
          <div className="flex-1 flex flex-col justify-end">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                isDragOver 
                  ? "border-rose-500 bg-rose-950/20 text-rose-400" 
                  : "border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-300"
              }`}
            >
              <Upload className="w-6 h-6 text-slate-500" />
              <div className="text-xs font-medium">Drag & Drop Files Here</div>
              <p className="text-[9px] text-slate-500 max-w-[180px]">
                Support overwriting index.html, style.css, and script.js dynamically
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFileUpload(e.target.files)} 
                multiple 
                className="hidden" 
                accept=".html,.css,.js"
              />
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-500 space-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Port 3000 Active</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              <span>Static Site Hosted on /generalpdf/</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Active Workspace View */}
        <main className="flex-1 bg-slate-900 flex flex-col overflow-hidden">
          {activeTab === "preview" && (
            <div className="flex-1 flex flex-col h-full bg-slate-950">
              <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="text-xs font-semibold text-slate-200">Live Active Environment Preview</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-slate-500 font-mono">Location: /generalpdf/index.html</span>
                  <a
                    href="/generalpdf/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div className="flex-1 bg-slate-900 p-4">
                <iframe
                  key={previewKey}
                  src="/generalpdf/index.html"
                  className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-800"
                  title="Generalpdf Preview"
                />
              </div>
            </div>
          )}

          {activeTab === "editor" && (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
              <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-bold text-slate-200 font-mono">{selectedFile}</h3>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span>Modifications auto-save in browser session. Press &quot;Save to Workspace&quot; to write to disk.</span>
                </div>
              </div>
              
              {/* Code Editor TextArea */}
              <div className="flex-1 relative overflow-hidden flex">
                <textarea
                  value={editorValue}
                  onChange={(e) => handleEditorChange(e.target.value)}
                  className="flex-1 w-full p-6 font-mono text-xs text-slate-300 bg-slate-950 focus:outline-none resize-none leading-relaxed h-full border-none outline-none overflow-y-auto"
                  placeholder="Insert code here..."
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="border-b border-slate-800 pb-5">
                  <div className="flex items-center space-x-3 mb-2">
                    <Github className="w-8 h-8 text-rose-500" />
                    <h2 className="text-2xl font-bold tracking-tight text-white">How to connect and push to GitHub</h2>
                  </div>
                  <p className="text-sm text-slate-400">
                    Follow these clean and simple instructions to synchronize your newly configured Generalpdf workspace directly to your GitHub repository.
                  </p>
                </div>

                {/* Steps */}
                <div className="grid gap-6">
                  <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600/20 text-xs font-bold text-rose-400">1</span>
                      <h3 className="text-sm font-semibold text-white">Commit and Save Your File Changes</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-8">
                      Make any necessary adjustments using the <strong>Static Code Editor</strong> or the <strong>File Drag & Drop Uploader</strong>. Once satisfied, click the <strong>Save to Workspace</strong> button in the top right corner. This writes the actual HTML, CSS, and JS files to the persistent folder <code>/public/generalpdf/</code> on our Cloud server.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600/20 text-xs font-bold text-rose-400">2</span>
                      <h3 className="text-sm font-semibold text-white">Open the AI Studio Settings</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-8">
                      Navigate to the main top-right header controls in the <strong>Google AI Studio UI</strong>. Look for the cog icon or settings tab representing the project workspace configurations.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600/20 text-xs font-bold text-rose-400">3</span>
                      <h3 className="text-sm font-semibold text-white">Authenticate and Connect GitHub</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-8">
                      Select the <strong>Connect to GitHub</strong> or <strong>Export to GitHub Repository</strong> workflow. Follow the authentication prompts to authorize your GitHub account and choose to either create a new repository (e.g. <code>generalpdf-app</code>) or sync with an existing branch. All changes you saved will instantly be committed and exported.
                    </p>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-slate-900/30 p-6 rounded-xl border border-rose-500/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Important Workspace Facts</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed pl-2">
                    <li>Vite acts as the fast and light dev server, binding properly to host <code>0.0.0.0</code> on port <code>3000</code>.</li>
                    <li>Files created inside the <code>/public/generalpdf/</code> directory are served directly, keeping them unmodified as-is.</li>
                    <li>Any third-party PDF compilation scripts will execute safely in client-side sandboxes.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
