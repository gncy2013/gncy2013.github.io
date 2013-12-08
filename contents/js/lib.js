function Ajax(url,callback){
    this.req = new XMLHttpRequest();
    this.url = url;
    this.callback = callback;
    this.bindFunc = function(call,object){
        return function(){
            return call.apply(object,new Array(object));
        }
    }
    this.stateChange = function(object){
        if(this.req.readyState==4){
            this.callback(this.req.responseText);
        }
    }
    if(this.req){
        this.req.open("GET",url,true);
        this.req.onreadystatechange = this.bindFunc(this.stateChange,this);
        this.req.send(null);
    }
}
function load_script(url){
    var head = document.getElementsByTagName('head')[0];
    script = document.createElement('script');
    script.src = url;
    head.appendChild(script);
}
function serialize(form) {
    var parts = new Array();
    var field = null;
    for (var i = 0, len = form.elements.length; i < len; i++) {
        field = form.elements[i];
        switch (field.type) {
        case "select-one":
        case "select-multiple":
            for (var j = 0, optLen = field.options.length; j < optLen; j++) {
                var option = field.options[j];
                if (option.selected) {
                    var optValue = "";
                    if (option.hasAttribute) {
                        optValue = (option.hasAttribute("value") ? option.value : option.text);
                    } else {
                        optValue = (option.attributes["value"].specified ? option.value : option.text);
                    }
                    parts.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(optValue));
                }
            }
            break;
        case undefined:
        case "checkbox":
            if (!field.checked) {
                break;
            }
        default:
            parts.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
        }
    }
    return parts.join("&");
}
function getMousePoint(ev) {
	var point = {
		x:0,
		y:0
	};
	if(typeof window.pageYOffset != 'undefined') {
		point.x = window.pageXOffset;
		point.y = window.pageYOffset;
	}
	else if(typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
		point.x = document.documentElement.scrollLeft;
		point.y = document.documentElement.scrollTop;
	}
	else if(typeof document.body != 'undefined') {
		point.x = document.body.scrollLeft;
		point.y = document.body.scrollTop;
	}
	point.x += ev.clientX;
	point.y += ev.clientY;
	return point;
}