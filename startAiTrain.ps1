$NbProcess = @(docker compose ps --quiet).Count
if ($NbProcess -ne 3) {
    Write-Host "App not launched"
    docker compose up -d
    Write-Host "App launched!"
}
[double] $CPUPerc = try {(docker stats ig3-projet-ia-web-1 --no-stream --format "{{.CPUPerc}}").Replace("%", "")} catch { -1 }

if ($CPUPerc -eq -1) {
    Write-Error "Process ig3-projet-ia-web-1 not found..."
} elseif ($CPUPerc -lt 100) {
    Write-Host "Launch 6 times 100 000 games"

    for ($i = 0; $i -lt 6; $i++) {
        docker compose exec -d web flask train_ai 100000
    }
    Write-Host "Train started!"
} else {
    Write-Host "A training session seems already launched..."
}
