# בדיקת מקרי קצה - דרישה 29
# הריצו כשהשרת פועל:  npm start  ואז  .\scripts\check-edge-cases.ps1

$base = "http://localhost:3000"
$pass = 0
$fail = 0

function Check($name, $expected, $actual) {
    if ($expected -eq $actual) {
        Write-Host ("  PASS  {0,-42} {1}" -f $name, $actual) -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host ("  FAIL  {0,-42} expected {1}, got {2}" -f $name, $expected, $actual) -ForegroundColor Red
        $script:fail++
    }
}

function Status($method, $path, $body, $session) {
    try {
        $req = @{ Uri = "$base$path"; Method = $method; ErrorAction = "Stop" }
        if ($body) { $req.Body = $body }
        if ($session) { $req.WebSession = $session }
        (Invoke-WebRequest @req -MaximumRedirection 0).StatusCode
    } catch [Microsoft.PowerShell.Commands.HttpResponseException] {
        [int]$_.Exception.Response.StatusCode
    } catch {
        if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
    }
}

Write-Host "`nבדיקת מקרי קצה" -ForegroundColor Cyan
Write-Host "----------------`n"

Write-Host "דפים ציבוריים"
Check "GET /"                200 (Status GET "/" $null $null)
Check "GET /about"           200 (Status GET "/about" $null $null)
Check "GET /login"           200 (Status GET "/login" $null $null)
Check "GET /register"        200 (Status GET "/register" $null $null)
Check "GET /no-such-page"    404 (Status GET "/no-such-page" $null $null)

Write-Host "`nדפים מוגנים ללא התחברות"
Check "GET /profile"         302 (Status GET "/profile" $null $null)
Check "GET /profile/edit"    302 (Status GET "/profile/edit" $null $null)
Check "GET /users"           302 (Status GET "/users" $null $null)
Check "POST /profile/edit"   302 (Status POST "/profile/edit" "fullName=x" $null)

Write-Host "`nהרשמה עם קלט לא תקין"
Check "שדות ריקים"           400 (Status POST "/register" "username=&fullName=&email=&password=&passwordConfirm=" $null)
Check "שם משתמש קצר"          400 (Status POST "/register" "username=ab&fullName=Test User&email=a@b.com&password=secret1&passwordConfirm=secret1" $null)
Check "אימייל לא תקין"        400 (Status POST "/register" "username=validname&fullName=Test User&email=notanemail&password=secret1&passwordConfirm=secret1" $null)
Check "סיסמאות לא תואמות"     400 (Status POST "/register" "username=validname2&fullName=Test User&email=a2@b.com&password=secret1&passwordConfirm=secret2" $null)

Write-Host "`nהתחברות שגויה"
Check "פרטים לא נכונים"       401 (Status POST "/login" "username=nobody&password=wrongpass" $null)

Write-Host "`nהשרת עדיין חי"
Check "GET / אחרי הכל"       200 (Status GET "/" $null $null)

Write-Host ""
if ($fail -eq 0) {
    Write-Host "עברו $pass בדיקות, אף כשל." -ForegroundColor Green
} else {
    Write-Host "עברו $pass, נכשלו $fail." -ForegroundColor Yellow
}
Write-Host ""