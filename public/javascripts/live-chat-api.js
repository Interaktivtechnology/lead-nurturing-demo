var LC_API = LC_API || {};
LC_API.on_after_load = function () {
    LC_API.open_chat_window();
    LC_API.set_custom_variables(window.__lc.visitor);


    console.log(window.__lc.visitor);
};
LC_API.on_chat_started = function (data) {
    const visitor_id = LC_API.get_visitor_id();
    $.ajax({
        url: '/lead/',
        type: 'POST',
        data: {
            visitor_id,
        },
        success(res) {
            console.log(res);
        },
        error(res) {
            console.log(res);
        },
    });
};


LC_API.on_message = function (data) {
    const visitor_id = LC_API.get_visitor_id();
    const chat_id = LC_API.get_chat_id();
    console.log(visitor_id);
};
