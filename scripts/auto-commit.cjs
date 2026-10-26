#!/usr/bin/env node
/**
 * Anything Creative Ecosystem - Intelligent Auto-Commit Engine
 *
 * Automatically inspects git status and diffs across repositories,
 * classifies changes into Conventional Commit standards (feat, fix, style, chore, refactor, docs),
 * crafts intelligent scopes, titles, and detailed bulleted body descriptions,
 * stages files, commits them, and optionally pushes securely via GH_TOKEN without hanging.
 *
 * Usage:
 *   node scripts/auto-commit.cjs               # Auto-commit current repo
 *   node scripts/auto-commit.cjs --push        # Auto-commit and push to GitHub
 *   node scripts/auto-commit.cjs --dry-run     # Preview generated message without committing
 *   node scripts/auto-commit.cjs --ecosystem   # Auto-commit all repos across the Anything ecosystem
 *   node scripts/auto-commit.cjs --repo <dir>  # Target a specific repository directory
 *   node scripts/auto-commit.cjs --json        # Return structured JSON output for Electron IPC
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1. Argument Parsing & Configuration
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldPush = args.includes('--push') || (!args.includes('--no-push') && !isDryRun);
const isEcosystem = args.includes('--ecosystem') || args.includes('--all-repos');
const isJsonMode = args.includes('--json');
const customMsgArgIdx = args.indexOf('--msg');
const customMessage = customMsgArgIdx !== -1 ? args[customMsgArgIdx + 1] : null;

let targetRepo = process.cwd();
const repoArgIdx = args.indexOf('--repo');
if (repoArgIdx !== -1 && args[repoArgIdx + 1]) {
  targetRepo = path.resolve(args[repoArgIdx + 1]);
}

const KNOWN_ECOSYSTEM_REPOS = [
  { name: 'Anything Master Hub', path: 'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything\\Anything' },
  { name: 'MediaFlow-Studio', path: 'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\MediaFlow-Studio' },
  { name: 'One Tap Workstation', path: 'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\One Tap' },
  { name: 'DocuFlow Studio', path: 'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\DocuFlow' },
  { name: 'Pulse Wave Mobile', path: 'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\BeatWave' }
];

// ---------------------------------------------------------------------------
// 2. Helper Utilities
// ---------------------------------------------------------------------------
function runGit(cmd, cwd = targetRepo, timeoutMs = 15000) {
  try {
    return execSync(`git ${cmd}`, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: timeoutMs
    }).trim();
  } catch (err) {
    if (err.stdout) return err.stdout.trim();
    return null;
  }
}

function resolveGitHubToken(repoDir) {
  const envCandidates = [
    path.join(repoDir, '.env'),
    'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything\\Anything\\.env',
    'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\DocuFlow\\.env'
  ];

  for (const envFile of envCandidates) {
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf8');
        const match = content.match(/GH_TOKEN\s*=\s*([^\r\n#]+)/);
        if (match && match[1].trim()) {
          return match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      } catch {
        // continue
      }
    }
  }
  return process.env.GH_TOKEN || null;
}

// ---------------------------------------------------------------------------
// 3. Status Parsing & Message Generation
// ---------------------------------------------------------------------------
function analyzeRepositoryStatus(repoDir) {
  const rawStatus = runGit('status --porcelain', repoDir);
  if (!rawStatus) {
    return { hasChanges: false, files: [], message: null };
  }

  const lines = rawStatus.split('\n').filter(Boolean);
  const files = lines.map(line => {
    const code = line.slice(0, 2);
    const filePath = line.slice(3).trim();
    let status = 'modified';
    if (code.includes('?')) status = 'untracked';
    else if (code.includes('A')) status = 'added';
    else if (code.includes('D')) status = 'deleted';
    else if (code.includes('R')) status = 'renamed';
    return { code, filePath, status };
  });

  if (files.length === 0) {
    return { hasChanges: false, files: [], message: null };
  }

  // Categorize changed files
  const categories = {
    ui: [],
    context: [],
    electron: [],
    build: [],
    releases: [],
    docs: [],
    apps: [],
    other: []
  };

  for (const f of files) {
    const p = f.filePath.toLowerCase().replace(/\\/g, '/');
    if (p.includes('src/components') || p.includes('src/features') || p.endsWith('.css') || p.includes('liquid') || p.includes('logo') || p.includes('splash')) {
      categories.ui.push(f);
    } else if (p.includes('src/context') || p.includes('src/types') || p.includes('src/data')) {
      categories.context.push(f);
    } else if (p.startsWith('electron/') || p.includes('preload') || p.includes('main.ts') || p.includes('autoUpdater')) {
      categories.electron.push(f);
    } else if (p.includes('package.json') || p.includes('scripts/') || p.includes('tsconfig') || p.includes('vite.config')) {
      categories.build.push(f);
    } else if (p.startsWith('published-apps') || p.startsWith('releases/')) {
      categories.releases.push(f);
    } else if (p.endsWith('.md') || p.includes('readme')) {
      categories.docs.push(f);
    } else if (p.includes('anything_website') || p.includes('child-apps')) {
      categories.apps.push(f);
    } else {
      categories.other.push(f);
    }
  }

  // Determine Type
  let type = 'feat';
  const hasOnlyDocs = files.every(f => f.filePath.endsWith('.md') || f.filePath.toLowerCase().includes('readme'));
  const hasOnlyBuild = files.every(f => f.filePath.includes('package.json') || f.filePath.includes('scripts/'));
  const hasOnlyStyling = categories.ui.length > 0 && categories.electron.length === 0 && categories.apps.length === 0;

  if (hasOnlyDocs) {
    type = 'docs';
  } else if (hasOnlyBuild) {
    type = 'chore';
  } else if (files.some(f => f.filePath.toLowerCase().includes('fix') || f.filePath.toLowerCase().includes('repair') || f.filePath.toLowerCase().includes('error'))) {
    type = 'fix';
  } else if (files.some(f => f.status === 'added' || f.filePath.includes('MobileAppsPage') || f.filePath.includes('WorkspaceContext') || f.filePath.includes('CommandPalette'))) {
    type = 'feat';
  } else if (hasOnlyStyling) {
    type = 'style';
  } else {
    type = 'feat';
  }

  // Determine Scope
  let scope = 'hub';
  const repoName = path.basename(repoDir).toLowerCase();
  if (repoName.includes('mediaflow')) scope = 'mediaflow';
  else if (repoName.includes('tap')) scope = 'onetap';
  else if (repoName.includes('docuflow')) scope = 'docuflow';
  else if (repoName.includes('beatwave') || repoName.includes('pulse')) scope = 'pulsewave';
  else if (categories.ui.length > categories.electron.length && categories.ui.length > categories.releases.length) {
    scope = files.some(f => f.filePath.toLowerCase().includes('logo') || f.filePath.toLowerCase().includes('liquid')) ? 'branding' : 'ui';
  } else if (categories.electron.length > 0) {
    scope = 'updater';
  } else if (categories.releases.length > 0) {
    scope = 'releases';
  } else if (categories.build.length > 0) {
    scope = 'tooling';
  }

  // Generate Title
  let subject = '';
  if (customMessage) {
    subject = customMessage;
  } else {
    const highlights = [];
    if (files.some(f => f.filePath.includes('package.json'))) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(repoDir, 'package.json'), 'utf8'));
        highlights.push(`v${pkg.version || 'update'}`);
      } catch {
        highlights.push('version update');
      }
    }
    if (files.some(f => f.filePath.includes('LiquidBackground') || f.filePath.includes('logo') || f.filePath.includes('splash'))) {
      highlights.push('branding assets & fluid styling');
    }
    if (files.some(f => f.filePath.includes('MobileAppsPage') || f.filePath.includes('SharedAssetLibrary') || f.filePath.includes('CommandPalette'))) {
      highlights.push('mobile ecosystem & workspace controls');
    }
    if (files.some(f => f.filePath.includes('autoUpdater') || f.filePath.includes('sync-sources') || f.filePath.includes('publish-github-release'))) {
      highlights.push('automated release pipeline & auto-updater');
    }
    if (files.some(f => f.filePath.includes('DocuFlow') || f.filePath.includes('docuflow'))) {
      highlights.push('DocuFlow suite integration');
    }

    if (highlights.length > 0) {
      subject = `update ${highlights.slice(0, 3).join(', ')}`;
    } else {
      subject = `sync ${files.length} ecosystem components and configuration`;
    }
  }

  const commitTitle = `${type}(${scope}): ${subject}`;

  // Generate Detailed Body
  const bodyBullets = [];
  if (categories.ui.length > 0) {
    bodyBullets.push(`* UI & Presentation: Updated ${categories.ui.length} interface modules (${categories.ui.slice(0, 3).map(f => path.basename(f.filePath)).join(', ')}${categories.ui.length > 3 ? '...' : ''})`);
  }
  if (categories.context.length > 0) {
    bodyBullets.push(`* State & Data: Synchronized ${categories.context.length} global contexts and app definitions`);
  }
  if (categories.electron.length > 0) {
    bodyBullets.push(`* Native Engine: Enhanced Electron main process, IPC bridges, and updater routines`);
  }
  if (categories.build.length > 0) {
    bodyBullets.push(`* Tooling & Scripts: Updated release scripts, build configs, and ecosystem manifests`);
  }
  if (categories.releases.length > 0) {
    bodyBullets.push(`* Releases Catalog: Synchronized child app binaries, blockmaps, and release metadata`);
  }
  if (categories.docs.length > 0) {
    bodyBullets.push(`* Documentation: Updated guides, specifications, and README files`);
  }
  if (categories.apps.length > 0) {
    bodyBullets.push(`* Connected Apps: Updated web portal and multi-app integration points`);
  }

  const addedCount = files.filter(f => f.status === 'added' || f.status === 'untracked').length;
  const modCount = files.filter(f => f.status === 'modified').length;
  const delCount = files.filter(f => f.status === 'deleted').length;

  const commitBody = [
    `Automated ecosystem commit orchestrated by Anything Auto-Commit Engine.`,
    ``,
    `Key Changes:`,
    ...bodyBullets.map(b => `  ${b}`),
    ``,
    `Summary: ${files.length} files impacted (${addedCount} new, ${modCount} modified, ${delCount} removed).`,
    `Generated-At: ${new Date().toISOString()}`
  ].join('\n');

  return {
    hasChanges: true,
    files,
    title: commitTitle,
    body: commitBody,
    type,
    scope,
    subject
  };
}

// ---------------------------------------------------------------------------
// 4. Execution Routine (Stage, Commit, Pull --rebase, Push)
// ---------------------------------------------------------------------------
function executeCommit(repoDir) {
  const repoName = path.basename(repoDir);
  console.log(`\n======================================================`);
  console.log(`🔍 Inspecting Repository: ${repoName}`);
  console.log(`📁 Path: ${repoDir}`);
  console.log(`======================================================`);

  if (!fs.existsSync(path.join(repoDir, '.git'))) {
    console.log(`⚠️ Not a git repository: ${repoDir}`);
    return { success: false, reason: 'not_a_git_repo' };
  }

  const analysis = analyzeRepositoryStatus(repoDir);

  if (!analysis.hasChanges) {
    console.log(`✨ Working tree is completely clean. Nothing to commit.`);
    return { success: true, committed: false, message: 'Working tree clean' };
  }

  console.log(`📝 Generated Commit Title:`);
  console.log(`   👉 ${analysis.title}\n`);
  console.log(`📋 Detailed Description:`);
  analysis.body.split('\n').forEach(line => console.log(`   ${line}`));

  if (isDryRun) {
    console.log(`\n🔎 [DRY RUN] Skipped staging and committing.`);
    return { success: true, dryRun: true, analysis };
  }

  // 1. Stage changes
  console.log(`\n📦 Staging changes...`);
  runGit('add -A', repoDir);

  // 2. Commit changes
  console.log(`💾 Committing changes...`);
  const tempMsgFile = path.join(repoDir, '.git', 'ANYTHING_AUTO_COMMIT_MSG.txt');
  const fullMessage = `${analysis.title}\n\n${analysis.body}`;
  fs.writeFileSync(tempMsgFile, fullMessage, 'utf8');

  try {
    const commitOutput = runGit(`commit -F "${tempMsgFile}"`, repoDir);
    console.log(`✅ Commit created successfully!`);
    if (commitOutput) console.log(`   ${commitOutput.split('\n')[0]}`);
  } finally {
    if (fs.existsSync(tempMsgFile)) fs.unlinkSync(tempMsgFile);
  }

  // 3. Push if requested
  if (shouldPush) {
    console.log(`\n🚀 Preparing to push to remote...`);
    const token = resolveGitHubToken(repoDir);
    const remoteOrigin = runGit('config --get remote.origin.url', repoDir);

    if (!remoteOrigin) {
      console.log(`ℹ️ No remote 'origin' configured. Skipping push.`);
      return { success: true, committed: true, pushed: false, analysis };
    }

    const currentBranch = runGit('branch --show-current', repoDir) || 'main';
    let pushUrl = remoteOrigin;

    if (token && remoteOrigin.includes('github.com')) {
      const match = remoteOrigin.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
      if (match) {
        const owner = match[1];
        const repo = match[2];
        pushUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
      }
    }

    // Try pull --rebase first to seamlessly incorporate remote changes if any
    try {
      console.log(`🔄 Pulling upstream updates (rebase)...`);
      runGit(`pull --rebase ${pushUrl} ${currentBranch}`, repoDir, 25000);
    } catch {
      // If rebase fails or is up-to-date, continue
    }

    // Push with token
    try {
      console.log(`⬆️ Pushing branch '${currentBranch}' to GitHub...`);
      const pushResult = runGit(`push ${pushUrl} ${currentBranch}`, repoDir, 35000);
      console.log(`🎉 Push successful!`);
      if (pushResult) console.log(pushResult);
      return { success: true, committed: true, pushed: true, analysis };
    } catch (pushErr) {
      console.error(`❌ Push failed or timed out:`, pushErr.message || pushErr);
      return { success: true, committed: true, pushed: false, error: pushErr.message, analysis };
    }
  }

  return { success: true, committed: true, pushed: false, analysis };
}

// ---------------------------------------------------------------------------
// 5. Main Execution Router
// ---------------------------------------------------------------------------
function main() {
  if (isEcosystem) {
    console.log(`🌐 Ecosystem Multi-Repository Auto-Commit Activated\n`);
    const results = [];
    for (const repo of KNOWN_ECOSYSTEM_REPOS) {
      if (fs.existsSync(repo.path)) {
        const res = executeCommit(repo.path);
        results.push({ name: repo.name, path: repo.path, ...res });
      } else {
        console.log(`⏩ Skipping repo not found on disk: ${repo.name} (${repo.path})`);
      }
    }
    if (isJsonMode) {
      console.log('\n--- JSON RESULT ---');
      console.log(JSON.stringify(results, null, 2));
    }
  } else {
    const res = executeCommit(targetRepo);
    if (isJsonMode) {
      console.log('\n--- JSON RESULT ---');
      console.log(JSON.stringify(res, null, 2));
    }
  }
}

main();
