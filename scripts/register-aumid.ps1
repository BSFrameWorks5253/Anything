# Registers Anything for native Windows 10/11 Toast Notifications and sets AppUserModelID

$appId = "com.burhanuddin.anything"
$appName = "Anything"
$shortcutPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Anything.lnk"
$installedExe = "$env:LOCALAPPDATA\Programs\Anything\Anything.exe"

# 1. Determine Target Executable and Working Directory
$targetExe = if (Test-Path $installedExe) { $installedExe } else {
    $e = (Get-Process -Name electron -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)
    if ($e) { $e } else { $installedExe }
}

# 2. Extract or locate a PHYSICAL icon path on disk
$userDataDir = "$env:APPDATA\Anything"
if (-not (Test-Path $userDataDir)) {
    New-Item -ItemType Directory -Path $userDataDir -Force | Out-Null
}
$physicalIconPath = Join-Path $userDataDir "app-logo.png"

# Find source icon to copy if not already cached
$sourceIcon = "$PSScriptRoot\..\dist\app-logo.png"
if (-not (Test-Path $sourceIcon)) { $sourceIcon = "$PSScriptRoot\..\public\app-logo.png" }
if (Test-Path $sourceIcon) {
    Copy-Item -Path $sourceIcon -Destination $physicalIconPath -Force -ErrorAction SilentlyContinue
}

# If still not found, fallback to installed exe icon
if (-not (Test-Path $physicalIconPath) -and (Test-Path $installedExe)) {
    $physicalIconPath = "$installedExe,0"
}

# 3. Create or Update Shortcut using WScript.Shell
$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut($shortcutPath)
$sc.TargetPath = $targetExe
if ($targetExe -like "*electron.exe*") {
    $sc.Arguments = "."
    $sc.WorkingDirectory = (Split-Path -Parent $PSScriptRoot)
} else {
    $sc.WorkingDirectory = Split-Path -Parent $targetExe
}
if (Test-Path $physicalIconPath) {
    $sc.IconLocation = "$physicalIconPath,0"
} elseif (Test-Path $installedExe) {
    $sc.IconLocation = "$installedExe,0"
}
$sc.Description = "Anything - Creative & Productivity Master Hub"
$sc.Save()

# 4. Attach System.AppUserModel.ID to the shortcut via COM IPropertyStore
$cSharpCode = @"
using System;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;

[ComImport, Guid("00021401-0000-0000-C000-000000000046")]
public class ShellLink {}

[ComImport, InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99")]
public interface IPropertyStore {
    uint GetCount([Out] out uint cProps);
    void GetAt([In] uint iProp, out PropertyKey pkey);
    void GetValue([In] ref PropertyKey key, [Out] PropVariant pv);
    void SetValue([In] ref PropertyKey key, [In] PropVariant pv);
    void Commit();
}

[StructLayout(LayoutKind.Sequential, Pack = 4)]
public struct PropertyKey {
    public Guid fmtid;
    public uint pid;
    public PropertyKey(Guid guid, uint id) {
        fmtid = guid;
        pid = id;
    }
}

[StructLayout(LayoutKind.Explicit)]
public class PropVariant : IDisposable {
    [FieldOffset(0)] public ushort vt;
    [FieldOffset(8)] public IntPtr pwszVal;

    public static PropVariant FromString(string val) {
        var pv = new PropVariant();
        pv.vt = 31; // VT_LPWSTR
        pv.pwszVal = Marshal.StringToCoTaskMemUni(val);
        return pv;
    }

    public void Dispose() {
        if (pwszVal != IntPtr.Zero) {
            Marshal.FreeCoTaskMem(pwszVal);
            pwszVal = IntPtr.Zero;
        }
    }
}

public static class ShortcutPKeyHelper {
    public static readonly PropertyKey AppUserModelIdKey = new PropertyKey(new Guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3"), 5);

    public static bool ApplyAumid(string path, string aumid) {
        try {
            ShellLink link = new ShellLink();
            IPersistFile file = (IPersistFile)link;
            file.Load(path, 0); // STGM_READ

            IPropertyStore store = (IPropertyStore)link;
            PropertyKey key = AppUserModelIdKey;
            using (var pv = PropVariant.FromString(aumid)) {
                store.SetValue(ref key, pv);
            }
            store.Commit();
            file.Save(path, true);
            return true;
        } catch {
            return false;
        }
    }
}
"@

try {
    Add-Type -TypeDefinition $cSharpCode -ErrorAction SilentlyContinue
    [ShortcutPKeyHelper]::ApplyAumid($shortcutPath, $appId) | Out-Null
    Write-Output "Applied AUMID to shortcut: $shortcutPath"
} catch {
    Write-Warning "Could not apply COM IPropertyStore to shortcut: $_"
}

# 5. Register in Windows Registry
try {
    $regPath = "HKCU:\Software\Classes\AppUserModelId\$appId"
    if (-not (Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "DisplayName" -Value $appName -Force
    Set-ItemProperty -Path $regPath -Name "IconUri" -Value $physicalIconPath -Force
    Set-ItemProperty -Path $regPath -Name "IconBackgroundColor" -Value "FF030712" -Force
    Set-ItemProperty -Path $regPath -Name "ShowInSettings" -Value 1 -Type DWord -Force

    # Also register electron.exe and Anything.exe FriendlyAppName
    $electronReg = "HKCU:\Software\Classes\Applications\electron.exe"
    if (-not (Test-Path $electronReg)) { New-Item -Path $electronReg -Force | Out-Null }
    Set-ItemProperty -Path $electronReg -Name "FriendlyAppName" -Value "Anything" -Force
    Set-ItemProperty -Path $electronReg -Name "ApplicationName" -Value "Anything" -Force

    $anythingReg = "HKCU:\Software\Classes\Applications\Anything.exe"
    if (-not (Test-Path $anythingReg)) { New-Item -Path $anythingReg -Force | Out-Null }
    Set-ItemProperty -Path $anythingReg -Name "FriendlyAppName" -Value "Anything" -Force
    Set-ItemProperty -Path $anythingReg -Name "ApplicationName" -Value "Anything" -Force

    Write-Output "Windows Toast Registry configured successfully for $appId ($appName)"
} catch {
    Write-Warning "Registry configuration error: $_"
}
