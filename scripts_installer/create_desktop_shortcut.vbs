Set oWS = WScript.CreateObject("WScript.Shell")
sDesktop = oWS.SpecialFolders("Desktop")
sLinkFile = sDesktop & "\المتحف المصري الكبير - GEM Construction Management.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
sCurrentDir = oWS.CurrentDirectory
oLink.TargetPath = sCurrentDir & "\تشغيل_برنامج_المتحف_المصري_الكبير.bat"
oLink.WorkingDirectory = sCurrentDir
oLink.Description = "نظام إدارة ملاحظات ومخططات المتحف المصري الكبير"
If CreateObject("Scripting.FileSystemObject").FileExists(sCurrentDir & "\dist\favicon.ico") Then
    oLink.IconLocation = sCurrentDir & "\dist\favicon.ico,0"
End If
oLink.WindowStyle = 1
oLink.Save
MsgBox "تم تثبيت واختصار البرنامج بنجاح على سطح المكتب بشعار المتحف المصري الكبير!" & vbCrLf & vbCrLf & "المسار: " & sLinkFile, 64, "المتحف المصري الكبير - تثبيت سطح المكتب"
