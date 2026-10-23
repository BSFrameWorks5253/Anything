    $WshShell = New-Object -ComObject WScript.Shell
    $shortcutPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Anything.lnk"
    $projectRoot = Split-Path -Parent $PSScriptRoot
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "$env:LOCALAPPDATA\Programs\Anything\Anything.exe"
    if (-not (Test-Path $Shortcut.TargetPath)) {
        $electronProc = Get-Process -Name electron -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path
        if ($electronProc) {
            $Shortcut.TargetPath = $electronProc
            $Shortcut.Arguments = "."
        } else {
            $Shortcut.TargetPath = "powershell.exe"
        }
    }
    $Shortcut.WorkingDirectory = $projectRoot
    $icoPath = Join-Path $projectRoot "public\icon.ico"
    $logoPath = Join-Path $projectRoot "public\app-logo.png"
    if (Test-Path $icoPath) {
        $Shortcut.IconLocation = "$icoPath,0"
    } elseif (Test-Path $logoPath) {
        $Shortcut.IconLocation = "$logoPath,0"
    }
    $Shortcut.Description = "Anything Desktop Ecosystem"
    $Shortcut.Save()
    Write-Output "Shortcut created successfully at $shortcutPath with icon $icoPath"
