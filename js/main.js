var max_height = 500, min_height = 100;
var max_width = 200, min_width = 100;
var window_width = 15, window_height = 15, window_padding = 10;
var s = Snap("#cityscape");
var sj = $("#cityscape");

var svg_height = sj.outerHeight();
var svg_width = sj.outerWidth();

var buildings = s.g().attr({ id: "buildings" });
var building_masks = s.mask();

var light_source = { x: 0, y: 0, radius: 40, intensity: 1 };

function render_shadows() {
	s.selectAll(".shadow").remove();
	var mbuildings = s.selectAll(".building");

	$.each(mbuildings, function(index, building) {
		var building_height = parseInt(building.attr("height"));
		var building_width = parseInt(building.attr("width"));
		var building_x = parseInt(building.attr("x"));
		var building_y = parseInt(building.attr("y"));

		var angle, d, shadow_verticies = [];

		if (light_source.y < building_y) { // above building
			shadow_verticies.push(building_x, building_y, (building_x + building_width), building_y);
			angle = Math.atan((building_y - light_source.y) / ((building_x + building_width) - (light_source.x + light_source.radius)));
			d = building_height / Math.tan(angle);

			shadow_verticies.push(Math.max((building_x + building_width + d), building_x), svg_height);
			shadow_verticies.push(Math.min((building_x + building_width), (building_x + d)), building_y + building_height);
		} else { // below top of building
			if (((light_source.x - light_source.radius) > building_x) && ((light_source.x + light_source.radius) < (building_x + building_width)) || ((building_x + building_width) - (light_source.x + light_source.radius) == 0)) {
				shadow_verticies.push(building_x, building_y, (building_x + building_width), building_y,
									 (building_x + building_width), svg_height, building_x, svg_height);
			} else {
				if (light_source.x < (building_x + (building_width / 2))) { // left of the building
					d = (svg_width - (building_x + building_width)) * (light_source.y - building_y) / ((building_x + building_width) - (light_source.x + light_source.radius));

					shadow_verticies.push(building_x, building_y, svg_width, building_y - d, svg_width, svg_height);
					shadow_verticies.push(Math.min((building_x + building_width), building_x - ((light_source.x - light_source.radius) - building_x)), svg_height);
				} else {
					d = (building_x + building_width) * (light_source.y - building_y) / ((building_x + building_width) - (light_source.x + light_source.radius));	

					shadow_verticies.push((building_x + building_width), building_y, Math.max((building_x + building_width) - ((light_source.x + light_source.radius) - (building_x + building_width)), building_x), svg_height);
					shadow_verticies.push(0, svg_height, 0, building_y + d, (building_x + building_width), building_y);
				}
			}	
		}

		var shadow = s.polyline(shadow_verticies);
		shadow.attr({ class: "shadow", fill: "black", opacity: 0.2 });
		//mask: building_masks
	});
}

function render_buildings() {
	var x = 30;
	for (var mbuildings = 0; mbuildings < 10/*Math.round(Math.random() * 10)*/; mbuildings++) {
		var num_windows_across = Math.round(Math.max(3, Math.random() * 5)); 

		var building_height = Math.floor(Math.max(min_height, Math.random() * max_height));
		var building_width = num_windows_across * (window_width + window_padding) + window_padding;
		var building_x = x; x += (building_width + 30);//Math.max(0, ((Math.random() * svg_width) - building_width));
		var building_y = svg_height - building_height;

		building_masks.add(s.rect(building_x, building_y, building_width, building_height));
		var building = s.g(s.rect(building_x, building_y, building_width, building_height)
							.addClass("building")
							.attr({
								building_height: building_height,
								building_width: building_width,
								building_x: building_x,
								building_y: building_y
							}));
		

		if (!building) continue;
		var window_x, window_y = (building_y + window_padding);
		while (window_y < svg_height - (2 * window_height)) {
			window_x = (building_x + window_padding);
			while (window_x < (building_x + building_width)) {
				var window_lit = (Math.random() > 0.7);
				var window = s.rect(window_x, window_y, window_width, window_height)
				window.addClass("window " + (window_lit ? "window_lit" : "window_unlit"))
				building.add(window);
				window_x += (window_width + window_padding);
			}

			window_y += (window_height + window_padding);
		}

		buildings.add(building);
	}
}

function render_light_source(time) {
	var ls = s.select("#light_source");
	if (ls) ls.remove();

	if (time) {
		console.log(time,svg_width,svg_height);
		light_source.x = (time % svg_width) - 200;
		light_source.y = svg_height - (Math.sin((1 / (svg_width / 2)) * light_source.x) * svg_height) - 200;
		//$("#time").text("{0}:{1}".format(Math.round(time / 100), time % 100));
	}

	s.prepend(s.circle(light_source.x, light_source.y, light_source.radius, light_source.radius).attr({ id: "light_source", class: (time < (svg_width) ? "sun" : "moon") }));
	
	if (time > svg_width) $("body").css("background", "#2b2330");
	else { $("body").css("background", "cadetblue"); }
}

function render(buildings, time) {
	if (buildings) render_buildings();
	render_shadows();
	render_light_source(time);
}

/*$(document).mousemove(function () {
	light_source.x = event.pageX;
	light_source.y = event.pageY;
	render(false);
});*/

var time = 100;
render(true, time);

setInterval(function() {
	render(false, time);

	time = (time + 20) % (2 * svg_width);
}, 100);