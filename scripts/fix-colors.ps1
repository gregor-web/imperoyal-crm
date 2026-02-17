$base = "c:\Users\Chef\imperoyal-crm"
$files = @(
  "$base\app\(dashboard)\mandanten\[id]\page.tsx",
  "$base\app\(dashboard)\mandanten\[id]\edit\page.tsx",
  "$base\app\(dashboard)\mandanten\neu\page.tsx",
  "$base\app\(dashboard)\objekte\[id]\page.tsx",
  "$base\app\(dashboard)\objekte\[id]\edit\page.tsx",
  "$base\app\(dashboard)\objekte\neu\page.tsx",
  "$base\app\(dashboard)\auswertungen\[id]\page.tsx",
  "$base\app\(dashboard)\ankaufsprofile\[id]\edit\page.tsx",
  "$base\app\(dashboard)\anfragen\page.tsx",
  "$base\app\(dashboard)\objekte\page.tsx",
  "$base\app\(dashboard)\mandanten\page.tsx",
  "$base\app\(dashboard)\auswertungen\page.tsx",
  "$base\app\(dashboard)\ankaufsprofile\page.tsx",
  "$base\app\(dashboard)\meine-anfragen\page.tsx",
  "$base\app\(dashboard)\layout.tsx"
)
foreach ($f in $files) {
  if ([System.IO.File]::Exists($f)) {
    $c = [System.IO.File]::ReadAllText($f)
    $orig = $c
    $c = $c.Replace('text-slate-800','text-[#1E2A3A]')
    $c = $c.Replace('text-slate-700','text-[#1E2A3A]')
    $c = $c.Replace('text-slate-600','text-[#4A6A8D]')
    $c = $c.Replace('text-slate-500','text-[#5B7A9D]')
    $c = $c.Replace('text-slate-400','text-[#9EAFC0]')
    $c = $c.Replace('text-slate-300','text-[#B8C5D1]')
    $c = $c.Replace('text-blue-600','text-[#5B7A9D]')
    $c = $c.Replace('text-blue-700','text-[#4A6A8D]')
    $c = $c.Replace('text-blue-500','text-[#5B7A9D]')
    $c = $c.Replace('border-slate-100','border-[#D5DEE6]')
    $c = $c.Replace('border-slate-200','border-[#D5DEE6]')
    $c = $c.Replace('border-blue-200','border-[#D5DEE6]')
    $c = $c.Replace('bg-slate-100','bg-[#EDF1F5]')
    $c = $c.Replace('bg-slate-50','bg-[#EDF1F5]')
    if ($c -ne $orig) {
      [System.IO.File]::WriteAllText($f, $c)
      Write-Host "Updated: $($f.Split('\')[-3..-1] -join '\')"
    } else {
      Write-Host "No changes: $($f.Split('\')[-1])"
    }
  } else {
    Write-Host "Missing: $f"
  }
}
Write-Host "Done!"
