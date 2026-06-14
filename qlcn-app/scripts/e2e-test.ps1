# scripts/e2e-test.ps1 - PowerShell E2E test (uses WebSession)
$ErrorActionPreference = "Continue"
$BASE = "http://localhost:8080"

function Test-Endpoint {
    param($web, $label, $method, $path, $body, $expectAuth)
    $headers = @{}
    $params = @{
        Uri = $BASE + $path
        Method = $method
        UseBasicParsing = $true
        WebSession = $web
        MaximumRedirection = 0
        Headers = $headers
    }
    if ($body) {
        $params['Body'] = $body
        $params['ContentType'] = "application/json"
    }
    try {
        if ($body) {
            $r = Invoke-WebRequest -Uri ($BASE + $path) -Method $method -UseBasicParsing -WebSession $web -MaximumRedirection 0 -ContentType "application/json" -Body $body
        } else {
            $r = Invoke-WebRequest -Uri ($BASE + $path) -Method $method -UseBasicParsing -WebSession $web -MaximumRedirection 0
        }
    } catch {
        $r = $_.Exception.Response
        if (-not $r) { $r = [PSCustomObject]@{ StatusCode = 0; Headers = @{}; Content = "" } }
    }
    if ($r -is [System.Net.HttpWebResponse]) {
        $status = [int]$r.StatusCode
    } elseif ($r.PSObject.Properties['StatusCode']) {
        $status = [int]$r.StatusCode
    } else {
        $status = 0
    }
    $note = ""
    $ok = $true
    if ($status -ge 500) { $note = "SERVER ERROR"; $ok = $false }
    elseif ($status -eq 307 -or $status -eq 302) { 
        $note = "redirect"
        if ($expectAuth -eq $true) { $ok = $false } 
    }
    elseif ($status -eq 401) { 
        $note = "401"
        if ($expectAuth -eq $true) { $ok = $false }
    }
    elseif ($status -eq 404) { $note = "404 NOT FOUND"; $ok = $false }
    elseif ($status -eq 200 -or $status -eq 201) {
        $j = $null
        $content = if ($r.Content) { $r.Content } else { "" }
        try { $j = $content | ConvertFrom-Json } catch {}
        if ($j -and $j.data) { $note = "$($j.data.Count) items" }
        elseif ($j -and $j.user) { $note = "user=$($j.user.username)/$($j.user.role)" }
        elseif ($j -and $j.success) { $note = "success" }
    }
    elseif ($status -eq 400) { $note = "400 bad request" }
    $icon = if ($ok) { "OK" } else { "FAIL" }
    $line = "  [{0}] {1} {2} -> {3}  {4}" -f $icon, $method, $path.PadRight(32), $status, $note
    Write-Host $line
    $script:results += [PSCustomObject]@{ Label=$label; Method=$method; Path=$path; Status=$status; Ok=$ok; Note=$note }
    return $r
}

function Login {
    param($web, $username, $password)
    $csrf = (Invoke-WebRequest -Uri "$BASE/api/auth/csrf" -UseBasicParsing -WebSession $web).Content | ConvertFrom-Json
    $body = "username=$username&password=$password&csrfToken=$($csrf.csrfToken)&callbackUrl=$BASE&json=true"
    try {
        Invoke-WebRequest -Uri "$BASE/api/auth/callback/credentials" -Method POST -UseBasicParsing -WebSession $web -ContentType "application/x-www-form-urlencoded" -Body $body -MaximumRedirection 0 | Out-Null
        return $true
    } catch {
        $resp = $_.Exception.Response
        if ($resp -and $resp.StatusCode.value__ -eq 302 -and ($resp.Headers.Location -notmatch "error")) { return $true }
        if ($resp -and $resp.StatusCode.value__ -eq 302) { return $false }
        return $false
    }
}

$script:results = @()

Write-Host "`n========== A. PUBLIC HEALTH =========="
$web = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Test-Endpoint $web "HEALTH" "GET" "/api/health" $null $false | Out-Null
Test-Endpoint $web "HEALTH" "GET" "/api/auth/csrf" $null $false | Out-Null
Test-Endpoint $web "HEALTH" "GET" "/api/auth/session" $null $false | Out-Null

Write-Host "`n========== B. UNAUTHENTICATED (expect 307) =========="
$web = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Test-Endpoint $web "UNAUTH" "GET" "/api/users" $null $false | Out-Null
Test-Endpoint $web "UNAUTH" "GET" "/api/products" $null $false | Out-Null
Test-Endpoint $web "UNAUTH" "GET" "/api/import-orders" $null $false | Out-Null
Test-Endpoint $web "UNAUTH" "GET" "/api/export-orders" $null $false | Out-Null
Test-Endpoint $web "UNAUTH" "GET" "/api/selling-points" $null $false | Out-Null
Test-Endpoint $web "UNAUTH" "GET" "/api/salary" $null $false | Out-Null
Test-Endpoint $web "UNAUTH" "GET" "/api/work-schedule" $null $false | Out-Null
Test-Endpoint $web "UNAUTH" "GET" "/api/costs" $null $false | Out-Null
Test-Endpoint $web "UNAUTH" "GET" "/api/dashboard" $null $false | Out-Null
Test-Endpoint $web "UNAUTH" "GET" "/api/inventory" $null $false | Out-Null

Write-Host "`n========== C. LOGIN AS ADMIN =========="
$web = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$ok = Login $web "admin" "admin123"
if ($ok) { Write-Host "OK admin login" } else { Write-Host "FAIL admin login" }

Write-Host "`n========== D. ADMIN APIs =========="
Test-Endpoint $web "USERS" "GET" "/api/users" $null $true | Out-Null
Test-Endpoint $web "PROD" "GET" "/api/products" $null $true | Out-Null
Test-Endpoint $web "SP" "GET" "/api/selling-points" $null $true | Out-Null
Test-Endpoint $web "IO" "GET" "/api/import-orders" $null $true | Out-Null
Test-Endpoint $web "EO" "GET" "/api/export-orders" $null $true | Out-Null
Test-Endpoint $web "SAL" "GET" "/api/salary" $null $true | Out-Null
Test-Endpoint $web "COSTS" "GET" "/api/costs" $null $true | Out-Null
Test-Endpoint $web "WS" "GET" "/api/work-schedule" $null $true | Out-Null
Test-Endpoint $web "DASH" "GET" "/api/dashboard" $null $true | Out-Null
Test-Endpoint $web "INV" "GET" "/api/inventory" $null $true | Out-Null
Test-Endpoint $web "SESS" "GET" "/api/auth/session" $null $true | Out-Null

Write-Host "`n========== E. POST/CREATE OPS =========="
# Get first product
$prodResp = Invoke-WebRequest -Uri "$BASE/api/products" -UseBasicParsing -WebSession $web
$products = ($prodResp.Content | ConvertFrom-Json).data
# Get first branch
$brResp = Invoke-WebRequest -Uri "$BASE/api/branches" -UseBasicParsing -WebSession $web
$branches = ($brResp.Content | ConvertFrom-Json -ErrorAction SilentlyContinue).data
$branchIdVal = $null
if ($branches -and $branches.Count -gt 0) { $branchIdVal = $branches[0].id }
if ($products.Count -gt 0 -and $branchIdVal) {
    $prodId = $products[0].id
    $body = @{ branchId = $branchIdVal; importDate = (Get-Date).ToString("o"); items = @(@{ productId = $prodId; quantity = 5; unitPrice = 10000 }); note = "E2E test" } | ConvertTo-Json -Depth 5
    Test-Endpoint $web "IO-POST" "POST" "/api/import-orders" $body $true | Out-Null
}

# Get first selling point
$spResp = Invoke-WebRequest -Uri "$BASE/api/selling-points" -UseBasicParsing -WebSession $web
$sps = ($spResp.Content | ConvertFrom-Json).data
if ($sps.Count -gt 0 -and $products.Count -gt 0 -and $branchIdVal) {
    $spId2 = $sps[0].id
    $prodId2 = $products[0].id
    $body = @{ branchId = $branchIdVal; exportDate = (Get-Date).ToString("o"); sellingPointId = $spId2; items = @(@{ productId = $prodId2; quantity = 1; unitPrice = 15000 }); note = "E2E test" } | ConvertTo-Json -Depth 5
    Test-Endpoint $web "EO-POST" "POST" "/api/export-orders" $body $true | Out-Null
}

Write-Host "`n========== F. GDCN LOGIN =========="
$web = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$ok = Login $web "gdcn" "admin123"
if ($ok) { Write-Host "OK gdcn login" } else { Write-Host "FAIL gdcn login" }
Test-Endpoint $web "GDCN-USERS" "GET" "/api/users" $null $true | Out-Null
Test-Endpoint $web "GDCN-EO" "GET" "/api/export-orders" $null $true | Out-Null
Test-Endpoint $web "GDCN-DASH" "GET" "/api/dashboard" $null $true | Out-Null
Test-Endpoint $web "GDCN-COSTS" "GET" "/api/costs" $null $true | Out-Null
Test-Endpoint $web "GDCN-PROD" "GET" "/api/products" $null $true | Out-Null

Write-Host "`n========== G. EMPLOYEE LOGIN =========="
$web = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$ok = Login $web "nv" "admin123"
if ($ok) { Write-Host "OK nv login" } else { Write-Host "FAIL nv login" }
Test-Endpoint $web "NV-SAL" "GET" "/api/salary" $null $true | Out-Null
Test-Endpoint $web "NV-EO" "GET" "/api/export-orders" $null $true | Out-Null
Test-Endpoint $web "NV-IO" "GET" "/api/import-orders" $null $true | Out-Null
Test-Endpoint $web "NV-USERS" "GET" "/api/users" $null $true | Out-Null
Test-Endpoint $web "NV-DASH" "GET" "/api/dashboard" $null $true | Out-Null

Write-Host "`n========== H. PAGES (HTML) =========="
$web = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Test-Endpoint $web "PAGE-LOGIN" "GET" "/login" $null $false | Out-Null
Login $web "admin" "admin123" | Out-Null
Test-Endpoint $web "PAGE-DASH" "GET" "/dashboard" $null $true | Out-Null
Test-Endpoint $web "PAGE-USERS" "GET" "/users" $null $true | Out-Null
Test-Endpoint $web "PAGE-PROD" "GET" "/products" $null $true | Out-Null
Test-Endpoint $web "PAGE-SP" "GET" "/selling-points" $null $true | Out-Null
Test-Endpoint $web "PAGE-IO" "GET" "/import-orders" $null $true | Out-Null
Test-Endpoint $web "PAGE-EO" "GET" "/export-orders" $null $true | Out-Null
Test-Endpoint $web "PAGE-SAL" "GET" "/salary" $null $true | Out-Null
Test-Endpoint $web "PAGE-WS" "GET" "/work-schedule" $null $true | Out-Null
Test-Endpoint $web "PAGE-COSTS" "GET" "/costs" $null $true | Out-Null
Test-Endpoint $web "PAGE-NS" "GET" "/production" $null $true | Out-Null
Test-Endpoint $web "PAGE-BC" "GET" "/reports" $null $true | Out-Null
Test-Endpoint $web "PAGE-INV" "GET" "/inventory" $null $true | Out-Null

# Summary
$pass = ($script:results | Where-Object { $_.Ok }).Count
$fail = $script:results.Count - $pass
Write-Host ("=" * 75)
Write-Host ("Tong: {0}/{1} pass, {2} fail" -f $pass, $script:results.Count, $fail)
if ($fail -gt 0) {
    Write-Host "FAILURES:"
    $script:results | Where-Object { -not $_.Ok } | ForEach-Object { Write-Host ("   {0} {1} -> {2} {3}" -f $_.Method, $_.Path, $_.Status, $_.Note) }
}
