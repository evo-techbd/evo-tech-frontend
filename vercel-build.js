const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Run the build
console.log("Building Next.js app...");
execSync("npx next build", { stdio: "inherit" });

// Find all route group directories and create missing manifest files
const serverAppDir = path.join(process.cwd(), ".next", "server", "app");

function createManifestsInDir(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);

      // Check if it's a route group (starts with parenthesis)
      if (entry.name.startsWith("(")) {
        const manifestPath = path.join(
          fullPath,
          "page_client-reference-manifest.js"
        );
        const pageJsPath = path.join(fullPath, "page.js");

        // Create manifest file if page.js exists but manifest doesn't
        if (fs.existsSync(pageJsPath) && !fs.existsSync(manifestPath)) {
          console.log(`Creating missing manifest: ${manifestPath}`);
          fs.writeFileSync(manifestPath, "module.exports = {};\n");
        }
      }

      // Recurse into subdirectories
      createManifestsInDir(fullPath);
    }
  }
}

console.log("Creating missing client reference manifests...");
createManifestsInDir(serverAppDir);
console.log("Build complete!");
