document.getElementById('registerForm').onsubmit = function (e) {
    var messages = [];
    var username = document.getElementById('username').value.trim();
    var fullName = document.getElementById('fullName').value.trim();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var confirm = document.getElementById('passwordConfirm').value;

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        messages.push('שם משתמש: 3 עד 20 תווים, אותיות באנגלית, ספרות וקו תחתון בלבד');
    }
    if (fullName.length < 2) { messages.push('יש להזין שם מלא'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { messages.push('כתובת האימייל אינה תקינה'); }
    if (password.length < 6) { messages.push('הסיסמה חייבת להכיל לפחות 6 תווים'); }
    if (password !== confirm) { messages.push('הסיסמאות אינן תואמות'); }

    var box = document.getElementById('clientErrors');
    if (messages.length) {
        e.preventDefault();
        if (!box) {
            box = document.createElement('div');
            box.id = 'clientErrors';
            box.className = 'alert alert-danger';
            this.parentNode.insertBefore(box, this);
        }
        box.innerHTML = '<ul class="error-list"><li>' + messages.join('</li><li>') + '</li></ul>';
        window.scrollTo(0, 0);
    } else if (box) {
        box.remove();
    }
};