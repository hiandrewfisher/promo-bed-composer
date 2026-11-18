# Records Chrome renderer processes once a second to a CSV outside the browser,
# so the figures survive a tab crash and include native memory the page cannot see.
#   powershell -ExecutionPolicy Bypass -File monitor.ps1
param([int]$Seconds = 3600, [string]$Out = "")
if (-not $Out) { $Out = "chrome-monitor-$(Get-Date -Format yyyyMMdd-HHmmss).csv" }
"timestamp_iso,epoch_ms,pid,process,working_set_mb,private_mb,cpu_s,threads,handles" |
  Out-File -FilePath $Out -Encoding utf8
Write-Host "Recording to $Out — Ctrl+C to stop."
$end = (Get-Date).AddSeconds($Seconds)
while ((Get-Date) -lt $end) {
  $now = Get-Date
  $epoch = [int64](($now.ToUniversalTime() - [datetime]'1970-01-01').TotalMilliseconds)
  Get-Process chrome -ErrorAction SilentlyContinue | ForEach-Object {
    "{0},{1},{2},{3},{4:N1},{5:N1},{6:N1},{7},{8}" -f `
      $now.ToString("o"), $epoch, $_.Id, $_.ProcessName,
      ($_.WorkingSet64/1MB), ($_.PrivateMemorySize64/1MB),
      $_.TotalProcessorTime.TotalSeconds, $_.Threads.Count, $_.HandleCount |
      Out-File -FilePath $Out -Append -Encoding utf8
  }
  Start-Sleep -Seconds 1
}
