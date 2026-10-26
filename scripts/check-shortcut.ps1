$w = New-Object -ComObject WScript.Shell
$p = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Anything.lnk"
if (Test-Path $p) {
    $s = $w.CreateShortcut($p)
    Write-Host "Target: $($s.TargetPath)"
    Write-Host "Icon: $($s.IconLocation)"
} else {
    Write-Host "No shortcut"
}
