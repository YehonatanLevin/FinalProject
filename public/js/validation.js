(function () {
    function showErrors($form, messages) {
        var $box = $form.prev('.client-errors');
        if (!messages.length) {
            $box.remove();
            return;
        }
        if (!$box.length) {
            $box = $('<div class="alert alert-danger client-errors" role="alert"></div>');
            $form.before($box);
        }
        var $list = $('<ul class="error-list"></ul>');
        messages.forEach(function (m) { $list.append($('<li></li>').text(m)); });
        $box.empty().append($list);
        window.scrollTo(0, 0);
    }

    function validateRegister() {
        var messages = [];
        var username = $('#username').val().trim();
        var fullName = $('#fullName').val().trim();
        var email = $('#email').val().trim();
        var password = $('#password').val();
        var confirmValue = $('#passwordConfirm').val();

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            messages.push('שם משתמש: 3 עד 20 תווים, אותיות באנגלית, ספרות וקו תחתון בלבד');
        }
        if (fullName.length < 2) { messages.push('יש להזין שם מלא'); }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { messages.push('כתובת האימייל אינה תקינה'); }
        if (password.length < 6) { messages.push('הסיסמה חייבת להכיל לפחות 6 תווים'); }
        if (password !== confirmValue) { messages.push('הסיסמאות אינן תואמות'); }
        return messages;
    }

    function validateLogin() {
        var messages = [];
        if (!$('#username').val().trim()) { messages.push('יש להזין שם משתמש'); }
        if (!$('#password').val()) { messages.push('יש להזין סיסמה'); }
        return messages;
    }

    function validateProfile() {
        var messages = [];
        var fullName = $('#fullName').val().trim();
        var bio = $('#bio').val();
        var goal = $('#monthlyGoalKm').val();

        if (fullName.length < 2) { messages.push('יש להזין שם מלא'); }
        if (bio.length > 200) { messages.push('התיאור לא יכול להכיל יותר מ-200 תווים'); }
        if (goal !== '' && (isNaN(Number(goal)) || Number(goal) < 0 || Number(goal) > 1000)) {
            messages.push('היעד החודשי חייב להיות מספר בין 0 ל-1000');
        }
        return messages;
    }

    var forms = [
        { selector: '#registerForm', validate: validateRegister },
        { selector: '#loginForm', validate: validateLogin },
        { selector: '#profileForm', validate: validateProfile }
    ];

    $(function () {
        forms.forEach(function (config) {
            var $form = $(config.selector);
            if (!$form.length) { return; }
            $form.on('submit', function (e) {
                var messages = config.validate();
                if (messages.length) { e.preventDefault(); }
                showErrors($form, messages);
            });
        });
    });
})();