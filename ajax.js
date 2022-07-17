var globalAJAX;

function ajaxUpdate()
{
	"use strict";
	if (globalAJAX.req.readyState === 4)
	{
		if (globalAJAX.req.status === 200)
		{
			globalAJAX.handler(JSON.parse(globalAJAX.req.responseText));
		}
		else
		{
			console.log("AJAX error: " + globalAJAX.req.status);
		}
	}
}

function ajax(u, h, p = "")
{
	if (globalAJAX == undefined)
	{
		globalAJAX = new Object();
	}
	globalAJAX.handler = h;
	globalAJAX.req = new XMLHttpRequest();
	globalAJAX.req.onreadystatechange = ajaxUpdate;
	globalAJAX.req.open("GET", u + "?" + p, true);
	globalAJAX.req.send(null);
}

