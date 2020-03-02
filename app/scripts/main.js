

// Uncomment to enable Bootstrap tooltips
// https://getbootstrap.com/docs/4.0/components/tooltips/#example-enable-tooltips-everywhere
// $(function () { $('[data-toggle="tooltip"]').tooltip(); });

// Uncomment to enable Bootstrap popovers
// https://getbootstrap.com/docs/4.0/components/popovers/#example-enable-popovers-everywhere
// $(function () { $('[data-toggle="popover"]').popover(); });


// the datas
var higherEdData = {};
	higherEdData.allData = {};

// the user selections
var higherEdSelections = {};
	higherEdSelections.geography = "national", //national, state, school
	higherEdSelections.chartType = "single-year-bar", //single-year-bar, sectors-as-lines, race-ethnicities-as-lines
	higherEdSelections.year = "2017",
	higherEdSelections.programLength = "four",  //two, four
	higherEdSelections.race = "dif_hispa",
	higherEdSelections.sector = "For-Profit",
	higherEdSelections.selectedRaces,
	higherEdSelections.selectedSectors
	
var SECTOR_KEY = higherEdSelections.programLength === "four" ? "fourcat" : "twocat",
	SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength,
	NESTED_BY_SECTOR,
	NESTED_BY_RACE;

var colorArray = ["#F5CBDF","#EB99C2","#E46AA7","#E54096","#EC008B","#AF1F6B","#761548", "#351123"]

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


//the chart selections & their G's
var singleYearSVG = d3.select("#single-year-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var barChartG = singleYearSVG.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sectorLineSVG = d3.select("#multi-year-by-sector-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var sectorLineG = sectorLineSVG.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var raceEthnicityLineSVG = d3.select("#multi-year-by-race-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var raceEthnicityLineG = raceEthnicityLineSVG.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var parseTime = d3.timeParse("%Y"),
	timeFormat = d3.timeFormat("%Y"),
	formatTwoDecimals = d3.format(".2f")


var color = d3.scaleOrdinal() 
    .range(colorArray)

function drawBarChart(data){
	var keys = higherEdData.allData[SELECTED_DATASET].columns.slice(1);
	
	//make your data an array of objects
	data = data.map(function(sector){
		var obj = {}
		for (var i = 0; i < keys.length; i++){
			obj[keys[i]] = sector[keys[i]]
		}
		return obj
	})

	var color = d3.scaleOrdinal()
	    .range(colorArray);
	
	//scale used to place each sector
	var y0 = d3.scaleBand()
	    .domain(data.map(function(d){ return d[SECTOR_KEY] }) ) //returns lists of fourcats
	    .rangeRound([height - margin.bottom, margin.top])
	    .paddingInner(0.1)

	//scale used to place each race within sector
    var y1 = d3.scaleBand()
	    .domain(keys)
	    .rangeRound([y0.bandwidth(), 0])
	    .padding(0.05)

	//regular scale for bar length
    var x = d3.scaleLinear()
	    .domain([-35, 35]) //TODO d3.extent
	    .rangeRound([margin.left, width - margin.right])

	var xAxis = d3.axisBottom(x)

	barChartG.append("g")
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(xAxis)

	var sectorGroups = barChartG.selectAll("g.sector")
		.data(data, function(d){ return d[SECTOR_KEY] })
		.join("g")        
		  .attr("transform", function(d){ return "translate(0," + y0(d[SECTOR_KEY]) + ")" } ) 
		  .attr("class", function(d){ return d[SECTOR_KEY] })
		  .classed("sector", true)

	sectorGroups.exit().remove();

	var rects = sectorGroups.selectAll("rect")
		.data(function (d) { 
		    return keys.filter(function(key){ 
		    	return key !== SECTOR_KEY })
		    .map(function (key) {
	    		return {
			        key: key,
			        value: d[key]
			      };
		    })
		  })

	rects.enter().append("rect")
		.attr("y", function(d){ return y1(d.key) })
		.attr("height", y1.bandwidth())
		.attr("fill", function(d){ return color(d.key) })
		.attr("x", function(d){ return d.value > 0 ? x(0) : x(d.value) })
		.attr("width", function(d){ return d.value > 0 ? x(d.value) - x(0) : (x(0) - x(d.value)) })

	rects.transition().duration(800)
		.attr("x", function(d){ return d.value > 0 ? x(0) : x(d.value) })
		.attr("width", function(d){ return d.value > 0 ? x(d.value) - x(0) : (x(0) - x(d.value)) })

	rects.exit().remove();
}

//svg: #multi-year-by-race-container #multi-year-by-sector-container
function drawLineChart(data, topic, svg, g){

	var selected = {
		"race": higherEdSelections.race, //"dif_hispa", "dif_white".. etc
		"sector": "value" //bc this data object just has one sector at a time
	}
	//scales
	var x = d3.scaleTime()
		.range([margin.left, width - margin.right])
		.domain(d3.extent(NESTED_BY_SECTOR[0].values, function(d){ return parseTime(d.year) }))

	var y = d3.scaleLinear()
		.range([height - margin.bottom, margin.top])
		.domain([
			d3.min(data, function(d){return d3.min(d.values, function(d){ return +d[selected[topic]] }) }),
			d3.max(data, function(d){return d3.max(d.values, function(d){return +d[selected[topic]] }) })
		]);



	var line = d3.line()
		// .defined(function(d){ return !isNaN(d) })
		.x(function(d){ return x(parseTime(d.year)) })
		.y(function(d){ return y(d[selected[topic]]) })

	svg.append("g")
		.attr("class","x-axis")
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));
//axis will have to update
	svg.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + margin.left + ",0)")
		.call(d3.axisLeft(y))

	var path = g.selectAll("path")
		.data(data)
		.enter()
		.append("path")
		.attr("d", function(d){ return line(d.values)  })
		.attr("fill", "none")
		.attr("stroke", function(d,i){ return topic === "sector" ? color(d.values[i][SECTOR_KEY] ) : color(d.key) })
		.attr("data-cat", function(d){ return d.key })

}

function showChart(chartType){
	//have 2 divs for bar/line that slide in/out cleanly 
	//var contentWidth = (widthUnder(1085)) ? window.innerWidth + 20 : d3.select("#chartAreaContainer").node().getBoundingClientRect().width
	var contentWidth = 600 
		//single-year-bar, sectors-as-lines, race-ethnicities-as-lines

	var chartScootch = {
		"single-year-bar": 0,
		"race-ethnicities-as-lines": contentWidth * -1,
		"sectors-as-lines": contentWidth * -2
	}

	d3.select("#single-year-container").transition().style("margin-left", chartScootch[chartType] + "px")

}

function filterDataByYear(year){
	return higherEdData.allData[SELECTED_DATASET].filter(function(d){
				return d.year === year 
			});
}


function buildOptionPanel(chartType){

	var raceOptions = higherEdData.allData[SELECTED_DATASET].columns.slice(2),
		sectorOptions = []

		higherEdData.allData[SELECTED_DATASET].filter(function(d){ 
			return d.year === "2015" 
		}).forEach(function(d){ 
			sectorOptions.push(d[SECTOR_KEY]) 
		})

	// radio button template:

	function radioButtonTemplater(option){
		var text = 
		'<label for="' + option + '"><input type="radio" class=" " name="' + option + '" value="' + option + '" checked=""/><span>' + option + '</span></label>'
        return text
	}

	//radio button one always goes up top

	d3.select("#first-dynamic-menu").text("")
	d3.select("#second-dynamic-menu").text("")

	if (chartType === "single-year-bar"){
		//checkboxes for everything
		d3.select("#year-selector").style("display", "inline")

		d3.select("#first-dynamic-menu").text(raceOptions)
		d3.select("#second-dynamic-menu").text(sectorOptions)
	} else if (chartType === "sectors-as-lines"){
		//races as radio buttons, sectors as checkboxes
		d3.select("#year-selector").style("display", "none")

		d3.select("#first-dynamic-menu").selectAll("div.race-ethnicity-radios")
			.data(raceOptions)
			.enter()
			.append("div")
			.classed("race-ethnicity-radios", true)
			.html(function(d){ return radioButtonTemplater(d) })
			


		d3.select("#second-dynamic-menu").text(sectorOptions)
	} else {
		//races as radio buttons, sectors as checkboxes
		d3.select("#year-selector").style("display", "none")
		d3.select("#first-dynamic-menu").text(raceOptions)
		d3.select("#second-dynamic-menu").text(sectorOptions)
	}
}

function initializeControls(){

	d3.selectAll(".geography-choices").on("click", function(){
		higherEdSelections.geography = this.value;
	})

	//if view is 'state' add state dropdown menu
	//if view is 'school' add look up box for school name
	d3.selectAll(".time-selector").on("click", function(){
		d3.event.stopPropagation();
		var chart = this.getAttribute("value") //single-year-bar, sectors-as-lines, race-ethnicities-as-lines

		higherEdSelections.chartType = chart;
		d3.selectAll(".time-selector").classed("selected", false);
		d3.select(this).classed("selected", true);
		if (chart === "sectors-as-lines"){
			drawLineChart(NESTED_BY_SECTOR, "race", sectorLineSVG, sectorLineG)// data nested by sector or race; the selected radio ('topic'); svg
		} else {
			drawLineChart(NESTED_BY_RACE, "sector", raceEthnicityLineSVG, raceEthnicityLineG)
		}

		showChart(chart);

		buildOptionPanel(chart)
	})

	d3.selectAll(".race-ethnicity-radios").on("click", function(){
		//all sectors, one race at a time
		higherEdSelections.race = this.value;
		drawLineChart(NESTED_BY_SECTOR, higherEdSelections.race, sectorLineSVG);

	})

	//race-ethnicity-checkboxes
	//races

	//sector-radios: all races, one sector... nest by race

	//sector-checkboxes
	//this filter function will let you take out the deselected sectors
	// 	nest.filter(function(d){ return higherEdSelections.selectedSectors.indexOf(d.key) > -1 })
	// return nest;

	d3.select("#year-input").on("click", function(){
		var year = document.getElementById("year-box").value;
		higherEdSelections.year = year
		var data = filterDataByYear(year);
		drawBarChart(data)
	})	
}

function makeSectorNest(){
	var nest = d3.nest().key(function(d){
		return d[SECTOR_KEY]
	}).entries(higherEdData.allData[SELECTED_DATASET]);
	return nest;
}

function makeDemogNest(){
	var raceOptions = higherEdData.allData[SELECTED_DATASET].columns.slice(2)
	var nestedByDemog = []

	var filtered = higherEdData.allData[SELECTED_DATASET].filter(function(d){ 
						return d.fourcat === "For-Profit" 
					})

	for (var i = 0; i < raceOptions.length; i++){
		nestedByDemog.push({"key": raceOptions[i], "values": []})
		filtered.forEach(function(yearData){		
			var obj = {
				"year": yearData.year,
				"value": yearData[raceOptions[i]]
			}
			nestedByDemog[i].values.push(obj)
		})
	}
	return nestedByDemog;
}

function prepareData(){
	NESTED_BY_SECTOR = makeSectorNest();
	NESTED_BY_RACE = makeDemogNest();

	higherEdSelections.selectedSectors = NESTED_BY_SECTOR.map(function(d){ return d.key })
	higherEdSelections.selectedRaces = higherEdData.allData[SELECTED_DATASET].columns.slice(2)
	color.domain(NESTED_BY_SECTOR.map(function(d){return d.key})) //TODO - probably multiple color scales for the diff charts
}

function init(){
	prepareData()
	buildOptionPanel("single-year-bar");
	initializeControls();

	//draw your default chart, bars for 2017: all races/sectors 
	var data = filterDataByYear(higherEdSelections.year);
	drawBarChart(data)	
}

d3.csv("data/national-2yr.csv").then(function(nationaltwo){
	higherEdData.allData.nationaltwo = nationaltwo;
	d3.csv("data/national-4yr.csv").then(function(nationalfour){
		higherEdData.allData.nationalfour = nationalfour;
		d3.csv("data/school-2yr.csv").then(function(schooltwo){
			higherEdData.allData.schooltwo = schooltwo;
			d3.csv("data/school-4yr.csv").then(function(schoolfour){
				higherEdData.allData.schoolfour = schoolfour;
				d3.csv("data/state-2yr.csv").then(function(statetwo){
					higherEdData.allData.statetwo = statetwo;
					d3.csv("data/state-4yr.csv").then(function(statefour){
						higherEdData.allData.statefour = statefour;
						init();
					})
				})
			})
		})
	})
})


	