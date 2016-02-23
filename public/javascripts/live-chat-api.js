var LC_API = LC_API || {};
LC_API.on_after_load = function()
{
	LC_API.open_chat_window();
	LC_API.set_custom_variables(window.__lc.visitor);
	
	
	console.log(window.__lc.visitor);
};
LC_API.on_chat_started = function(data)
{
	var visitor_id = LC_API.get_visitor_id();
	$.ajax({
		"url" : "/lead/",
		"type" : "POST",
		"data" : {
			visitor_id : visitor_id
		},
		"success" : function(res){
			console.log(res);
		},
		"error" : function(res){
			console.log(res);
		}
	});
};


LC_API.on_message = function(data)
{
	var visitor_id = LC_API.get_visitor_id();
	var chat_id = LC_API.get_chat_id();
	console.log(visitor_id);
};
