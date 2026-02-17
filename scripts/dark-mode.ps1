$base = "c:\Users\Chef\imperoyal-crm"

$dirs = @(
  "$base\app\(dashboard)",
  "$base\app\(auth)",
  "$base\components\dashboard",
  "$base\components\forms",
  "$base\components\ui",
  "$base\components\charts"
)

# Collect all TSX files
$files = foreach ($d in $dirs) {
  if (Test-Path $d) { Get-ChildItem -LiteralPath $d -Recurse -Filter "*.tsx" }
}

# Text color map: light → dark readable
$replacements = [ordered]@{
  # Primary text: darkest navy → near-white
  'text-[#1E2A3A]'         = 'text-[#EDF1F5]'
  'text-[#2A3F54]'         = 'text-[#D5DEE6]'
  'text-[#3D5167]'         = 'text-[#B8C5D1]'
  # Secondary text: mid-blue → light blue-bone
  'text-[#4A6A8D]'         = 'text-[#9EAFC0]'
  # Accent text: growth blue → brighter for dark
  'text-[#5B7A9D]'         = 'text-[#7A9BBD]'
  'text-[#6B8AAD]'         = 'text-[#9EAFC0]'
  # Muted text
  'text-[#9EAFC0]'         = 'text-[#6B8AAD]'
  'text-[#B8C5D1]'         = 'text-[#4A6A8D]'
  'text-[#D5DEE6]'         = 'text-[#3D5167]'
  # Legacy Apple text colors → brand dark
  'text-[#1D1D1F]'         = 'text-[#EDF1F5]'
  'text-[#6E6E73]'         = 'text-[#9EAFC0]'
  # Status colors: dark → bright
  'text-[#1A8A3A]'         = 'text-[#34C759]'
  'text-[#B36200]'         = 'text-[#FF9500]'
  'text-[#C0392B]'         = 'text-[#FF3B30]'
  # Hover text
  'hover:text-[#4A6A8D]'   = 'hover:text-[#7A9BBD]'
  'hover:text-[#1E2A3A]'   = 'hover:text-[#EDF1F5]'

  # Large backgrounds: light → dark
  'bg-[#EDF1F5]'           = 'bg-[#162636]'
  'bg-[#EDF1F5]/60'        = 'bg-[#253546]'
  'bg-[#D5DEE6]'           = 'bg-[#253546]'
  # White surfaces
  'bg-white '              = 'bg-[#1E2A3A] '
  "bg-white`""             = "bg-[#1E2A3A]`""
  "bg-white'"              = "bg-[#1E2A3A]'"

  # Icon tint backgrounds: increase opacity for dark bg
  'bg-[#5B7A9D]/12'        = 'bg-[#7A9BBD]/15'
  'bg-[#5B7A9D]/08'        = 'bg-[#7A9BBD]/10'
  'bg-[#5B7A9D]/10'        = 'bg-[#7A9BBD]/12'
  'bg-[#34C759]/10'        = 'bg-[#34C759]/15'
  'bg-[#FF9500]/10'        = 'bg-[#FF9500]/15'
  'bg-[#FF3B30]/10'        = 'bg-[#FF3B30]/15'
  'bg-[#1E2A3A]/10'        = 'bg-[#EDF1F5]/08'

  # Stat card bg (mandant actions etc)
  'bg-amber-50/50'         = 'bg-[#FF9500]/08'
  'bg-amber-100'           = 'bg-[#FF9500]/15'
  'bg-pink-50/50'          = 'bg-[#FF3B30]/08'
  'bg-pink-100'            = 'bg-[#FF3B30]/12'
  'bg-green-50'            = 'bg-[#34C759]/08'
  'bg-green-100'           = 'bg-[#34C759]/12'
  'bg-amber-50'            = 'bg-[#FF9500]/08'

  # Misc color text
  'text-green-400'         = 'text-[#34C759]'
  'text-amber-500'         = 'text-[#FF9500]'
  'text-green-600'         = 'text-[#34C759]'
  'text-green-700'         = 'text-[#34C759]'
  'text-pink-600'          = 'text-[#FF3B30]'
  'text-amber-600'         = 'text-[#FF9500]'

  # Border
  'border-[#D5DEE6]'       = 'border-white/[0.08]'
  'border-[#B8C5D1]'       = 'border-white/[0.12]'
  'border-[#9EAFC0]'       = 'border-white/[0.15]'
  'border-black/[0.06]'    = 'border-white/[0.07]'
  'divide-[#D5DEE6]'       = 'divide-white/[0.07]'
  'border-amber-100'       = 'border-[#FF9500]/20'
  'border-pink-100'        = 'border-[#FF3B30]/20'
  'border-[#D5DEE6]/60'    = 'border-white/[0.06]'

  # Hover backgrounds
  'hover:bg-[#EDF1F5]'     = 'hover:bg-[#253546]'
  'hover:bg-[#D5DEE6]'     = 'hover:bg-[#2A3F54]'
  'hover:bg-[#2A3F54]'     = 'hover:bg-[#3D5167]'

  # Specific focus ring
  'focus:ring-[#5B7A9D]'   = 'focus:ring-[#7A9BBD]'
}

$totalUpdated = 0

foreach ($file in $files) {
  $c = [System.IO.File]::ReadAllText($file.FullName)
  $orig = $c
  foreach ($kv in $replacements.GetEnumerator()) {
    $c = $c.Replace($kv.Key, $kv.Value)
  }
  if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($file.FullName, $c)
    Write-Host "Updated: $($file.FullName.Replace($base, ''))"
    $totalUpdated++
  }
}
Write-Host "`nTotal files updated: $totalUpdated"
