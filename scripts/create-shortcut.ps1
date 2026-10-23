$WshShell = New-Object -ComObject WScript.Shell
$shortcutPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Anything.lnk"
$projectRoot = Split-Path -Parent $PSScriptRoot
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "$env:LOCALAPPDATA\Programs\Anything\Anything.exe"
if (-not (Test-Path $Shortcut.TargetPath)) {
    $electronProc = Get-Process -Name electron -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path
    if ($electronProc) {
        $Shortcut.TargetPath = $electronProc
    } else {
        $Shortcut.TargetPath = "powershell.exe"
    }
}
$Shortcut.WorkingDirectory = $projectRoot
$logoPath = Join-Path $projectRoot "public\app-logo.png"
if (Test-Path $logoPath) {
    $Shortcut.IconLocation = "$logoPath, 0"
}
$Shortcut.Description = "Anything Desktop Ecosystem"
$Shortcut.Save()
Write-Output "Shortcut created successfully at $shortcutPath"
