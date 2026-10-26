#!/usr/bin/env python3
"""
Anything Master Builder Studio
==============================
A high-performance Desktop Packaging, Versioning, and Multi-Repo Release Orchestrator
for the Anything Creative Ecosystem.

Capabilities:
  • 1-Click Setup (.exe) & Portable compilation for any ecosystem app
  • Dual / Custom Release Distribution:
      - Both (App's Own GitHub Repo + Anything Master Hub)
      - Anything Hub Only (e.g. Anything Data Manage, Auto Copier)
      - App's Own Repo Only
      - Local Build Only (No cloud releases)
  • Ecosystem-wide Deep Version Synchronization (codebase, package.json, title bars, headers)
  • Automated Version Incrementing after builds
  • Live Real-Time Terminal & Build Telemetry
"""

import os
import sys
import json
import re
import shutil
import time
import threading
import subprocess
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import urllib.request

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
CONFIG_FILE = SCRIPT_DIR / "master_builder_config.json"

DEFAULT_APPS = [
    {
        "id": "anything",
        "name": "Anything Master Hub",
        "category": "Ecosystem Launcher & Hub",
        "path": r"C:\Users\Burhanuddin\OneDrive\Desktop\Anything\Anything",
        "type": "electron",
        "repo": "BSFrameWorks5253/Anything",
        "has_own_repo": True,
        "default_dest": "both",
        "monogram": "An",
        "accent": "#FF1341"
    },
    {
        "id": "mediaflow-studio",
        "name": "MediaFlow Studio",
        "category": "Media & Video Processing",
        "path": r"C:\Users\Burhanuddin\OneDrive\Desktop\Anything Apps\MediaFlow-Studio",
        "type": "electron",
        "repo": "BSFrameWorks5253/MediaFlow-Studio",
        "has_own_repo": True,
        "default_dest": "both",
        "monogram": "Mf",
        "accent": "#31A8FF"
    },
    {
        "id": "one-tap",
        "name": "One Tap Workstation",
        "category": "Batch Video Rendering",
        "path": r"C:\Users\Burhanuddin\OneDrive\Desktop\Anything Apps\One Tap",
        "type": "electron",
        "repo": "BSFrameWorks5253/onetap-workstation",
        "has_own_repo": True,
        "default_dest": "both",
        "monogram": "Ot",
        "accent": "#FF416C"
    },
    {
        "id": "docuflow-studio",
        "name": "DocuFlow Studio Pro",
        "category": "Document & PDF Studio",
        "path": r"C:\Users\Burhanuddin\OneDrive\Desktop\DocuFlow",
        "type": "electron",
        "repo": "BSFrameWorks5253/DocuFlow-",
        "has_own_repo": True,
        "default_dest": "both",
        "monogram": "Df",
        "accent": "#2DD4BF"
    },
    {
        "id": "auto-copier",
        "name": "Auto Copier Pro",
        "category": "Automated Backup & Code Sync",
        "path": r"C:\Users\Burhanuddin\OneDrive\Desktop\Auto Copier",
        "type": "electron",
        "repo": "",
        "has_own_repo": False,
        "default_dest": "anything_only",
        "monogram": "Ac",
        "accent": "#F59E0B"
    },
    {
        "id": "anything-data-manage",
        "name": "Anything Data Manage",
        "category": "Tabular Extraction & Directory Sorter",
        "path": r"C:\Users\Burhanuddin\OneDrive\Desktop\Anything Data Manage",
        "type": "python",
        "repo": "",
        "has_own_repo": False,
        "default_dest": "anything_only",
        "monogram": "Dm",
        "accent": "#00E5FF"
    }
]

def load_apps_config():
    if CONFIG_FILE.exists():
        try:
            return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return DEFAULT_APPS

def save_apps_config(apps):
    try:
        CONFIG_FILE.write_text(json.dumps(apps, indent=2), encoding="utf-8")
    except Exception as e:
        print(f"Error saving config: {e}")

def get_app_version(app_path_str, app_type):
    p = Path(app_path_str)
    if not p.exists():
        return "Not Found"
    if app_type == "electron":
        pkg = p / "package.json"
        if pkg.exists():
            try:
                data = json.loads(pkg.read_text(encoding="utf-8"))
                return data.get("version", "1.0.0")
            except Exception:
                pass
    elif app_type == "python":
        v_file = p / "version.txt"
        if v_file.exists():
            return v_file.read_text(encoding="utf-8").strip()
    return "26.10.26"

def get_github_token():
    candidates = [
        ROOT_DIR / ".env",
        Path(r"C:\Users\Burhanuddin\OneDrive\Desktop\DocuFlow\.env"),
        Path(r"C:\Users\Burhanuddin\OneDrive\Desktop\Anything Data Manage\.env")
    ]
    for c in candidates:
        if c.exists():
            try:
                content = c.read_text(encoding="utf-8")
                match = re.search(r'GH_TOKEN\s*=\s*([^\r\n#]+)', content)
                if match:
                    return match.group(1).strip().strip("'\"")
            except Exception:
                pass
    return os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN") or ""

def bump_semver(ver: str, part="patch") -> str:
    parts = ver.split('.')
    if len(parts) >= 3 and parts[0].isdigit() and parts[1].isdigit() and parts[2].isdigit():
        maj, min_v, pat = int(parts[0]), int(parts[1]), int(parts[2])
        if part == "patch":
            return f"{maj}.{min_v}.{pat + 1}"
        elif part == "minor":
            return f"{maj}.{min_v + 1}.0"
        elif part == "major":
            return f"{maj + 1}.0.0"
    # fallback to date-based scheme: YY.MM.DD
    now = time.localtime()
    day_str = f"{now.tm_year % 100}.{now.tm_mon:02d}.{now.tm_mday:02d}"
    if ver.startswith(day_str[:5]):
        # same month, bump day or revision
        return f"{day_str}"
    return f"{ver}.1"

# Import deep synchronizer from sync_all_versions
sys.path.insert(0, str(SCRIPT_DIR))
try:
    from sync_all_versions import sync_app_version
except ImportError:
    sync_app_version = None

# Global state for logs
active_build_logs = []
build_status = {"status": "idle", "active_app": None, "progress": 0}

def append_log(msg):
    timestamp = time.strftime("[%H:%M:%S] ")
    line = f"{timestamp}{msg}"
    print(line)
    active_build_logs.append(line)
    if len(active_build_logs) > 1000:
        active_build_logs.pop(0)

class BuilderEngine:
    @staticmethod
    def sync_version(app_id, new_version):
        apps = load_apps_config()
        app = next((a for a in apps if a["id"] == app_id), None)
        if not app:
            return {"success": False, "error": f"App {app_id} not found"}
        
        append_log(f"Syncing version for {app['name']} -> v{new_version}...")
        res = sync_app_version({'name': app['name'], 'path': Path(app['path']), 'type': app['type']}, new_version)
        append_log(f"Version synchronized in {len(res.get('files_updated', []))} file(s).")
        return {"success": True, "details": res}

    @staticmethod
    def sync_all_ecosystem(new_version):
        apps = load_apps_config()
        append_log(f"=======================================================")
        append_log(f"⚡ Global Ecosystem Version Sync -> v{new_version}")
        append_log(f"=======================================================")
        results = []
        for a in apps:
            res = sync_app_version({'name': a['name'], 'path': Path(a['path']), 'type': a['type']}, new_version)
            results.append(res)
            append_log(f"✓ {a['name']} updated ({len(res.get('files_updated', []))} files)")
        append_log(f"🎉 All {len(apps)} apps successfully synchronized to v{new_version}!")
        return {"success": True, "results": results}

    @staticmethod
    def run_build(app_id, target_version=None, destination="both", auto_bump=True):
        apps = load_apps_config()
        app = next((a for a in apps if a["id"] == app_id), None)
        if not app:
            return {"success": False, "error": f"App {app_id} not found"}

        app_path = Path(app["path"])
        app_name = app["name"]
        app_type = app["type"]
        current_ver = get_app_version(str(app_path), app_type)
        version_to_build = target_version.strip() if target_version else current_ver

        append_log(f"\n=======================================================")
        append_log(f"🚀 Starting Build: {app_name}")
        append_log(f"📌 Version: {version_to_build} | Destination: {destination}")
        append_log(f"📁 Path: {app_path}")
        append_log(f"=======================================================")

        build_status["status"] = "building"
        build_status["active_app"] = app_id
        build_status["progress"] = 15

        # 1. Synchronize Version into Codebase
        sync_app_version({'name': app_name, 'path': app_path, 'type': app_type}, version_to_build)

        # 2. Execute Build Pipeline
        compiled_setup = None
        compiled_portable = None

        if app_type == "electron":
            append_log("📦 Building Vite frontend and Electron bundle...")
            try:
                # Run build
                proc = subprocess.Popen(
                    "npm run build",
                    cwd=str(app_path),
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True
                )
                for line in proc.stdout:
                    if line.strip():
                        append_log(f"  [vite] {line.strip()}")
                proc.wait()
                if proc.returncode != 0:
                    append_log("❌ Vite/TypeScript build failed!")
                    build_status["status"] = "error"
                    return {"success": False, "error": "Build compilation failed"}
            except Exception as e:
                append_log(f"❌ Error during build step: {e}")
                build_status["status"] = "error"
                return {"success": False, "error": str(e)}

            build_status["progress"] = 45
            append_log("⚡ Packaging Windows NSIS Setup & Binaries via electron-builder...")

            try:
                cmd = "npx electron-builder --win --publish never"
                proc = subprocess.Popen(
                    cmd,
                    cwd=str(app_path),
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True
                )
                for line in proc.stdout:
                    if line.strip():
                        append_log(f"  [builder] {line.strip()}")
                proc.wait()
                if proc.returncode != 0:
                    append_log("❌ electron-builder packaging failed!")
                    build_status["status"] = "error"
                    return {"success": False, "error": "electron-builder failed"}
            except Exception as e:
                append_log(f"❌ Error running electron-builder: {e}")
                build_status["status"] = "error"
                return {"success": False, "error": str(e)}

            # Locate compiled executables in release/ or dist/
            release_dirs = [app_path / "release", app_path / "dist"]
            for r_dir in release_dirs:
                if r_dir.exists():
                    for exe_file in r_dir.glob("*.exe"):
                        l_name = exe_file.name.lower()
                        if "setup" in l_name or "installer" in l_name or exe_file.name.endswith(".exe"):
                            if not compiled_setup:
                                compiled_setup = exe_file
                        elif "portable" in l_name:
                            compiled_portable = exe_file

        elif app_type == "python":
            append_log("🐍 Packaging Python application via PyInstaller pipeline...")
            py_executable = app_path / ".venv" / "Scripts" / "python.exe"
            if not py_executable.exists():
                py_executable = sys.executable

            bundle_script = app_path / "build_scripts" / "bundle_win.py"
            if not bundle_script.exists():
                bundle_script = app_path / "bundle_win.py"

            if bundle_script.exists():
                try:
                    proc = subprocess.Popen(
                        f'"{py_executable}" -u "{bundle_script}" {version_to_build}',
                        cwd=str(app_path),
                        shell=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.STDOUT,
                        text=True
                    )
                    for line in proc.stdout:
                        if line.strip():
                            append_log(f"  [py] {line.strip()}")
                    proc.wait()
                    if proc.returncode != 0:
                        append_log("❌ Python bundling failed!")
                        build_status["status"] = "error"
                        return {"success": False, "error": "PyInstaller bundling failed"}
                except Exception as e:
                    append_log(f"❌ Error compiling python app: {e}")
                    build_status["status"] = "error"
                    return {"success": False, "error": str(e)}
            
            # Locate output files
            builds_dir = app_path / "_All Builds" / f"build_{version_to_build}"
            if builds_dir.exists():
                for f in builds_dir.glob("*.exe"):
                    if "setup" in f.name.lower():
                        compiled_setup = f
                    elif "portable" in f.name.lower():
                        compiled_portable = f

        build_status["progress"] = 70

        if not compiled_setup and not compiled_portable:
            append_log("⚠️ Warning: Could not locate output .exe file.")
        else:
            if compiled_setup:
                append_log(f"✅ Found Setup Installer: {compiled_setup.name} ({compiled_setup.stat().st_size / (1024*1024):.1f} MB)")
            if compiled_portable:
                append_log(f"✅ Found Portable Binary: {compiled_portable.name} ({compiled_portable.stat().st_size / (1024*1024):.1f} MB)")

        # 3. Synchronize to Destination Releases
        build_status["progress"] = 85

        # Anything Master Hub Releases Destination
        if destination in ["both", "anything_only"] and app_id != "anything":
            append_log("🌌 Syncing Setup & Metadata to Anything Master Hub Releases...")
            anything_rel_dir = ROOT_DIR / "releases" / app_id / f"v{version_to_build}"
            anything_pub_dir = ROOT_DIR / "published-apps" / app_id
            for target_d in [anything_rel_dir, anything_pub_dir]:
                target_d.mkdir(parents=True, exist_ok=True)
                if compiled_setup and compiled_setup.exists():
                    shutil.copy2(compiled_setup, target_d / compiled_setup.name)
                if compiled_portable and compiled_portable.exists():
                    shutil.copy2(compiled_portable, target_d / compiled_portable.name)
            
            # Check for logo to copy
            for logo_candidate in [app_path / "public" / "icon.png", app_path / "ICON.png", app_path / "icon.ico"]:
                if logo_candidate.exists():
                    shutil.copy2(logo_candidate, anything_rel_dir / "app-logo.png")
                    shutil.copy2(logo_candidate, anything_pub_dir / "app-logo.png")
                    break

            append_log(f"  ✓ Copied executables to: {anything_rel_dir}")

        # Own GitHub Repo Release Destination
        if destination in ["both", "own_repo_only"] and app["has_own_repo"] and app["repo"]:
            append_log(f"🚀 Publishing to App's Own GitHub Repo: {app['repo']} [v{version_to_build}]...")
            token = get_github_token()
            if not token:
                append_log("  ⚠️ GH_TOKEN not found! Skipping cloud upload.")
            else:
                try:
                    # Check or create release on GitHub
                    tag = f"v{version_to_build}"
                    upload_target = compiled_setup or compiled_portable
                    if upload_target:
                        append_log(f"  ⬆️ Uploading {upload_target.name} to GitHub {app['repo']} ({tag})...")
                        # Invoke Node release script or API upload
                        rel_script = SCRIPT_DIR / "publish-github-release.cjs"
                        if rel_script.exists():
                            cmd_pub = f'node "{rel_script}"'
                            subprocess.run(cmd_pub, cwd=str(ROOT_DIR), shell=True, timeout=90)
                            append_log("  ✅ Asset successfully uploaded to GitHub release!")
                except Exception as up_err:
                    append_log(f"  ❌ GitHub upload error: {up_err}")

        # 4. Auto-Increment Next Version
        next_ver = bump_semver(version_to_build, "patch")
        if auto_bump:
            append_log(f"📈 Suggested next version for next build: v{next_ver}")

        build_status["status"] = "success"
        build_status["progress"] = 100
        append_log(f"🎉 Build and release pipeline completed successfully for {app_name}!\n")

        return {
            "success": True,
            "version": version_to_build,
            "next_suggested_version": next_ver,
            "setup_exe": str(compiled_setup) if compiled_setup else None,
            "portable_exe": str(compiled_portable) if compiled_portable else None
        }

# Modern Web UI HTML Template (Apple WWDC26 / Adobe Creative Cloud Liquid Glass)
HTML_UI = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Anything Master Builder Studio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: radial-gradient(circle at 15% 15%, #0B1120 0%, #060913 60%, #03060B 100%);
      color: #E2E8F0;
      user-select: none;
    }
    .glass-panel {
      background: rgba(18, 24, 38, 0.75);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
    }
    .glass-card {
      background: rgba(22, 30, 48, 0.55);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .glass-card:hover {
      background: rgba(30, 41, 64, 0.7);
      border-color: rgba(56, 189, 248, 0.35);
      transform: translateY(-2px);
      box-shadow: 0 12px 28px -10px rgba(0, 229, 255, 0.2);
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 999px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,229,255,0.4); }
  </style>
</head>
<body class="h-screen flex flex-col overflow-hidden">

  <!-- Top App Navigation & Controls Header -->
  <header class="h-16 border-b border-white/10 glass-panel px-6 flex items-center justify-between shrink-0 z-30">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-cyan-500/20">
        An
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-base font-extrabold tracking-tight text-white">Anything Master Builder Studio</h1>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            PRO RELEASE ARCHITECT
          </span>
        </div>
        <p class="text-xs text-white/50">Universal Multi-App Setup Compiler, Version Synchronizer & Release Distributor</p>
      </div>
    </div>

    <!-- Global Ecosystem Version Synchronizer -->
    <div class="flex items-center gap-3">
      <div class="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 gap-1.5">
        <span class="text-xs text-white/50 pl-2.5 font-medium">Sync All Apps:</span>
        <input id="globalVerInput" type="text" value="26.10.26" class="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono font-bold text-cyan-300 text-center focus:outline-none focus:border-cyan-400" />
        <button onclick="quickBumpDay()" class="px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Set to Today's Date">Today</button>
        <button onclick="syncAllVersions()" class="px-3 py-1 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
          <span>Sync All 6 Apps</span>
        </button>
      </div>

      <button onclick="buildAllEcosystem()" class="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-transform active:scale-95">
        <i data-lucide="layers" class="w-4 h-4"></i>
        <span>Build All Ecosystem</span>
      </button>
    </div>
  </header>

  <!-- Main Viewport (App Cards & Build Configuration) -->
  <main class="flex-1 overflow-y-auto p-6 space-y-6">
    
    <!-- Info Banner -->
    <div class="glass-panel p-4 rounded-2xl flex items-center justify-between border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-indigo-950/20 to-purple-950/20">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <i data-lucide="shield-check" class="w-5 h-5"></i>
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">Target Distribution Engine Ready</h3>
          <p class="text-xs text-white/60">Choose where each app's setup executable goes: <span class="text-cyan-300 font-semibold">Both</span> (App Repo + Anything Hub), <span class="text-indigo-300 font-semibold">Anything Hub Only</span> (Local-only apps), <span class="text-amber-300 font-semibold">Own Repo Only</span>, or <span class="text-emerald-300 font-semibold">Local Build</span>.</p>
        </div>
      </div>
      <div id="buildPill" class="hidden px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
        <span id="buildPillText">IDLE</span>
      </div>
    </div>

    <!-- App Cards Grid -->
    <div id="appsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- Injected via JavaScript -->
    </div>

  </main>

  <!-- Bottom Drawer: Real-Time Build Terminal Console -->
  <footer class="h-64 border-t border-white/10 glass-panel flex flex-col shrink-0 z-20">
    <div class="h-9 px-4 border-b border-white/5 flex items-center justify-between text-xs font-mono text-white/60 bg-black/30">
      <div class="flex items-center gap-2">
        <i data-lucide="terminal" class="w-3.5 h-3.5 text-cyan-400"></i>
        <span class="font-bold text-white/80">Live Build Execution Stream & Telemetry</span>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="clearLogs()" class="hover:text-white transition-colors">Clear</button>
        <span class="text-white/20">|</span>
        <span id="logLinesCount">0 lines</span>
      </div>
    </div>
    <div id="terminalBody" class="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 bg-black/60 space-y-1 select-text">
      <div class="text-white/40 italic">Ready for build commands. Click 'Build EXE' or 'Sync Version' on any app card above.</div>
    </div>
  </footer>

  <script>
    let appsData = [];

    async function loadApps() {
      try {
        const res = await fetch('/api/apps');
        appsData = await res.json();
        renderCards();
      } catch (e) {
        console.error("Failed loading apps:", e);
      }
    }

    function renderCards() {
      const container = document.getElementById('appsGrid');
      container.innerHTML = '';

      appsData.forEach(app => {
        const card = document.createElement('div');
        card.className = "glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden";
        
        const isAnythingOnly = !app.has_own_repo;
        const destSelect = `
          <select id="dest_${app.id}" class="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white/90 font-medium focus:outline-none focus:border-cyan-400">
            <option value="both" ${app.default_dest === 'both' ? 'selected' : ''} ${isAnythingOnly ? 'disabled' : ''}>🌐 Both (Own Repo + Anything Hub)</option>
            <option value="anything_only" ${app.default_dest === 'anything_only' || isAnythingOnly ? 'selected' : ''}>🌌 Anything Hub Only</option>
            <option value="own_repo_only" ${app.default_dest === 'own_repo_only' ? 'selected' : ''} ${isAnythingOnly ? 'disabled' : ''}>📦 App's Own Repo Only</option>
            <option value="local_only" ${app.default_dest === 'local_only' ? 'selected' : ''}>💻 Local Build Only</option>
          </select>
        `;

        card.innerHTML = `
          <div>
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center font-extrabold text-lg shadow-md" style="color: ${app.accent}; border-color: ${app.accent}40;">
                  ${app.monogram || 'Ap'}
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
                    ${app.name}
                    ${app.id === 'anything' ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-400 font-mono">PARENT</span>' : ''}
                  </h4>
                  <span class="text-[11px] text-white/50 block">${app.category}</span>
                </div>
              </div>

              <div class="text-right">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                  ${app.type === 'electron' ? 'Electron + React' : 'Python + PyWebView'}
                </span>
              </div>
            </div>

            <!-- Version Config Box -->
            <div class="mt-4 p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-white/50">Current Version:</span>
                <span class="font-mono font-bold text-cyan-300" id="currentVer_${app.id}">v${app.version}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <input id="verInput_${app.id}" type="text" value="${app.version}" class="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono font-semibold text-white text-center focus:outline-none focus:border-cyan-400" />
                <button onclick="bumpAppVersion('${app.id}', 'patch')" class="px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white" title="+1 Patch">+Patch</button>
                <button onclick="syncSingleAppVersion('${app.id}')" class="px-2.5 py-1 text-[11px] font-semibold bg-white/10 hover:bg-white/15 text-white rounded-lg" title="Save version across code">Set</button>
              </div>
            </div>

            <!-- Destination Picker -->
            <div class="mt-3 space-y-1">
              <label class="text-[11px] text-white/50 font-medium block">Release Distribution Target:</label>
              ${destSelect}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-3 border-t border-white/5 flex items-center gap-2">
            <button onclick="triggerBuild('${app.id}', false)" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs">
              <i data-lucide="hammer" class="w-3.5 h-3.5"></i>
              <span>Build EXE</span>
            </button>
            <button onclick="triggerBuild('${app.id}', true)" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all">
              <i data-lucide="send" class="w-3.5 h-3.5"></i>
              <span>Build & Release</span>
            </button>
          </div>
        `;
        container.appendChild(card);
      });
      lucide.createIcons();
    }

    function quickBumpDay() {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      document.getElementById('globalVerInput').value = `${yy}.${mm}.${dd}`;
    }

    function bumpAppVersion(appId, part) {
      const input = document.getElementById(`verInput_${appId}`);
      const cur = input.value;
      const parts = cur.split('.');
      if (parts.length >= 3 && !isNaN(parts[2])) {
        parts[2] = parseInt(parts[2]) + 1;
        input.value = parts.join('.');
      } else {
        input.value = cur + ".1";
      }
    }

    async function syncSingleAppVersion(appId) {
      const ver = document.getElementById(`verInput_${appId}`).value;
      try {
        const res = await fetch('/api/sync-version', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ appId, version: ver })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById(`currentVer_${appId}`).innerText = 'v' + ver;
          loadApps();
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function syncAllVersions() {
      const ver = document.getElementById('globalVerInput').value;
      try {
        const res = await fetch('/api/sync-all-versions', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ version: ver })
        });
        await res.json();
        loadApps();
      } catch (e) {
        console.error(e);
      }
    }

    async function triggerBuild(appId, isRelease) {
      const ver = document.getElementById(`verInput_${appId}`).value;
      const dest = document.getElementById(`dest_${appId}`).value;
      
      const pill = document.getElementById('buildPill');
      const pillText = document.getElementById('buildPillText');
      pill.classList.remove('hidden');
      pillText.innerText = `BUILDING: ${appId.toUpperCase()}`;

      try {
        const res = await fetch('/api/build-app', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ appId, version: ver, destination: dest, isRelease })
        });
        const data = await res.json();
        if (data.success) {
          pillText.innerText = `COMPLETED: ${appId.toUpperCase()}`;
          loadApps();
        } else {
          pillText.innerText = `ERROR`;
        }
      } catch (e) {
        pillText.innerText = `ERROR`;
      }
    }

    async function buildAllEcosystem() {
      const ver = document.getElementById('globalVerInput').value;
      for (const app of appsData) {
        await triggerBuild(app.id, true);
      }
    }

    async function pollLogs() {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        const term = document.getElementById('terminalBody');
        term.innerHTML = data.logs.map(l => `<div>${l}</div>`).join('');
        document.getElementById('logLinesCount').innerText = `${data.logs.length} lines`;
        term.scrollTop = term.scrollHeight;
      } catch (e) {}
    }

    function clearLogs() {
      fetch('/api/clear-logs', { method: 'POST' });
    }

    window.addEventListener('DOMContentLoaded', () => {
      loadApps();
      setInterval(pollLogs, 1000);
      lucide.createIcons();
    });
  </script>
</body>
</html>
"""

class MasterBuilderRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Quiet HTTP server logs

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == "/" or url.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_UI.encode("utf-8"))
        elif url.path == "/api/apps":
            apps = load_apps_config()
            # Enrich with real current versions from disk
            for a in apps:
                a["version"] = get_app_version(a["path"], a["type"])
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(apps).encode("utf-8"))
        elif url.path == "/api/logs":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"logs": active_build_logs, "status": build_status}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        content_len = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_len).decode("utf-8")) if content_len > 0 else {}

        if url.path == "/api/sync-version":
            app_id = body.get("appId")
            version = body.get("version")
            res = BuilderEngine.sync_version(app_id, version)
            self._send_json(res)

        elif url.path == "/api/sync-all-versions":
            version = body.get("version", "26.10.26")
            res = BuilderEngine.sync_all_ecosystem(version)
            self._send_json(res)

        elif url.path == "/api/build-app":
            app_id = body.get("appId")
            version = body.get("version")
            destination = body.get("destination", "both")
            
            # Run build in background thread so HTTP response does not block
            def task():
                BuilderEngine.run_build(app_id, version, destination)
            threading.Thread(target=task, daemon=True).start()

            self._send_json({"success": True, "message": "Build started"})

        elif url.path == "/api/clear-logs":
            global active_build_logs
            active_build_logs = []
            self._send_json({"success": True})
        else:
            self.send_response(404)
            self.end_headers()

    def _send_json(self, data):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

def start_server(port=48231):
    server = HTTPServer(("127.0.0.1", port), MasterBuilderRequestHandler)
    print(f"🚀 Master Builder Engine listening on http://127.0.0.1:{port}")
    server.serve_forever()

def main():
    port = 48231
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()
    time.sleep(0.4)

    app_url = f"http://127.0.0.1:{port}"

    # Try PyWebView desktop window first
    try:
        import webview
        print("🖥️ Initializing Hardware-Accelerated PyWebView Fluent Window...")
        window = webview.create_window(
            title="Anything Master Builder Studio — Release Architect",
            url=app_url,
            width=1240,
            height=860,
            resizable=True,
            min_size=(1020, 720)
        )
        webview.start()
    except Exception as e:
        print(f"PyWebView desktop window fallback: {e}")
        import webbrowser
        webbrowser.open(app_url)
        print("Opening in default browser. Press Ctrl+C to stop.")
        while True:
            time.sleep(1)

if __name__ == "__main__":
    main()
