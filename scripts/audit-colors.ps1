$pattern = 'text-blue-[0-9]|bg-blue-[0-9](?!00/)|bg-slate-[0-9]|text-slate-[0-9]|border-blue-[0-9]|border-slate-[0-9]|hover:bg-slate-'
$files = Get-ChildItem -LiteralPath 'c:\Users\Chef\imperoyal-crm\app\(dashboard)' -Recurse -Filter '*.tsx'
foreach ($file in $files) {
  $matches = Select-String -LiteralPath $file.FullName -Pattern $pattern
  if ($matches) {
    Write-Host "=== $($file.Name) ($($file.DirectoryName.Split('\')[-1])) ==="
    foreach ($m in $matches) {
      Write-Host "  Line $($m.LineNumber): $($m.Line.Trim())"
    }
  }
}
Write-Host "Audit complete"
