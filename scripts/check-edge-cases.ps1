# Edge case verification - requirement 29
# Run while the server is up:  npm start   then   .\scripts\check-edge-cases.ps1

$base = "http://localhost:3000"
$pass = 0
$fail = 0

function Check($name, $expected, $actual) {
    if ($expected -eq $actual) {
        Write-Host ("  PASS  {0,-40} {1}" -f $name, $actual) -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host ("  FAIL  {0,-40} expected {1}, got {2}" -f $name, $expected, $actual) -ForegroundColor Red
        $script:fail++
    }
}

function Status($method, $path, $fields) {
    try {
        $req = @{
            Uri = ($base + $path)
            Method = $method
            ErrorAction = "Stop"
            MaximumRedirection = 0
        }
        if ($fields) { $req.Body = $fields }
        (Invoke-WebRequest @req -UseBasicParsing).StatusCode
    } catch {
        if ($_.Exception.Response) {
            [int]$_.Exception.Response.StatusCode
        } elseif ($_.TargetObject -and $_.TargetObject.StatusCode) {
            [int]$_.TargetObject.StatusCode
        } elseif ($_.Exception -is [System.InvalidOperationException]) {
            302
        } else {
            0
        }
    }
}

Write-Host ""
Write-Host "Edge case checks" -ForegroundColor Cyan
Write-Host "----------------"
Write-Host ""

Write-Host "Public pages"
Check "GET /"                200 (Status GET "/" $null)
Check "GET /about"           200 (Status GET "/about" $null)
Check "GET /login"           200 (Status GET "/login" $null)
Check "GET /register"        200 (Status GET "/register" $null)
Check "GET /no-such-page"    404 (Status GET "/no-such-page" $null)

Write-Host ""
Write-Host "Protected pages without login"
Check "GET /profile"         302 (Status GET "/profile" $null)
Check "GET /profile/edit"    302 (Status GET "/profile/edit" $null)
Check "GET /users"           302 (Status GET "/users" $null)
Check "POST /profile/edit"   302 (Status POST "/profile/edit" @{ fullName = "x" })

Write-Host ""
Write-Host "Registration with invalid input"
Check "empty fields"         400 (Status POST "/register" @{ username = ""; fullName = ""; email = ""; password = ""; passwordConfirm = "" })
Check "username too short"   400 (Status POST "/register" @{ username = "ab"; fullName = "Test User"; email = "a@b.com"; password = "secret1"; passwordConfirm = "secret1" })
Check "invalid email"        400 (Status POST "/register" @{ username = "validname"; fullName = "Test User"; email = "notanemail"; password = "secret1"; passwordConfirm = "secret1" })
Check "password mismatch"    400 (Status POST "/register" @{ username = "validname2"; fullName = "Test User"; email = "a2@b.com"; password = "secret1"; passwordConfirm = "secret2" })

Write-Host ""
Write-Host "Failed login"
Check "wrong credentials"    401 (Status POST "/login" @{ username = "nobody"; password = "wrongpass" })

Write-Host ""
Write-Host "Server still alive"
Check "GET / after all"      200 (Status GET "/" $null)

Write-Host ""
if ($fail -eq 0) {
    Write-Host ("Passed " + $pass + " checks, no failures.") -ForegroundColor Green
} else {
    Write-Host ("Passed " + $pass + ", failed " + $fail + ".") -ForegroundColor Yellow
}
Write-Host ""