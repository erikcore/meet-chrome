if (localStorage.getItem("mu_api_key") === null) {

	document.body.innerHTML = "<div class='key_input'><div id='pageTop'><span class='pageTopGray'>Enter your <span class='pageTopRed'>Meetup</span> API key.</span></div><form id='key_form'><input type='text' id='api_key' name='apiKey' /><input type='button' id='key_button' value='Save' /></form><div id='pageBottom'><p class='api_key_link fine_print'><a href='#' id='get_api_link' >Click here to get your key.</a></p></div></div>";
	
	document.addEventListener('DOMContentLoaded', function () {
		document.getElementById('key_button').addEventListener('click', grabApiKey);
		document.getElementById('get_api_link').addEventListener('click', loadApiPage);
	});
}

else {

	var page_count = 0;
	requestMeetups();

}

function requestMeetups() {
		
	var urlString = "http://api.meetup.com/2/events/?" +
        			"key=" + localStorage.getItem("mu_api_key") + "&" +
        			"member_id=self&" +
					"rsvp=yes&" +
					"page=20&" +
					"offset=" + page_count;

	var mygetrequest=new XMLHttpRequest();
		mygetrequest.onreadystatechange=function(){
			if (mygetrequest.readyState==4){
				if (mygetrequest.status==200){
					showMeetups(mygetrequest);
				}
				else{
					alert("An error has occured making the request");
				}
			}
		}
	mygetrequest.open("GET", urlString, true)
	mygetrequest.send(null)
	
}

function grabApiKey() {
	var api_key = document.getElementById('key_form').elements['apiKey'].value;
	localStorage.setItem( "mu_api_key", api_key);
	window.location.reload();
}

function loadApiPage() {
	chrome.tabs.create({url: "http://www.meetup.com/meetup_api/key/"});
}

function removeApiKey() {
	localStorage.removeItem( "mu_api_key" );
	window.location.reload();
}

function eventTab(event_url) {
	chrome.tabs.create({url: event_url})
}

function showMeetups(req) {
	
	var meetups = JSON.parse(req.responseText);
	
	var response_count = 0;
	for (var meetup in meetups.results) response_count++;
	
	
	var a_p = "";	
	var d_names = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
	var m_names = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
	var m_names_abbr = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
	
	if (page_count === 0) {	
		document.getElementById('pageMeetups').innerHTML = '';
	}
	
	for (var i = 0, meetup; meetup = meetups.results[i]; i++) {
		
		var eventTime = new Date(meetup.time);

		var curr_hour = eventTime.getHours();
		
		if (curr_hour < 12) {
			a_p = "am";
		}
		else {
			a_p = "pm";
		}
		if (curr_hour == 0) {
			curr_hour = 12;
		}
		if (curr_hour > 12) {
			curr_hour = curr_hour - 12;
		}

		var curr_min = eventTime.getMinutes();

		curr_min = curr_min + "";

		if (curr_min.length == 1) {
			curr_min = "0" + curr_min;
		}
		var curr_day = eventTime.getDay();
		var curr_month = eventTime.getMonth();
		var curr_date = eventTime.getDate();

		document.getElementById('pageMeetups').innerHTML = 	document.getElementById('pageMeetups').innerHTML + 
			"<div class='meetup'>" +
				"<div class='calendar event_date'>" +
					"<span class='month'>" + 
						m_names_abbr[curr_month] + 
					"</span>" +
					"<span class='day'>" + 
						curr_date + 
					"</span>" + 
				"</div>" +
				"<div class='meetupBody'>" +
					"<p class='chapter_name'>" + meetup.group.name + "</p>" +
					"<p class='meetupTitle'><a href='" + meetup.event_url + "'>" + meetup.name + "</a></p>" +
					"<span class='event_time'>" + curr_hour + ":" + curr_min + a_p + "</span><span class='event_date'> " + d_names[curr_day] + ", " + m_names[curr_month] + " " + curr_date + "</span>" +
				"</div>" +				
				"<div class='clear'></div>" +
			"</div>";
	}

	if (page_count === 0) {	
		document.getElementById('remove_key_link').onclick = function(e) {
			removeApiKey();
		}
		document.getElementById('more_link').onclick = function(e) {
			requestMeetups();
			e.preventDefault();
		}
	}

	var eventLinks = document.getElementById('pageMeetups').getElementsByTagName('a');
	for (var i = 0; i < eventLinks.length; i++) {
		eventLinks[i].onclick = function(e) {
			eventTab(e.target.href);
		}
	}
	
	page_count++;
	
	if (response_count < 20) {
		document.getElementById('more_link').innerHTML = '';
	}
}
