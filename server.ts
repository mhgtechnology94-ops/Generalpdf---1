import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON request bodies up to 10MB (for raw files)
  app.use(express.json({ limit: '10mb' }));

  // Helper to ensure public & generalpdf dirs exist
  const getDirPaths = () => {
    const publicDir = path.join(process.cwd(), "public");
    const generalPdfDir = path.join(publicDir, "generalpdf");
    return { publicDir, generalPdfDir };
  };

  const ensureDirsExist = () => {
    const { publicDir, generalPdfDir } = getDirPaths();
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    if (!fs.existsSync(generalPdfDir)) {
      fs.mkdirSync(generalPdfDir);
    }
  };

  // API Route: Write modified files to the disk
  app.post("/api/save-files", (req, res) => {
    try {
      const { files } = req.body; // Array of { name: string, content: string }
      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid files format" });
      }

      ensureDirsExist();
      const { generalPdfDir } = getDirPaths();

      for (const file of files) {
        // Prevent directory traversal attacks
        const safeName = path.basename(file.name);
        const filePath = path.join(generalPdfDir, safeName);
        fs.writeFileSync(filePath, file.content, "utf-8");
      }

      console.log(`[Generalpdf] Successfully saved ${files.length} files to workspace.`);
      res.json({ success: true, message: "Files saved to workspace successfully!" });
    } catch (err: any) {
      console.error("[Generalpdf] Error saving files:", err);
      res.status(500).json({ error: err.message || "Failed to save files" });
    }
  });

  // API Route: Read existing files from the disk
  app.get("/api/get-files", (req, res) => {
    try {
      ensureDirsExist();
      const { generalPdfDir } = getDirPaths();
      const fileNames = ["index.html", "style.css", "script.js"];
      const filesData = [];

      for (const fileName of fileNames) {
        const filePath = path.join(generalPdfDir, fileName);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8");
          filesData.push({ name: fileName, content });
        }
      }

      res.json({ files: filesData });
    } catch (err: any) {
      console.error("[Generalpdf] Error reading files:", err);
      res.status(500).json({ error: err.message || "Failed to read files" });
    }
  });

  // Serve static assets out of the /public directory (e.g. /generalpdf/index.html)
  app.use(express.static(path.join(process.cwd(), "public")));

  // Vite integration in development mode
  if (process.env.NODE_ENV !== "production") {
    console.log("[Generalpdf] Launching Vite development server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production build delivery
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Generalpdf] Fullstack container listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
