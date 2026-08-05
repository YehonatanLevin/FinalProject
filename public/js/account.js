$(function () {
    $('#deleteAccountForm').on('submit', function (e) {
        if (!confirm('למחוק את החשבון לצמיתות? לא ניתן לשחזר.')) {
            e.preventDefault();
        }
    });
});