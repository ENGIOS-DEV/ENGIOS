$ErrorActionPreference = 'Stop'
$workspace = $PSScriptRoot
$project = Join-Path $workspace 'aida'
$runtime = Join-Path $workspace '.local\ollama\ollama.exe'
$logs = Join-Path $workspace '.local\logs'
New-Item -ItemType Directory -Path $logs -Force | Out-Null
$env:OLLAMA_MODELS = Join-Path $workspace '.local\ollama-models'
$env:OLLAMA_HOST = '127.0.0.1:11434'
$env:OLLAMA_NO_CLOUD = '1'
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

function Wait-LocalService($url, $label, $serviceProcess = $null) {
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        if ($serviceProcess -and $serviceProcess.HasExited) {
            throw "$label exited before becoming ready. See logs in $logs"
        }
        try {
            $request = [System.Net.HttpWebRequest]::Create($url)
            $request.Proxy = $null
            $request.Timeout = 2000
            $response = $request.GetResponse()
            $response.Close()
            return
        } catch { Start-Sleep -Seconds 1 }
    }
    throw "$label did not start. See logs in $logs"
}

try {
    Write-Host 'Starting local AIDA development environment...'
    try { $null = Invoke-RestMethod 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2 }
    catch {
        Start-Process -FilePath $runtime -ArgumentList 'serve' -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'ollama.out.log') -RedirectStandardError (Join-Path $logs 'ollama.err.log') | Out-Null
        $null = Wait-LocalService 'http://127.0.0.1:11434/api/tags' 'Ollama'
    }
    $models = (Invoke-RestMethod 'http://127.0.0.1:11434/api/tags').models.name
    if ($models -notcontains 'phi3mini:latest') {
        Write-Host 'Preparing Phi-3 Mini. First run downloads approximately 2.2 GB.'
        if ($models -notcontains 'phi3:mini') {
            & $runtime pull phi3:mini
            if ($LASTEXITCODE -ne 0) { throw 'Phi-3 Mini download failed.' }
        }
        & $runtime cp phi3:mini phi3mini:latest
        if ($LASTEXITCODE -ne 0) { throw 'Could not create the model alias expected by AIDA.' }
    }
    $portProbe = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 0)
    $portProbe.Start()
    $devPort = $portProbe.LocalEndpoint.Port
    $portProbe.Stop()
    $env:AIDA_DEV_PORT = [string]$devPort
    $node = (Get-Command node.exe).Source
    $vite = Join-Path $project 'node_modules\vite\bin\vite.js'
    Write-Host "Starting AIDA development server on port $devPort..."
    $viteProcess = Start-Process -FilePath $node -ArgumentList ('"' + $vite + '" --host 127.0.0.1 --port ' + $devPort + ' --strictPort') -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'vite.out.log') -RedirectStandardError (Join-Path $logs 'vite.err.log') -PassThru
    $null = Wait-LocalService "http://127.0.0.1:$devPort/src/components/menubar/handle.html" 'AIDA development server' $viteProcess
    $electron = Join-Path $project 'node_modules\electron\dist\electron.exe'
    $profile = Join-Path $workspace '.local\aida-profile'
    $appProcess = Start-Process -FilePath $electron -ArgumentList ('"' + $project + '" "--user-data-dir=' + $profile + '"') -WorkingDirectory $project -PassThru -RedirectStandardOutput (Join-Path $logs 'aida.out.log') -RedirectStandardError (Join-Path $logs 'aida.err.log')
    Start-Sleep -Seconds 4
    if ($appProcess.HasExited) { throw "AIDA exited with code $($appProcess.ExitCode). See $logs\aida.err.log" }
    Write-Host 'AIDA started. Look for the handle at the top of your screen.'
    Write-Host "Logs: $logs"
    Write-Host 'Ollama and the development server remain running after this launcher closes.'
} catch {
    Write-Host $_ -ForegroundColor Red
    exit 1
}

