$f = "c:\Users\Nandeesh B\Documents\smart-supply-chain-main\client\src\index.css"
$lines = Get-Content $f
$kept = $lines[0..2033]
$kept | Set-Content $f -Encoding UTF8
Write-Host "Trimmed to $($kept.Count) lines"
