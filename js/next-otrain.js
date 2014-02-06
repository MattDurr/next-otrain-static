var data;

//get times

$.get(
    "times.json",
    function(json) {
       data = JSON.parse(json);
    }
);

var station_names = ["BAYVIEW", "CARLING", "CARLETON", "CONFEDERATION", "GREENBORO"];
var station_id; //station id
var curr_station_name; //current station name
var direction = 0; //current direction (0 or 1)
var station_location; //current location
var dayofweek; //day of the week (0 to 6)
var day;
var loop;

var startTime = function() {
  setLocation(station_location);
  loop = setTimeout(startTime, 500);
};

function setDOW(now) {
  dayofweek = now;
  if(dayofweek === 0) day = 2; //sunday
  else if(dayofweek == 6) day = 1; //saturday
  else day = 0; // monday to friday
}

function setLocation(station_index) {
  $('.alert-info').removeClass('alert-info');
  $("#location" + station_index).addClass('alert-info');
  //change dow
  setDOW((new Date()).getDay());

  station_location = station_index;
  if(station_location === 0) {
    if(direction === 0) {
      toggleDirection();
    }
  }
  else if(station_location == 4) {
    if(direction == 1) {
      toggleDirection();
    }
  }
  if(data) {
    station_id = direction == 1 ? data[day][direction][station_location] : data[day][direction][4 - station_location];
    curr_station_name = station_names[station_location];
  }
  getNextTime();
}

function getNextTime() {
  if(!curr_station_name) curr_station_name = "Choose a station ";
  if(station_id) {
    var now = new Date();
    var current_hour = now.getHours();
    var current_minute = now.getMinutes();
    var current_second = now.getSeconds();

    var times = station_id;
    var len = times.length;
    var best_match;
    for(var j = 0; j < len; j++) {
      var arrival_time = times[j].split(':');
      var arrival_hour = parseInt(arrival_time[0], 10);
      var arrival_minute = parseInt(arrival_time[1], 10);
      best_match = arrival_time;
      if(arrival_hour > current_hour) break; //if the hour is later than the current hour
      //if the minute is later than the current minute in the current hour
      else if((arrival_hour == current_hour) && (arrival_minute > current_minute)) break;
    }
    if(((best_match[0] == current_hour) && (best_match[1] <= current_minute)) || (best_match[0] < current_hour)) {
      //end of day
      var day;
      if(dayofweek == 6) day = 2; //its saturday, next day is sunday (2)
      else if (dayofweek == 5) day = 1; //its friday, next day is sat (1)
      else day = 0; //its sunday thru thursday (0)

      if(direction == 1) { //first direction
        best_match = data[day][direction][station_location][0].split(':');
      }
      else { //second direction
        best_match = data[day][direction][4-station_location][0].split(':');
      }
    }
    document.getElementById('next').innerHTML = "Next "+"<i class='icon-time'></i>"+"Train on " + best_match.join(':');
    var time_difference = getTimeDifference(current_hour, current_minute, current_second, best_match[0], best_match[1], 0);
    document.getElementById('next').innerHTML += " in " + time_difference[0] + "h:" + time_difference[1] + "m:" + time_difference[2] + "s";
  }
}

function getTimeDifference(initial_hour, initial_minute, initial_second, final_hour, final_minute, final_second) {
  var hour_diff, minute_diff, second_diff;
  // setup: 00:00 becomes 24:00
  final_hour = final_hour === 0 ? 24 : final_hour;
  initial_hour = initial_hour === 0 ? 24 : initial_hour;
  // standard difference
  hour_diff = final_hour - initial_hour;
  minute_diff = final_minute - initial_minute;
  second_diff = final_second - initial_second;

  //adjust minute
  minute_diff = second_diff < 0 ? minute_diff - 1 : minute_diff;
  second_diff = final_minute - initial_minute - 1 == minute_diff ? 60 + second_diff : second_diff; //reset second

  //adjust hour
  hour_diff = minute_diff < 0 ? hour_diff - 1 : hour_diff;
  minute_diff = final_hour - initial_hour - 1 == hour_diff ? 60 + minute_diff : minute_diff;
  hour_diff = hour_diff < 0 ? 24 + hour_diff : hour_diff;
  return [hour_diff, minute_diff, second_diff];
}

function toggleDirection() {
  $('#hud').stop(true, true);
  var old_direction = direction;
  if(direction === 0) {
    direction = 1;
    $(".arrows").removeClass('icon-arrow-up').addClass('icon-arrow-down');
  }
  else {
    direction = 0;
    $(".arrows").removeClass('icon-arrow-down').addClass('icon-arrow-up');
  }
  setLocation(station_location);
  $("#hud").css('display', '');
  $("#hud").css('opacity', 1);
  $("#hud").fadeTo("slow", 0, function() {
      $("#hud").css('display', "none");
  });
  $("#location" + station_location).select();
  $('.stntimebtn').each(function(i, element) {
    var href = element.getAttribute('href');
    href = href.replace('&d=' + old_direction, '&d=' + direction);
    element.setAttribute('href', href);
  });
}
//adjust vertical positioning of hud and hide
document.getElementById('hud').style.top = document.getElementById('locationli2').offsetTop + 25 + "px";
$("#hud").css('display', 'none');

// When ready...
window.addEventListener("load", function() {
  //fb like button asyncronous load

  //google analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-39341257-3', 'ryanseys.com');
  ga('send', 'pageview');


  //uservoice feedback
  var uvOptions = {};
  (function() {
    var uv = document.createElement('script'); uv.type = 'text/javascript'; uv.async = true;
    uv.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'widget.uservoice.com/9XBoblHGevZr739GvY1dPQ.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(uv, s);
  })();
});

startTime();
