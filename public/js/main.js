$(document).ajaxError(function (event, xhr) {
    if (xhr.status === 401) {
        window.location.href = '/login';
    }
});