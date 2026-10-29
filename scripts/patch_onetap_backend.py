import os

main_path = os.path.join(os.path.dirname(__file__), 'electron', 'main.ts')
with open(main_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update allowedRoots in isSafeExecutablePath to include Anything Apps
old_roots = """  // Check allowed parent roots
  const allowedRoots = [
    process.env.LOCALAPPDATA,
    process.env.APPDATA,
    process.env['ProgramFiles'],
    process.env['ProgramFiles(x86)'],
    getProjectRoot(),
    app.getPath('userData'),
    getInstalledAppsDir(),
    getPublishedDir(),
    getInboxDir(),
  ].filter(Boolean).map((r) => path.normalize(path.resolve(r!)).toLowerCase());"""

new_roots = """  // Check allowed parent roots
  const allowedRoots = [
    process.env.LOCALAPPDATA,
    process.env.APPDATA,
    process.env['ProgramFiles'],
    process.env['ProgramFiles(x86)'],
    getProjectRoot(),
    app.getPath('userData'),
    getInstalledAppsDir(),
    getPublishedDir(),
    getInboxDir(),
    'C:\\\\Users\\\\Burhanuddin\\\\OneDrive\\\\Desktop\\\\Anything Apps',
    path.resolve(getProjectRoot(), '..'),
  ].filter(Boolean).map((r) => path.normalize(path.resolve(r!)).toLowerCase());"""

assert old_roots in content, "old_roots not found"
content = content.replace(old_roots, new_roots, 1)

# 2. Update resolveOneTapSettingsWatchDir
old_resolve_dir = """function resolveOneTapSettingsWatchDir(): { watchDir: string; outDir: string } {
  let watchDir = '';
  let outDir = '';

  // 1. Try reading from One Tap settings locator (%APPDATA%\\One Tap\\settings_location.ini)
  try {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    const locatorFile = path.join(appData, 'One Tap', 'settings_location.ini');
    if (fs.existsSync(locatorFile)) {
      const targetDir = fs.readFileSync(locatorFile, 'utf-8').trim();
      const settingsJsonPath = path.join(targetDir, 'settings.json');
      if (fs.existsSync(settingsJsonPath)) {
        const parsed = JSON.parse(fs.readFileSync(settingsJsonPath, 'utf-8'));
        const watcherInput = (parsed.watcher_input_folder || parsed.converter_input || parsed.screenshot_folder || '')?.trim();
        if (watcherInput && fs.existsSync(watcherInput)) {
          watchDir = watcherInput;
        }
        const customJpeg = (parsed.converter_jpeg || '')?.trim();
        if (customJpeg) {
          outDir = customJpeg;
        }
      }
    }
  } catch (err) {
    console.warn('[Anything Daemon] Could not read One Tap settings:', err);
  }

  // 2. Fallbacks: Standard Windows Screenshots folders
  if (!watchDir) {
    const home = os.homedir();
    const oneDriveScreenshots = path.join(home, 'OneDrive', 'Pictures', 'Screenshots');
    const localScreenshots = path.join(home, 'Pictures', 'Screenshots');

    if (fs.existsSync(oneDriveScreenshots)) {
      watchDir = oneDriveScreenshots;
    } else if (fs.existsSync(localScreenshots)) {
      watchDir = localScreenshots;
    }
  }

  if (watchDir && !outDir) {
    outDir = path.join(watchDir, 'Converted_JPEGs');
  }

  return { watchDir, outDir };
}"""

new_resolve_dir = """function resolveOneTapSettingsWatchDir(): { watchDir: string; outDir: string } {
  let watchDir = '';
  let outDir = '';

  // 0. Check custom user override in Anything appData (userData/onetap_watcher_settings.json)
  try {
    const userCfg = path.join(app.getPath('userData'), 'onetap_watcher_settings.json');
    if (fs.existsSync(userCfg)) {
      const parsed = JSON.parse(fs.readFileSync(userCfg, 'utf-8'));
      if (parsed.watchDir && fs.existsSync(parsed.watchDir)) {
        watchDir = parsed.watchDir;
      }
      if (parsed.outDir) {
        outDir = parsed.outDir;
      }
    }
  } catch (err) {}

  // 1. Try reading from One Tap settings locator (%APPDATA%\\One Tap\\settings_location.ini)
  if (!watchDir) {
    try {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      const locatorFile = path.join(appData, 'One Tap', 'settings_location.ini');
      if (fs.existsSync(locatorFile)) {
        const targetDir = fs.readFileSync(locatorFile, 'utf-8').trim();
        const settingsJsonPath = path.join(targetDir, 'settings.json');
        if (fs.existsSync(settingsJsonPath)) {
          const parsed = JSON.parse(fs.readFileSync(settingsJsonPath, 'utf-8'));
          const watcherInput = (parsed.watcher_input_folder || parsed.converter_input || parsed.screenshot_folder || '')?.trim();
          if (watcherInput && fs.existsSync(watcherInput)) {
            watchDir = watcherInput;
          }
          const customJpeg = (parsed.converter_jpeg || '')?.trim();
          if (customJpeg) {
            outDir = customJpeg;
          }
        }
      }
    } catch (err) {
      console.warn('[Anything Daemon] Could not read One Tap settings:', err);
    }
  }

  // 2. Direct %APPDATA%\\One Tap\\settings.json fallback
  if (!watchDir) {
    try {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      const directSettings = path.join(appData, 'One Tap', 'settings.json');
      if (fs.existsSync(directSettings)) {
        const parsed = JSON.parse(fs.readFileSync(directSettings, 'utf-8'));
        const watcherInput = (parsed.watcher_input_folder || parsed.converter_input || parsed.screenshot_folder || '')?.trim();
        if (watcherInput && fs.existsSync(watcherInput)) {
          watchDir = watcherInput;
        }
        const customJpeg = (parsed.converter_jpeg || '')?.trim();
        if (customJpeg) {
          outDir = customJpeg;
        }
      }
    } catch (err) {}
  }

  // 3. Fallbacks: Standard Windows Screenshots folders
  if (!watchDir) {
    const home = os.homedir();
    const oneDriveScreenshots = path.join(home, 'OneDrive', 'Pictures', 'Screenshots');
    const localScreenshots = path.join(home, 'Pictures', 'Screenshots');

    if (fs.existsSync(oneDriveScreenshots)) {
      watchDir = oneDriveScreenshots;
    } else if (fs.existsSync(localScreenshots)) {
      watchDir = localScreenshots;
    }
  }

  if (watchDir && !outDir) {
    outDir = path.join(watchDir, 'Converted_JPEGs');
  }

  return { watchDir, outDir };
}"""

assert old_resolve_dir in content, "old_resolve_dir not found"
content = content.replace(old_resolve_dir, new_resolve_dir, 1)

# 3. Add onetap IPC handlers
old_handlers = """  // One Tap PNG to JPG IPC Handlers

  ipcMain.handle('onetap:convert-files', async (_e, files?: string[]) => {

    return handleOneTapConvertFiles(win, files);

  });

  ipcMain.handle('onetap:convert-folder', async (_e, folder?: string) => {

    return handleOneTapConvertFolder(win, folder);

  });

  ipcMain.handle('onetap:launch', async () => {

    launchOneTapApp(win);

    return { success: true };

  });"""

new_handlers = """  // One Tap PNG to JPG IPC Handlers

  ipcMain.handle('onetap:convert-files', async (_e, files?: string[]) => {
    return handleOneTapConvertFiles(win, files);
  });

  ipcMain.handle('onetap:convert-folder', async (_e, folder?: string) => {
    return handleOneTapConvertFolder(win, folder);
  });

  ipcMain.handle('onetap:launch', async () => {
    launchOneTapApp(win);
    return { success: true };
  });

  ipcMain.handle('onetap:get-watcher-status', async () => {
    const { watchDir, outDir } = resolveOneTapSettingsWatchDir();
    return {
      enabled: isOneTapAutoConvertEnabled,
      active: Boolean(oneTapWatcherInstance),
      watchDir: oneTapCurrentWatchDir || watchDir || null,
      outDir: oneTapCurrentOutDir || outDir || null,
      lastConvertedDir: lastOneTapConvertedDir || null,
    };
  });

  ipcMain.handle('onetap:toggle-watcher', async (_, targetState?: boolean) => {
    if (typeof targetState === 'boolean') {
      isOneTapAutoConvertEnabled = targetState;
    } else {
      isOneTapAutoConvertEnabled = !isOneTapAutoConvertEnabled;
    }

    if (isOneTapAutoConvertEnabled) {
      startOneTapBackgroundWatcher(win);
      sendWindowsNotification('One Tap Auto-Converter', 'Auto-conversion of screenshots is now ACTIVE.');
    } else {
      stopOneTapBackgroundWatcher();
      sendWindowsNotification('One Tap Auto-Converter', 'Auto-conversion paused.');
    }

    if (tray && win && !win.isDestroyed()) {
      tray.setContextMenu(buildTrayMenu(win));
    }

    const statusPayload = {
      enabled: isOneTapAutoConvertEnabled,
      active: Boolean(oneTapWatcherInstance),
      watchDir: oneTapCurrentWatchDir,
      outDir: oneTapCurrentOutDir,
      lastConvertedDir: lastOneTapConvertedDir || null,
    };

    const allWindows = BrowserWindow.getAllWindows();
    for (const w of allWindows) {
      if (!w.isDestroyed()) {
        w.webContents.send('onetap:status', statusPayload);
      }
    }

    return statusPayload;
  });

  ipcMain.handle('onetap:open-watch-folder', async () => {
    const { watchDir } = resolveOneTapSettingsWatchDir();
    const target = oneTapCurrentWatchDir || watchDir;
    if (target && fs.existsSync(target)) {
      await shell.openPath(target);
      return { success: true, path: target };
    }
    return { success: false, error: 'Watch folder does not exist or is not configured.' };
  });

  ipcMain.handle('onetap:open-output-folder', async () => {
    const { outDir } = resolveOneTapSettingsWatchDir();
    const target = oneTapCurrentOutDir || outDir || lastOneTapConvertedDir;
    if (target && fs.existsSync(target)) {
      await shell.openPath(target);
      return { success: true, path: target };
    }
    return { success: false, error: 'Output folder does not exist yet.' };
  });

  ipcMain.handle('onetap:set-watch-folder', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Select Folder for One Tap to Watch & Auto-Convert PNGs',
      properties: ['openDirectory'],
      buttonLabel: 'Select Watch Folder',
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const selectedDir = result.filePaths[0];
    const outDir = path.join(selectedDir, 'Converted_JPEGs');

    try {
      const settingsFile = path.join(app.getPath('userData'), 'onetap_watcher_settings.json');
      fs.writeFileSync(settingsFile, JSON.stringify({ watchDir: selectedDir, outDir }, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to persist custom watch folder:', e);
    }

    if (isOneTapAutoConvertEnabled) {
      startOneTapBackgroundWatcher(win);
    } else {
      oneTapCurrentWatchDir = selectedDir;
      oneTapCurrentOutDir = outDir;
    }

    if (tray && win && !win.isDestroyed()) {
      tray.setContextMenu(buildTrayMenu(win));
    }

    const statusPayload = {
      enabled: isOneTapAutoConvertEnabled,
      active: Boolean(oneTapWatcherInstance),
      watchDir: selectedDir,
      outDir,
      lastConvertedDir: lastOneTapConvertedDir || null,
    };

    const allWindows = BrowserWindow.getAllWindows();
    for (const w of allWindows) {
      if (!w.isDestroyed()) {
        w.webContents.send('onetap:status', statusPayload);
      }
    }

    return { success: true, ...statusPayload };
  });"""

assert old_handlers in content, "old_handlers not found"
content = content.replace(old_handlers, new_handlers, 1)

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully patched electron/main.ts with One Tap daemon handlers!')

