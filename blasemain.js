
var bleventsobj;

function initPage()
{
	let tstr = "";
	//let links = {"News": "reqN('u')", "Games": "getGames()", "Standings": "reqStandings()", "Team Rosters": "reqDisplay('t=0')", "Narratives": "reqN('v')"};
	let links = {"News": "reqN('u')", "Games": "getGames()", "Teams & Standings": "reqStandings()", "Archives": "reqArchive()", "Hall": "reqDisplay('r=22')", "Narratives": "reqN('v')"};
	tstr += "<h3>";
	let tarray = new Array();
	for (let tlink in links)
	{
		tarray.push(mlink(links[tlink], tlink));
	}
	tstr += tarray.join(" - ");
	tstr += "</h3>\n\n";
	document.getElementById("id_navbar").innerHTML = tstr;
	last_time = 0;
	let hmatch = document.location.href.match(/\?(\w=\d+)/);
	if (hmatch != null)
	{
		reqDisplay(hmatch[1]);
	}
	else
	{
		reqN("u");
	}
}

function mlink(ps, pt, ptarget = null)
{
	let ptlink = "";
	if (ptarget != null)
	{
		ptlink = " target=\"ptarget\"";
	}
	return "<a href=\"#\"" + ptlink + " onclick=\"" + ps + "; return false;\">" + pt + "</a>";
}

function reqArchive(pt = null, pn = 0)
{
	setBlevents(false);
	let tstr = "";
	if (pt !== null)
	{
		tstr += pt + "=" + pn;
	}
	ajax(blaseball_url + "archives.php", arcHandler, tstr);
}

function timeCodeStr(pt)
{
	let td = new Date(pt * 5000);
	return td.toLocaleDateString() + " " + td.toLocaleTimeString();
}

function weatherStr(p)
{
	let weathertypes = ["Cool", "Nut Dust", "Feedback", "Solar Eclipse", "Night", "Meat Shower"];
	let weathericons = ["cool", "nut", "feedback", "eclipse", "night", "meat"];
	if (weathertypes[p] == undefined)
	{
		return "Error, invalid weather " + p + "!";
	}
	return "<img src=\"graphics/w_" + weathericons[p] + ".png\" alt=\"" + weathertypes[p] + "\"/> " + weathertypes[p];
}

function arcHandler(p)
{
	let tstr = "";
	tstr += "<h3>Archives</h3>\n\n";
	// single game: p["g"] is set with game info, p["s"] has events
	// all games in interval: p["i"] is set with interval name, p["s"] has games
	// all intervals: nothing set as above
	if (p["g"] != undefined)
	{
		// single game
		tstr += "<p><b>" + p["g"]["namehome"] + " vs. " + p["g"]["nameaway"] + " - " + timeCodeStr(p["g"]["starttime"]) + " at " + p["g"]["stadium_short"] + " - Final score: " + p["g"]["scorehome"] + "-" + p["g"]["scoreaway"] + " " + weatherStr(p["g"]["weather"]) + "</b></p>\n\n";
		for (let ti of p["s"])
		{
			tstr += formatBlevent(p["g"], ti, false);
		}
	}
	else if (p["i"] != undefined)
	{
		// all games and incidents in interval
		tstr += "<table class=\"itable\"><tbody><tr><td>\n\n";
		tstr += "<p><b>" + p["i"] + "</b></p>\n\n";
		if (p["s"] == undefined)
		{
			tstr += "<p>No games found!</p>\n\n";
		}
		else
		{
			for (let ti of p["s"])
			{
				tstr += "<p>" + ti["id"] + ": " + mlink("reqArchive('g'," + ti["id"] + ")", ti["namehome"] + " vs. " + ti["nameaway"] + " - " + ti["scorehome"] + "-" + ti["scoreaway"] + " " + weatherStr(ti["weather"])) + "</p>\n\n";
			}
		}
		if (p["c"] != undefined && p["c"].length > 0)
		{
			tstr += "</td>\n\n<td>\n";
			// incidents
			tstr += "<p><b>Incidents</b></p>\n\n";
			p["c"].sort((a, b) => b["timeindex"] - a["timeindex"]);
			for (let ti of p["c"])
			{
				tstr += "<p>" + timeCodeStr(ti["timeindex"]) + " - " + playerNameIdLink(ti["eventtext"]) + "</p>\n\n";
			}
		}
		tstr += "</td></tr></tbody></table>\n\n";
	}
	else
	{
		// list all intervals, ALSO incidents
		tstr += "<table class=\"itable\"><tbody><tr><td>\n\n";
		tstr += "<p><b>NLB Time Periods</b></p>\n\n";
		for (let ti of p["s"])
		{
			tstr += "<p>" + mlink("reqArchive('i'," + ti["id"] + ")", ti["name"]) + "</p>\n\n";
		}
		tstr += "</td>\n\n<td>\n";
		// incidents
		tstr += "<p><b>Most Recent Incidents</b></p>\n\n";
		p["c"].sort((a, b) => b["timeindex"] - a["timeindex"]);
		for (let ti of p["c"])
		{
			tstr += "<p>" + timeCodeStr(ti["timeindex"]) + " - " + playerNameIdLink(ti["eventtext"]) + "</p>\n\n";
		}
		tstr += "</td></tr></tbody></table>\n\n";
	}
	document.getElementById("id_result").innerHTML = tstr;
}

function reqN(ptype, pn = 0)
{
	setBlevents(false);
	ajax(blaseball_url + "updates.php", nHandler, "t=" + ptype + "&n=" + pn);
}

function nHandler(p)
{
	let tstr = "";
	// p["t"] is either u or v
	let heading = {"u": "News", "v": "Narratives"};
	// show full text of one item, summaries of the others
	tstr += "<h3>" + heading[p["t"]] + "</h3>\n\n";
	if (p["n"].length <= 0)
	{
		tstr += "<h3>No news...is good news?</h3>\n\n";
	}
	else
	{
		if (p["t"] == "u")
		{
			tstr += "<table><tbody><tr><td>\n";
		}
		p["n"].sort((a, b) => b["id"] - a["id"]);
		let firstitem = "";
		let otheritems = "";
		for (let titem of p["n"])
		{
			// TODO - refactor
			if (p["m"]["id"] == titem["id"])
			{
				firstitem += "<p>" + titem["date"] + " - " + mlink("reqN('" + p["t"] + "'," + titem["id"] + ")", titem["title"]);
				firstitem += "<p><hr/></p>\n\n";
				firstitem += "<p>" + playerNameIdLink(p["m"]["text"]) + "</p>\n\n";
				if (p["t"] == "u")
				{
					firstitem += " by " + titem["poster"];
				}
				firstitem += "</p>\n\n";
				continue;
			}
			otheritems += "<p>" + titem["date"] + " - " + mlink("reqN('" + p["t"] + "'," + titem["id"] + ")", titem["title"]);
			if (p["t"] == "u")
			{
				otheritems += " by " + titem["poster"];
			}
			otheritems += "</p>\n\n";
		}
		tstr += firstitem + "<p><hr/></p>\n\n" + otheritems;
		if (p["t"] == "u")
		{
			tstr += "</td>\n\n<td>";
			// highlights
			tstr += "<p><b>Highlights</b></p>\n\n";
			if (p["h"] != undefined && p["h"].length > 0)
			{
				p["h"].sort((a, b) => b["bcount"] - a["bcount"]);
				for (let thighlight of p["h"])
				{
					tstr += "<p>" + mlink("reqArchive('g'," + thighlight["game"] + ")", playerNameIdLink(thighlight["bleventtext"], true)) + "<br/>\n<span class=\"blevent\">" + thighlight["bcount"] + " Highlight" + (thighlight["bcount"] == 1 ? "" : "s") + "</span> - <div id=\"hl_" + thighlight["bleventid"] + "\"><span class=\"blevent\">" + mlink("highlightEvent(" + thighlight["bleventid"] + ")", "HIGHLIGHT") + "</span></div></p>\n\n";
				}
			}
			tstr += "</td></tr></tbody></table>\n\n";
		}
	}
	document.getElementById("id_result").innerHTML = tstr;
}

function highlightEvent(pe)
{
	ajax(blaseball_url + "highlight.php", highlightHandler, "e=" + pe);
}

function highlightHandler(p)
{
	// test for success? eh, w/e
	let tel = document.getElementById("hl_" + p["i"]);
	if (tel !== null)
	{
		tel.innerHTML = "<span class=\"blevent\">HILIT!</span>";
	}
}

function setBlevents(p)
{
	if (bleventsobj != undefined)
	{
		bleventsobj["running"] = p;
	}
}

function getGames()
{
	bleventsobj = new Object();
	bleventsobj["needreset"] = false;
	bleventsobj["last_time"] = 0;
	bleventsobj["games"] = [];
	//ajax(blaseball_url + "games.php", gamesHandler, "r=" + (Math.floor(Math.random() * 1048576)));
	setBlevents(true);
	ajax(blaseball_url + "games.php", gamesHandler);
}

function timeToDay(pn)
{
	let s1start = 331034400;
	let s2start = 331273440;
	if (pn < s1start)
	{
		// Error!
		return 0;
	}
	if (pn < s2start)
	{
		pn -= s1start;
	}
	else
	{
		pn -= s2start;
	}
	return Math.floor(pn / 720);
}

function gamesHandler(p)
{
	let tstr = "";
	if (p["g"].length <= 0)
	{
		tstr += "<h3>No currently running games</h3>\n\n";
	}
	else
	{
		for (let tgame of p["g"])
		{
			bleventsobj["games"][tgame["id"]] = new Object();
			for (let tfield in tgame)
			{
				bleventsobj["games"][tgame["id"]][tfield] = tgame[tfield];
			}
			//tstr += "<p>Game " + tgame["id"] + ": " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["namehome"]) + " vs. " + mlink("reqDisplay('t=" + tgame["teamaway"] + "')", tgame["nameaway"]) + " at " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["stadium_short"]);
			if (tgame["s"] > 0)
			{
				// ongoing
				tstr += "</p>\n\n<div id=\"idgame" + tgame["id"] + "\"></div>\n\n";
			}
			else
			{
				// ended
				//tstr += "<p>Championship: " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["namehome"]) + " vs. " + mlink("reqDisplay('t=" + tgame["teamaway"] + "')", tgame["nameaway"]) + " at " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["stadium_short"]) + " - Final Score: " + tgame["scorehome"] + " - " + tgame["scoreaway"] + "</p>\n\n";
				tstr += "<p>Game: " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["namehome"]) + " vs. " + mlink("reqDisplay('t=" + tgame["teamaway"] + "')", tgame["nameaway"]) + " at " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["stadium_short"]) + " - Final Score: " + tgame["scorehome"] + " - " + tgame["scoreaway"] + "</p>\n\n";
			}
		}
		bleventRequest();
	}
	document.getElementById("id_result").innerHTML = tstr;
}

function bleventRequest()
{
	if (!bleventsobj["running"])
	{
		return;
	}
	if (Math.floor(Date.now() / 5000) <= bleventsobj["last_time"])
	{
		setTimeout(bleventRequest, 2000);
		return;
	}
	//ajax(blaseball_url + "blevent.php", bleventHandler, "t=" + bleventsobj["last_time"] + "&r=" + (Math.floor(Math.random() * 1048576)));
	ajax(blaseball_url + "blevent.php", bleventHandler, "t=" + bleventsobj["last_time"]);
}

function makeCircles(pn, pt)
{
	// display circles for number of outs, balls, strikes
	// pt is the "target"; 3 for outs, 4 for balls, 3 for strikes
	// thus pn 1 pt 3 results in 1 filled circle, 2 empty circles
	let tstr = "";
	if (isNaN(pn) || isNaN(pt) || pt < 0 || pn < 0 || pn > pt)
	{
		return "err!";
	}
	for (let ti = 0; ti < pt; ++ti)
	{
		if (ti < pn)
		{
			tstr += "&#x25cf;";
		}
		else
		{
			tstr += "&#x25cb;";
		}
	}
	return tstr;
}

function playerNameIdLink(pstr, blankflag = false)
{
	if (pstr == undefined || pstr === null)
	{
		return pstr;
	}
	if (blankflag)
	{
		pstr = pstr.replaceAll(/(\S*)#(\d+)/g, (pm,p1,p2,po,ps,pn) => p1.replaceAll("_", " "));
		pstr = pstr.replaceAll(/(\S*)#T(\d+)/g, (pm,p1,p2,po,ps,pn) => p1.replaceAll("_", " "));
	}
	else
	{
		pstr = pstr.replaceAll(/(\S*)#(\d+)/g, (pm,p1,p2,po,ps,pn) => "<a href=\"?p=" + p2 + "\" target=\"_blank\">" + p1.replaceAll("_", " ") + "</a>");
		pstr = pstr.replaceAll(/(\S*)#T(\d+)/g, (pm,p1,p2,po,ps,pn) => "<a href=\"?t=" + p2 + "\" target=\"_blank\">" + p1.replaceAll("_", " ") + "</a>");
	}
	return pstr;
}

function bleventHandler(p)
{
	// status: in s: 0 = error, 1 = update, 2 = no update yet
	// current time index as calculated by server: in c
	if (p["s"] > 0)
	{
		bleventsobj["last_time"] = p["c"];
		if (p["s"] == 1)
		{
			// events: in b
			for (let pkey in p["b"])
			{
				let pevent = p["b"][pkey];
				let tel = document.getElementById("idgame" + pevent["game"]);
				if (tel === null)
				{
					bleventsobj["needreset"] = true;
					continue;
				}
				let tgame = bleventsobj["games"][pevent["game"]];

				let tstr = formatBlevent(tgame, pevent);

				tel.innerHTML = tstr;
			}
		}
		if (bleventsobj["needreset"])
		{
			getGames();
		}
		else
		{
			setTimeout(bleventRequest, 2000);
		}
	}
}

function formatBlevent(tgame, pevent, th = true)
{
	let tstr = "";
	tstr += "<table class=\"gametable\">\n";
	if (th)
	{
		//tstr += "<thead><tr><th colspan=4><p>\nGame " + tgame["id"] + ": " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["namehome"]) + " vs. " + mlink("reqDisplay('t=" + tgame["teamaway"] + "')", tgame["nameaway"]) + ", at " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["stadium_short"]) + " " + weatherStr(tgame["weather"]) + "\n</p></th></tr></thead>\n";
		tstr += "<thead><tr><th colspan=4><p>\nDay " + timeToDay(tgame["starttime"]) + ": " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["namehome"]) + " vs. " + mlink("reqDisplay('t=" + tgame["teamaway"] + "')", tgame["nameaway"]) + ", at " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["stadium_short"]) + " " + weatherStr(tgame["weather"]) + "\n</p></th></tr></thead>\n";
	}
	tstr += "<tbody>\n";
	tstr += "<tr>\n";
	tstr += "<td class=\"scorebox\">\n";
	tstr += "<p class=\"blevent\">\n" + ["Top", "Bottom"][pevent["tophalf"]] + " of " + pevent["inning"] + "</p>\n\n";
	tstr += "<p>\n";
	tstr += tgame["emojihome"] + " " + mlink("reqDisplay('t=" + tgame["teamhome"] + "')", tgame["namehome"]) + " - " + pevent["scorehome"];
	tstr += "</p>\n";
	tstr += "<p>\n";
	tstr += tgame["emojiaway"] + " " + mlink("reqDisplay('t=" + tgame["teamaway"] + "')", tgame["nameaway"]) + " - " + pevent["scoreaway"];
	tstr += "</p>\n";
	tstr += "</td>\n";
	let tbstr = "";
	let tbases = [];
	let tbflag = false;
	pevent["base0"] = parseInt(pevent["base0"]);
	pevent["base1"] = parseInt(pevent["base1"]);
	pevent["base2"] = parseInt(pevent["base2"]);
	if (pevent["base0"] > 0)
	{
		tbflag = true;
		tbases.push("First");
	}
	if (pevent["base1"] > 0)
	{
		tbflag = true;
		tbases.push("Second");
	}
	if (pevent["base2"] > 0)
	{
		tbflag = true;
		tbases.push("Third");
	}
	if (tbflag)
	{
		tbstr += "Runners on: " + tbases.join(", ");
	}
	let tbnum = (((pevent["base2"] * 2) + pevent["base1"]) * 2) + pevent["base0"];
	tstr += "<td>\n";
	tstr += "<p><img src=\"graphics/bases" + tbnum + ".png\" alt=\"" + tbstr + "\"/></p>\n\n";
	tstr += "<p class=\"small\">\n";
	tstr += "<span class=\"blevent\">Outs:</span> " + makeCircles(pevent["outs"], 3) + "<br/>\n\n";
	tstr += "<span class=\"blevent\">Balls:</span> " + makeCircles(pevent["balls"], 4) + "<br/>\n\n";
	tstr += "<span class=\"blevent\">Strikes:</span> " + makeCircles(pevent["strikes"], 3) + "<br/>\n\n";
	tstr += "<span class=\"blevent\">Pitching:</span> " + playerNameIdLink(pevent["pitcher"]) + "<br/>\n\n";
	tstr += "<span class=\"blevent\">Batting:</span> " + playerNameIdLink(pevent["batter"]) + "\n\n";
	tstr += "</p>\n";
	tstr += "</td>\n\n";
	tstr += "<td>\n";
	tstr += "<p class=\"blevent\">Game Log</p>\n";
	tstr += "<p>" + playerNameIdLink(pevent["blevent"]) + "</p>\n\n";
	tstr += "<p><div id=\"hl_" + pevent["id"] + "\">" + mlink("highlightEvent(" + pevent["id"] + ")", "<span class=\"blevent\">HIGHLIGHT</span>") + "</div></p>\n\n";
	tstr += "</td></tr></tbody></table>\n";
	return tstr;
}

function teamFormat(ptext, pteam)
{
	if (isNaN(pteam) || pteam < 1 || pteam > 20)
	{
		return ptext;
	}
	return "<span class=\"team" + pteam + "\">" + ptext + "</span>";
}

function reqStandings()
{
	//ajax(blaseball_url + "standings.php", standLer, "r=" + (Math.floor(Math.random() * 1048576)));
	setBlevents(false);
	ajax(blaseball_url + "standings.php", standLer);
}

function standLer(p)
{
	let leagues = ["Unknown League", "Comedy Escalation", "Tragedy Escalation", "Tragedy Denouement", "Comedy Denouement"];
	// process standings information sent back from server
	let tstr = "";
	if (p["e"].startsWith("Error 2"))
	{
		tstr += "<h3>No games have been played, thus, no standings</h3>\n\n";
		p["i"] = "<p><b>Between Seasons</b></p>\n\n";
	}
	if (true)
	{
		let standings = new Array();
		for (let td = 1; td <= 4; ++td)
		{
			standings[td] = new Array();
		}
		for (let tkey in p["s"])
		{
			if (tkey == "p")
			{
				continue;
			}
			let tobj = new Object();
			tobj["id"] = tkey;
			tobj["wins"] = p["s"][tkey]["wins"];
			tobj["losses"] = p["s"][tkey]["losses"];
			tobj["name"] = p["s"][tkey]["name"];
			standings[p["s"][tkey]["league"]].push(tobj);
		}
		tstr += "<table class=\"blanktable\"><thead><th colspan=\"2\">" + p["i"] + "</th></thead><tbody>\n";
		for (let tkey in p["s"]["p"])
		{
			tstr += "<tr><td>" + mlink("reqDisplay('t=" + tkey + "')", p["s"][tkey]["name"]) + "</td><td>" + p["s"]["p"][tkey] + "</td></tr>\n";
		}
		tstr += "</tbody></table>\n\n";
		tstr += "<table class=\"blanktable\"><thead><th colspan=\"2\">NLB Leagues</th></thead><tbody>\n";
		for (let td = 1; td <= 4; ++td)
		{
			standings[td].sort((a, b) => b["wins"] - a["wins"]);
			if (td % 2 == 1)
			{
				tstr += "<tr>\n";
			}
			tstr += "<td>\n";
			tstr += "<table width=\"100%\"><thead><th colspan=\"2\">" + leagues[td] + "</th></thead><tbody>\n";
			for (let trow of standings[td])
			{
				tstr += "<tr>\n";
				tstr += "<td>" + mlink("reqDisplay('t=" + trow["id"] + "')", trow["name"]) + "</td>\n";
				tstr += "<td>" + trow["wins"] + " - " + trow["losses"] + "</td>\n";
				tstr += "</tr>\n";
			}
			tstr += "</tbody></table>\n";
			tstr += "</td>\n";
			if (td % 2 == 0)
			{
				tstr += "</tr>\n";
			}
		}
		tstr += "</tbody><table>\n";
	}
	document.getElementById("id_result").innerHTML = tstr;
}

function reqDisplay(p)
{
	setBlevents(false);
	if (p.match(/^g/))
	{
		ajax(blaseball_url + "archives.php", arcHandler, p);
	}
	else
	{
		ajax(blaseball_url + "disp.php", handleDisplay, p);
	}
}

function ucfirst(p)
{
	return p.substring(0, 1).toLocaleUpperCase() + p.substring(1);
}

function fieldtrans(p)
{
	let fields = { "stadium_official": "Stadium", /*"stadium_short": "Stadium (Short Name)",*/ "uhm": "Home Uniform", /*"uhs": "Home Uniform, Secondary Color",*/ "uam": "Away Uniform", /*"uas": "Away Uniform, Secondary Color",*/ "peanutallergy": "Peanut Allergy", "pregame": "Pre-Game Ritual" };
	if (fields[p] == undefined)
	{
		return ucfirst(p);
	}
	return fields[p];
}

function makeStars(pinput)
{
	// make numbers into star ratings
	let tstr = "";
	let pn = pinput;
	if (isNaN(pn))
	{
		return tstr;
	}
	if (pn == 0)
	{
		return "0";
	}
	if (pn < 0)
	{
		tstr += "-";
		pn *= -1;
	}
	// round pn down to nearest .5
	pn = Math.floor(pn * 2) / 2;
	while (pn > .5)
	{
		tstr += "&starf;";
		pn--;
	}
	if (pn > 0)
	{
		tstr += "&frac12;";
	}
	tstr += " <span class=\"stat\">(" + pinput + ")</span>";
	return tstr;
}

function soulBreak(p)
{
	// sounds more badass than it is
	let breaklength = 16;
	let outputstr = "";
	while (p.length > breaklength)
	{
		outputstr += " " + p.substring(0, breaklength);
		p = p.substring(breaklength);
	}
	outputstr = (outputstr + " " + p).trim();
	return outputstr;
}

function handleDisplay(p)
{
	let peanutarray = ["NO", "YES"];
	let vibes = ["Honestly Terrible &#x2193; &#x2193; &#x2193;", "Far Less Than Ideal &#x2193; &#x2193;", "Less Than Ideal &#x2193;", "Neutral &#x2194;", "Quality &#x2191;", "Excellent &#x2191; &#x2191;", "Most Excellent &#x2191; &#x2191; &#x2191;"];
	let leagues = ["Unknown League", "Comedy Escalation", "Comedy Denouement", "Tragedy Escalation", "Tragedy Denouement"];
	let tstr = "";
	if (p["e"] != undefined)
	{
		// Error!
		return;
	}
	tstr += "<table>\n";
	let cteam, teamid, teamname, cfield, cplayer, playerid, playername, fieldskips;
	let iflag = false;
	switch (p["q"])
	{
		case "s":
			//console.log("handleDisplay: all teams");
			// display all teams
			tstr += "<h3>NLB Teams</h3>\n\n";
			for (cteam of p["s"])
			{
				tstr += "<tr>\n\n";
				tstr += "<td>";
				tstr += mlink("reqDisplay('t=" + cteam["id"] + "')", cteam["name"]);
				tstr += "</td>\n";
				tstr += "</tr>\n\n";
			}
			break;
		case "t":
			//console.log("handleDisplay: single team");
			// display particular team
			iflag = true;
			fieldskips = ["id", "uhs", "uas"];
			p["s"][0]["uhm"] = p["s"][0]["uhm"] + "/" + p["s"][0]["uhs"];
			p["s"][0]["uam"] = p["s"][0]["uam"] + "/" + p["s"][0]["uas"];
			p["s"][0]["stadium_official"] = p["s"][0]["stadium_official"] + " (" + p["s"][0]["stadium_short"] + ")";
			p["s"][0]["league"] = leagues[p["s"][0]["league"]];
			for (cfield in p["s"][0])
			{
				if (fieldskips.includes(cfield))
				{
					continue;
				}
				if (cfield == "id" || cfield == "stadium_short")
				{
					continue;
				}
				tstr += "<tr>\n";
				tstr += "<td>" + fieldtrans(cfield) + "</td><td>" + p["s"][0][cfield] + "</td>\n";;
				tstr += "</tr>\n";
			}
			tstr += "<tr><td colspan=2>" + mlink("reqDisplay('r=" + p["s"][0]["id"] + "')", "Team Roster") + "</td></tr>\n\n";
			tstr += "<tr><td colspan=2><a href=\"?t=" + p["s"][0]["id"] + "\">Permalink</a></td></tr>\n\n";
			break;
		case "r":
			// display all players on a team
			//console.log("handleDisplay: all players");
			tstr += "<h3>" + mlink("reqDisplay('t=" + p["s"][0]["team"]+ "')", p["s"][0]["teamname"]) + "</h3>\n\n";
			for (cplayer of p["s"])
			{
				tstr += "<tr>\n\n";
				tstr += "<td>";
				tstr += mlink("reqDisplay('p=" + cplayer["id"] + "')", cplayer["name"]) + " - " + cplayer["position"];
				tstr += "</td>\n";
				tstr += "</tr>\n\n";
			}
			break;
		case "p":
			// display a single player
			//console.log("handleDisplay: single player");
			fieldskips = ["id", "team", "teamname"];
			iflag = true;
			p["s"][0]["peanutallergy"] = peanutarray[p["s"][0]["peanutallergy"]];
			p["s"][0]["vibes"] = vibes[3 + parseInt(p["s"][0]["vibes"])];
			p["s"][0]["soulscream"] = "<span class=\"soul\">" + soulBreak(p["s"][0]["soulscream"]) + "</span>";
			for (cfield in p["s"][0])
			{
				if (fieldskips.includes(cfield))
				{
					continue;
				}
				if (cfield == "batting" || cfield == "pitching" || cfield == "baserunning" || cfield == "defense")
				{
					p["s"][0][cfield] = makeStars(p["s"][0][cfield]);
				}
				tstr += "<tr>\n";
				tstr += "<td>" + fieldtrans(cfield) + "</td><td>" + p["s"][0][cfield] + "</td>\n";
				tstr += "</tr>\n";
				if (cfield == "name")
				{
					//tstr += "<tr><td colspan=2>" + mlink("reqDisplay('r=" + p["s"][0]["team"] + "')", p["s"][0]["teamname"]) + "</td></tr>\n\n";
					tstr += "<tr><td>Team</td><td>" + mlink("reqDisplay('r=" + p["s"][0]["team"] + "')", p["s"][0]["teamname"]) + "</td></tr>\n\n";
				}
			}
			if (p["m"] != undefined)
			{
				for (let tmod of p["m"])
				{
					tstr += "<tr><td><p><img src=\"graphics/" + tmod["icon"] + "\" alt=\"" + tmod["name"] + "\"/> <b>" + tmod["name"] + "</b></td><td>" + tmod["modtext"] + "</p></td></tr>\n";
				}
			}
			tstr += "<tr><td colspan=2><a href=\"?p=" + p["s"][0]["id"] + "\">Permalink</a></td></tr>\n\n";
			break;
		default:
			// Error!
			console.log("Error in handleDisplay! " + p["q"]);
			break;
	}
	if (iflag && p["c"] != undefined && p["c"].length > 0)
	{
		tstr += "<tr><td colspan=2><p><b>Incidents</b></p>\n";
		for (let incident of p["c"])
		{
			tstr += "<p>" + timeCodeStr(incident["timeindex"]) + " - " + playerNameIdLink(incident["eventtext"]) + "</p>\n\n";
		}
		tstr += "</td></tr>\n\n";
	}
	if (iflag && p["n"] != undefined && p["n"].length > 0)
	{
		tstr += "<tr><td colspan=2><p><b>Narratives</b></p>\n";
		for (let nmention of p["n"])
		{
			tstr += "<p>" + nmention["date"] + " - " + mlink("reqN('v'," + nmention["narrativeid"] + ")", playerNameIdLink(nmention["title"])) + "</p>\n\n";
		}
		tstr += "</td></tr>\n\n";
	}
	tstr += "<table>\n";
	if (p["q"] != "s")
	{
		tstr = "<h4>" + mlink("reqDisplay('t=0')", "All Teams") + "</h4>\n\n" + tstr;
	}
	document.getElementById("id_result").innerHTML = tstr;
}

