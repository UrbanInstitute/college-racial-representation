

// Uncomment to enable Bootstrap tooltips
// https://getbootstrap.com/docs/4.0/components/tooltips/#example-enable-tooltips-everywhere
// $(function () { $('[data-toggle="tooltip"]').tooltip(); });

// Uncomment to enable Bootstrap popovers
// https://getbootstrap.com/docs/4.0/components/popovers/#example-enable-popovers-everywhere
// $(function () { $('[data-toggle="popover"]').popover(); });


//TODOs

//BUGS
//axis labels repeat a billion times and layer up
//the sector radios don't show up with one checked the second time through
//the legend is messed up
//the axis lines are on top of the data

//FEATURES
//make chart responsive
//clicking data highlights should do something
//add downloadable chart image
//make the URL update

//STYLING
//'cover' not doing what you'd think on cover image
//dropdown menus


//TEXT
//add axis titles

//THINGS TO CHECK
//I took out 'dif_othra' and kept in 'dif_twora' which became 'multiracial'. Correct?
//should there be alert text when you have zero selected races or sectors? just don't allow deselecting last one?





// the datas
var higherEdData = {};
	higherEdData.allData = {};

// the user selections
var higherEdSelections = {};
	higherEdSelections.geography = 'national', //national, state, school
	higherEdSelections.chartType = 'single-year-bar', //single-year-bar, by-sector-chart, by-race-chart, one-school-all-races-container, multiple-schools
	higherEdSelections.year = '2017',
	higherEdSelections.programLength = 'four',  //two, four
	higherEdSelections.singleRace = 'dif_hispa',
	higherEdSelections.singleSector = 'Public Nonselective',
	higherEdSelections.state = 'Alabama',
  	higherEdSelections.selectedSchool = 'Alabama A & M University',
	higherEdSelections.arrayRaces = [],
	higherEdSelections.arraySectors = []

var SECTOR_KEY = 'fourcat',
	SELECTED_DATASET = 'nationalfour',
	NESTED_BY_SECTOR,
	NESTED_BY_RACE,
	FILTERED_BY_YEAR,
	STATE_DATA,
  	SCHOOL_NAMES,
  	RACE_OPTIONS;

function convertSelectors(numberString){
	SECTOR_KEY = numberString + 'cat'
	higherEdSelections.programLength = numberString

	if (higherEdSelections.geography === 'state'){
		SELECTED_DATASET = 'filteredForState'
	} else if (higherEdSelections.geography === 'school' ){
		SELECTED_DATASET = 'schoolfour'
	} else {
		SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength
	}
}

var optionsPanelTotalWidth = parseInt(d3.select("#options-panel").style("width")) + parseInt(d3.select("#options-panel").style("margin-right")),
	pageContainerWidth = parseInt(d3.select(".page-container").style("width")),
	chartHole = pageContainerWidth - optionsPanelTotalWidth

d3.selectAll(".chart-div, #chart-area-container").style("width", chartHole + 'px')
//svg, .chart-div, #chart-area-container all need to be same width

var margin = {top: 15, right: 20, bottom: 30, left: 40},
    barMargin = {top: 10, right: 10, bottom: 30, left: 0},
    width = chartHole - margin.left - margin.right,
    aspectRatio = 0.9,
    height = (chartHole * aspectRatio) - margin.top - margin.bottom;

var xLine, xBar,
	y = d3.scaleLinear()
		.range([height - margin.bottom, margin.top]);


//******The chart selections & their G's
//bar chart
var singleYearSVG = d3.select('#first-chart-container').append('svg')
    .attr('width', width + barMargin.left + barMargin.right)
var barChartG = singleYearSVG.append('g')
    .attr('transform', 'translate(' + barMargin.left + ',' + barMargin.top + ')');
var barLegend = d3.select('#first-chart-container > div.legend').append('ul')
  .attr('class', 'key')

// races are radios
var bySectorSVG = d3.select('#second-chart-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var bySectorLegend = d3.select('#second-chart-container > div.legend').append('ul')
  .attr('class', 'key')
var bySectorYAxis = bySectorSVG.append('g')
  .attr('class', 'grid')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
var bySectorG = bySectorSVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// sectors are radios
var byRaceSVG = d3.select('#third-chart-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var byRaceLegend = d3.select('#third-chart-container > div.legend').append('ul')
  .attr('class', 'key')
var byRaceAxis = byRaceSVG.append('g')
  .attr('class', 'grid')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
var byRaceG = byRaceSVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//div shared by single school & school comparison (everything under 'college' tab)
var oneSchoolSVG = d3.select('#fourth-chart-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var oneSchoolLegend = d3.select('#fourth-chart-container > div.legend').append('ul')
  .attr('class', 'key')
var oneSchoolYAxis = oneSchoolSVG.append('g')
  .attr('class', 'grid')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
var oneSchoolG = oneSchoolSVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//http://eyeseast.github.io/visible-data/2013/08/26/responsive-d3/
// d3.select(window).on("resize", resize);

var storedWidth = document.body.clientWidth;

function resize(){
  //can't rely on mobile resize events, they fire too much
  //https://stackoverflow.com/questions/17328742/mobile-chrome-fires-resize-event-on-scroll
  if (storedWidth !== document.body.clientWidth){
    console.log("diff")

    storedWidth = window.innerWidth;

    optionsPanelTotalWidth = parseInt(d3.select("#options-panel").style("width")) + parseInt(d3.select("#options-panel").style("margin-right"))
    pageContainerWidth = parseInt(d3.select(".page-container").style("width"))
    chartHole = pageContainerWidth - optionsPanelTotalWidth - margin.left - margin.right

    var width = chartHole,
      height = (chartHole * aspectRatio) - margin.top - margin.bottom

    //resize the containers
    d3.selectAll('#first-chart-container, #third-chart-container, #second-chart-container, #fourth-chart-container')
        .style('width', width + 'px')

    d3.selectAll(".chart-div, #chart-area-container").style("width", width + 'px')

    singleYearSVG
        .attr("width", width)
        .attr("height", height);
    byRaceSVG
        .attr("width", width)
        .attr("height", height);

    bySectorSVG
        .attr("width", width)
        .attr("height", height);

    oneSchoolSVG
        .attr("width", width)
        .attr("height", height);

    //update the scales
    xLine.range([margin.left, width - margin.right])
    xBar.rangeRound([barMargin.left, width - barMargin.right])

    var topicDependentKey = {
		'by-race-chart': 'value', //"dif_hispa", "dif_white".. etc
		'by-sector-chart': higherEdSelections.singleRace, //bc this data object just has one sector at a time
		'multiple-schools': higherEdSelections.singleRace,
		'one-school-all-races-container': higherEdSelections.singleRace
	}

    var line = d3.line()
  		.x(function(d){ return xLine(parseTime(d.year)) })
  		.y(function(d){ return y(+d[topicDependentKey]) })

    //here you would somehow resize the stuff on the chart: lines, bars, axis lines
    d3.selectAll('rect')
      .attr('x', function(d){ return +d.value > 0 ? xBar(0) : xBar(d.value) })
      .attr('fill', function(d){ return raceColorObj[d.key] })
      .attr('width', function(d){ return +d.value > 0 ? xBar(d.value) - xBar(0) : (xBar(0) - xBar(d.value)) })

    d3.selectAll('path.data-line')
    	.attr('d', function(d){ return line(d.values)  })

    d3.selectAll('g.tick > line')
      .attr('x2', chartHole - margin.left)

    showChart(higherEdSelections.chartType);

  }
}

var parseTime = d3.timeParse('%Y'),
  timeFormat = d3.timeFormat('%Y'),
  formatTwoDecimals = d3.format('.2f')

var translate = {
	 'for-profit': 'For-Profit',
	 'private-highly-selective': 'Private More Selective',
	 'private-nonselective': 'Private Nonselective',
	 'private-selective': 'Private Selective',
	 'public-highly-selective': 'Public More Selective',
	 'public-nonselective': 'Public Nonselective',
	 'public-selective': 'Public Selective',
	 'two-year-public': 'Public 2-year',
	 'two-year-private': 'For-Profit 2-year'
}

var translateRace = {
	'dif_white': 'White',
	'dif_hispa': 'Hispanic',
	'dif_black': 'Black',
	'dif_asian': 'Asian',
	'dif_amind': 'American Indian',
	'dif_pacis': 'Pacific Islander',
	'dif_twora': 'Multiracial'
}

var MIN_YEAR = 2009,
    MAX_YEAR = 2017;

var raceColorObj = {
  'dif_white': '#0a4c6a',
  'dif_hispa': '#9d9d9d',
  'dif_black': '#1696d2',
  'dif_asian': '#55b748',
  'dif_amind': '#ec008b',
  'dif_pacis': '#000000',
  'dif_othra': '#fdbf11',
  'dif_twora': '#fdbf11'
}

var sectorColorObj = {
  'for-profit': '#fdbf11',
  'private-more-selective': '#98cf90',
  'private-nonselective': '#55b748',
  'private-selective': '#2c5c2d',
  'public-more-selective': '#73bfe2',
  'public-nonselective': '#1696d2',
  'public-selective': '#0a4c6a',
  'public-2-year': '#1696d2',
  'for-profit-2-year': '#fdbf11'
}

var distinct = function(value, index, self){ return self.indexOf(value) === index; }

// radio button template:
// <div>
//   <label class="n-radio-label">
//     <input type="radio" class="sector-radios n-radio " id="public-nonselective" name="sector-radios" value="public-nonselective" >
//     <span>>Nonselective</span>
//   </label>
// </div>
function radioButtonTemplater(option){
var html =
'<div><label class="n-radio-label"><input type="radio" class="n-radio " name="' + higherEdSelections.chartType + '" value="' + option + '" /><span>' + translateRace[option] + '</span></label></div>'
    return html
}
// checkbox template
function checkboxTemplater(option){
var html =
'<div class="c-cb"><input type="checkbox" class=" " name="' + higherEdSelections.chartType + '" value="' + option + '" checked/><label for="' + option + '">' + translateRace[option] + '</label></div>'
    return html
}

function widthUnder(w){
  return d3.select('.widthTester.w' + w).style('display') == 'block'
}

function getBarW(){
	if(widthUnder(768)){
		return window.innerWidth - 40;;
	}
	else if(widthUnder(1085)){
		return window.innerWidth - 40;
	}
	else {
		return 1085;
	}
}

function showChart(chartType){
	//have 2 divs for bar/line that slide in/out cleanly
	//var contentWidth = (widthUnder(1085)) ? window.innerWidth + 20 : d3.select("#chartAreaContainer").node().getBoundingClientRect().width


	var chartScootch = {
		'single-year-bar': 0,
		'by-race-chart': chartHole  * -1,
		'by-sector-chart': chartHole * -2,
    	'one-school-all-races-container': chartHole * -3,
    	'multiple-schools': chartHole * -4
	}
	d3.select('#first-chart-container').transition().style('margin-left', chartScootch[chartType] + 'px')
}

function drawBarChart(data){
	var keys = higherEdSelections.arrayRaces.slice() //higherEdData.allData[SELECTED_DATASET].columns.slice(1);

	keys.push(SECTOR_KEY);
	//make your data an array of objects
	data = data.map(function(sector){
		var obj = {}
		for (var i = 0; i < keys.length; i++){
			obj[keys[i]] = sector[keys[i]]
		}
		return obj
	})


  var barChartHeight = height;
  singleYearSVG.attr('height', barChartHeight + barMargin.top + barMargin.bottom)
  var numSectors = 7,
  heightOfOneSector = barChartHeight / numSectors,
  numCurrentSectors = data.length,
  barChartHeight = barChartHeight - (heightOfOneSector * (numSectors - numCurrentSectors))


	//scale used to place each sector
	var y0 = d3.scaleBand()
	    .domain(data.map(function(d){ return d[SECTOR_KEY] }) ) //returns lists of sectors
	    .rangeRound([barChartHeight - barMargin.bottom, barMargin.top])
	    .paddingInner(0.3)

	//scale used to place each race within sector
    var y1 = d3.scaleBand()
	    .domain(higherEdSelections.arrayRaces)
	    .rangeRound([y0.bandwidth(), 0])
	    .padding(0.2)

  // I am not sure the scale should update, makes it harder to compare
	// var min = 0, max = 0;
	// for (var i = 0; i < data.length; i++){
	// 	for (var j = 0; j < higherEdSelections.arrayRaces.length; j++){
	// 		if ( +data[i][higherEdSelections.arrayRaces[j]] < min ){
	// 			min = +data[i][higherEdSelections.arrayRaces[j]]
	// 		} else if ( +data[i][higherEdSelections.arrayRaces[j]] > max ){
	// 			max = +data[i][higherEdSelections.arrayRaces[j]]
	// 		}
	// 	}
	// }

	//regular scale for bar length
  xBar = d3.scaleLinear()
	    .domain([-30,30])
	    .rangeRound([barMargin.left, width - barMargin.right])

	var sectorGroups = barChartG.selectAll('g.sector')
		.data(data, function(d){ return d[SECTOR_KEY] })
		.join('g')
		  .attr('transform', function(d){ return 'translate(0,' + y0(d[SECTOR_KEY]) + ')' } )
		  .attr('class', function(d){ if (d[SECTOR_KEY] === 'Public Nonselective') { return 'Public Nonselective'}
		  	else if (d[SECTOR_KEY] === 'Private Nonselective'){ return 'Private Nonselective'} else {
		  		return d[SECTOR_KEY]
		  	} })
		  .classed('sector', true)

	d3.selectAll('.sector-label').remove(); //shrug emoji?

	var sectorLabels = sectorGroups.append('text')
			.classed('sector-label', true)
			.text(function(d){ return d[SECTOR_KEY] })
			.attr('x', xBar(0))//barMargin.left)
      .attr('y', 0)//-10)
      .style('text-transform', 'uppercase')

	sectorGroups.exit().remove();

//TODO add a g here and add the bar value
//went back to no g for now so I can see if adding/removing bars is broken
	var rects = sectorGroups.selectAll('rect')
		.data(function (d) {
		    return keys.filter(function(key){
		    	return key !== SECTOR_KEY })
		    .map(function (key) {
	    		return {
			        key: key,
			        value: +d[key]
			      };
		    })
		  }, function(d){ return d.key })

  rects.enter().append('rect')
    .attr('y', function(d){ return y1(d.key) })
    .attr('x', function(d){ return +d.value > 0 ? xBar(0) : xBar(d.value) })
    .attr('fill', function(d){ return raceColorObj[d.key] })
  	.attr('height', y1.bandwidth())
  	.attr('width', function(d){ return +d.value > 0 ? xBar(d.value) - xBar(0) : (xBar(0) - xBar(d.value)) })

	rects.transition().duration(800)
		.attr('x', function(d){ return d.value > 0 ? xBar(0) : xBar(d.value) })
		.attr('width', function(d){ return d.value > 0 ? xBar(d.value) - xBar(0) : (xBar(0) - xBar(d.value)) })

		.attr('height', y1.bandwidth())

	rects.exit().remove()


  // d3.selectAll('.bar-labels').remove();
  // var barLabels = barG.append('text')
  //   .classed('bar-labels', true)
  //   .text(function(d){ return formatTwoDecimals(d.value) + '%' })
  //   .attr('x', function(d){ return  +d.value > 0 ? x(d.value) + 3 : x(d.value - 5 )})
  //   .attr('y', 10)

	var keys = barLegend.selectAll('li')
		.data(higherEdSelections.arrayRaces)
		.enter()
		.append('li')
		.attr('class', function(d){ return d })
		.classed('key-item', true)
		.classed('race', true)
		.style('border-left', function(d){ return '17px solid ' + raceColorObj[d] })
		.text(function(d){ return translateRace[d] })

}

//svg & g: byRaceSVG, byRaceG, bySectorSVG, bySectorSVG; axis: bySectorYAxis, byRaceAxis;
function drawLineChart(data, topic, svg, g, axisSelection){

	var yAxisText = 'Representation relative to market of potential students',
		xAxisText = 'Year'

	var selected = {
		'race': higherEdSelections.singleRace, //"dif_hispa", "dif_white".. etc
		'sector': 'value', //bc this data object just has one sector at a time
		'comparison': higherEdSelections.singleRace
	}
	if (higherEdSelections.chartType === 'multiple-schools'){
		var div = d3.select("body").append("div")
		    .attr("class", "tooltip")
		    .style("opacity", 0);
	}
	//scales
	xLine = d3.scaleTime()
		.range([margin.left, width - margin.right])
		.domain([parseTime(MIN_YEAR), parseTime(MAX_YEAR)])

	var domainInflater = 1.3

	var min = d3.min(data, function(d){return d3.min(d.values, function(d){ return +d[selected[topic]] }) })
		min = min < -4 ? min * domainInflater : -4 ;
	var max = d3.max(data, function(d){return d3.max(d.values, function(d){return +d[selected[topic]] }) })
		max = max < 5 ? 5 : max * domainInflater ;

	y.domain([min, max]);

  d3.select(".y-axis-label").remove();
  svg.append('text')
    .text(yAxisText)
    .attr('y', y(max))
    .attr('class', 'y-axis-label')
//was trying to get last item in svg.selectAll('.grid > .tick'), if that's a thing to set the y for the axis label
	var line = d3.line()
		.x(function(d){ return xLine(parseTime(d.year)) })
		.y(function(d){ return y(+d[selected[topic]]) })
		// .defined(function(d){ return !isNaN(d) })

	d3.select(".x-axis").remove();
	svg.append('g')
		.attr('class','x-axis')
		.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top - margin.bottom) + ')')
		.call(d3.axisBottom(xLine).tickFormat(d3.timeFormat('%Y')));

	var yAxis = d3.axisLeft(y)
		.tickSize(-width)
		.tickFormat(function(d){ return d + '%'});

	axisSelection.call(yAxis);

	svg.selectAll('g.tick > line')
		.style('stroke', function(d,i){
			if (d === 0){
				return '#848081'
			} else {
				return '#D2D2D2'
			}
		})
		.style('stroke-width', function(d){
			if(d === 0){
				return 2
			} else {
				return 1
			}
		})

	var path = g.selectAll('path')
		.data(data, function(d){ return d.key })

	path.enter()
		.append('path')
		.attr('fill', 'none')
		.attr('d', function(d){ return line(d.values)  })
		.attr('stroke', function(d,i){
	      if (topic === 'race'){
	        return sectorColorObj[classify(d.key)]
	      } else if (topic === 'sector'){
			return raceColorObj[d.key]
			}
	      })
		.attr('stroke-width', 2)
		.attr('class', function(d,i){
			var string = 'data-line ';
			if (topic==='comparison'){
		        if (d.key === higherEdSelections.selectedSchool){
			         string += 'highlight-school '
			        } else {
	              string += 'other-school '
	            }
		     }
		   if (topic === 'sector'){
	        string += d.key
	      } else if (topic === 'race'){
				 string += classify(d.values[i][SECTOR_KEY])
	      }
				return string;
		})
		.attr('data-cat', function(d){ return classify(d.key) })

	path.transition()
		.attr('d', function(d){ return line(d.values)  })
		.attr('stroke-width', 2)
		.attr('stroke', function(d,i){
	      if (topic === 'race'){
	        return sectorColorObj[classify(d.key)]
	      } else if (topic === 'sector'){
			return raceColorObj[d.key]
			}
	      })
		//.attr('data-cat', function(d){ return d.key })

	path.exit().remove();

	if (topic === 'sector'){
		var keys = bySectorLegend.selectAll('li')
			.data(higherEdSelections.arrayRaces)
			.enter()
			.append('li')
			.attr('class', function(d){ return d })
			.attr('data-cat', function(d){ return d })
			.classed('key-item', true)
			.classed('race', true)
			.style('border-left', function(d){ return '17px solid ' + raceColorObj[d] })
			.text(function(d){ return translateRace[d] })
	}

	if (topic === 'race') {
		var keys = byRaceLegend.selectAll('li')
			.data(data.map(function(d){return d.key})) //list of sectors
			.enter()
			.append('li')
			.attr('class', function(d){ return classify(d) })
			.attr('data-cat', function(d){ return classify(d) })
			.classed('key-item', true)
			.classed('race', true)
			.style('border-left', function(d){ return '17px solid' + sectorColorObj[classify(d)] })
			.text(function(d){ return d })
	}

  if (higherEdSelections.chartType === 'one-school-all-races-container') {
    oneSchoolLegend.selectAll('li').remove();
    var keys = oneSchoolLegend.selectAll('li')
      .data(higherEdSelections.arrayRaces)
      .enter()
      .append('li')
      .attr('class', function(d){ return d })
      .classed('key-item', true)
      .classed('race', true)
      .style('border-left', function(d){ return '17px solid ' + raceColorObj[d] })
      .text(function(d){ return translateRace[d] })
  }

  if (higherEdSelections.chartType === 'multiple-schools'){
    oneSchoolLegend.selectAll('li').remove();
    var schoolComparisonColors = ['#D2D2D2', '#1696D2']
    var keys = oneSchoolLegend.selectAll('li')
      .data(['Selected school', 'Other school'])
      .enter()
      .append('li')
      .attr('class', function(d){ return d })
      .classed('key-item', true)
      .classed('race', true)
      .style('border-left', function(d,i){ return '17px solid ' + schoolComparisonColors[i] })
      .text(function(d){ return d })

    d3.selectAll(".data-line").on("mouseover", function(d){
    	div.style("opacity", .9);
        div.html(d.key)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        d3.select(this).attr("stroke-width", 4)
        }).on("mouseout", function(d) {
        	div.style("opacity", 0);
        	d3.select(this).attr("stroke-width", 2)
        });

  }

	d3.selectAll('.key-item').on('mouseover', function(){
		var category = this.getAttribute('data-cat');
		d3.selectAll('.data-line')
			.style('opacity', 0.5)
			.attr('stroke-width', 1)
		d3.selectAll('.' + category)
			.style('opacity', 1)
			.attr('stroke-width', 4)
	})

	d3.selectAll('.key-item').on('mouseout', function(){
		d3.selectAll('.data-line')
			.style('opacity', 1)
			.attr('stroke-width', 2)
	})
}

function buildOptionPanel(chartType){

		var sectorOptions = []

		higherEdData.allData[SELECTED_DATASET].filter(function(d){
			return d.year === '2015'
		}).forEach(function(d){
			sectorOptions.push(d[SECTOR_KEY])
		})

	//empty these
	d3.select('#first-dynamic-menu').text('')
	d3.select('#second-dynamic-menu').text('')
  	d3.select('#comparison-menu').text('')

	if (chartType === 'single-year-bar'){
		//checkboxes for everything
		d3.select('#first-dynamic-menu').html(COLLEGE_SECTOR_CHECKBOXES)//controls initialized further down for this one

		d3.select('#second-dynamic-menu').append('p').attr('class', 'options-panel-section').text('Race/Ethnicity')
		d3.select('#second-dynamic-menu').selectAll('div.race-ethnicity-checkboxes')
			.data(RACE_OPTIONS)
			.enter()
			.append('div')
			.classed('race-ethnicity-checkboxes', true)
			.classed('checked', true)
			.html(function(d){ return checkboxTemplater(d) })

		d3.selectAll('.race-ethnicity-checkboxes > div > input')
			.property('checked', function(d){ return higherEdSelections.arrayRaces.indexOf(this.value) > -1 });

		d3.selectAll('.sector-boxes')
			.property('checked', function(d){ return higherEdSelections.arraySectors.indexOf(translate[this.value]) > -1 });

	} else if (chartType === 'by-sector-chart'){
		//races as radio buttons, sectors as checkboxes
		d3.select('#first-dynamic-menu').append('p').attr('class', 'options-panel-section').text('Race/Ethnicity')
		d3.select('#first-dynamic-menu').selectAll('div.race-ethnicity-radios')
			.data(RACE_OPTIONS)
			.enter()
			.append('div')
			.classed('race-ethnicity-radios', true)
			//.classed("checked", function(d){ return d === higherEdSelections.singleRace })// this becomes a function using singleRace
			.html(function(d){ return radioButtonTemplater(d) })

		d3.select('#second-dynamic-menu').html(COLLEGE_SECTOR_CHECKBOXES)

		d3.select('input[value=' + higherEdSelections.singleRace + ']').property('checked', true)

		d3.selectAll('.sector-boxes')
			.property('checked', function(d){ return higherEdSelections.arraySectors.indexOf(translate[this.value]) > -1 });

	} else if (chartType === 'by-race-chart'){
		//sectors as radio buttons, races as checkboxes
		d3.select('#first-dynamic-menu').html(COLLEGE_SECTOR_RADIOS)

		d3.select('#second-dynamic-menu').append('p').attr('class', 'options-panel-section').text('Race/Ethnicity')
		d3.select('#second-dynamic-menu').selectAll('div.race-ethnicity-checkboxes')
			.data(RACE_OPTIONS)
			.enter()
			.append('div')
			.classed('race-ethnicity-checkboxes', true)
			.classed('checked', function(d){ return higherEdSelections.arrayRaces.indexOf(d) > -1 })
			.html(function(d){ return checkboxTemplater(d) })

		var translateBack = {
			 'For-Profit': 'for-profit',
			 'Private More Selective': 'private-highly-selective',
			 'Private Nonselective': 'private-nonselective',
			 'Private Selective': 'private-selective',
			 'Public More Selective': 'public-highly-selective',
			 'Public Nonselective': 'public-nonselective',
			 'Public Selective': 'public-selective'
		}

		d3.select('input[value=' + translateBack[higherEdSelections.singleSector] + ']').property('checked', true)

		d3.selectAll('.race-ethnicity-checkboxes > div > input')
			.property('checked', function(d){ return higherEdSelections.arrayRaces.indexOf(this.value) > -1 });
	} else if (chartType === 'one-school-all-races-container'){
      d3.select('#time-selection').style('display', 'none');
      d3.select('#dropdown').style('display', 'none');
      d3.select('#school-selection').style('display', 'block');

      d3.select('#first-dynamic-menu').style('display', 'none')
      d3.select('#second-dynamic-menu').style('display', 'none')

      //school chart gets checkboxes for race, comparison chart gets radio for sectors
      d3.select('#comparison-menu').html('<p class="options-panel-section">Race/Ethnicity</p>')
      d3.select('#comparison-menu').selectAll('div.race-ethnicity-checkboxes')
        .data(RACE_OPTIONS)
        .enter()
        .append('div')
        .classed('race-ethnicity-checkboxes', true)
        .classed('checked', true)
        .html(function(d){ return checkboxTemplater(d) })
  } else if (chartType === 'multiple-schools'){

      d3.select('#comparison-menu').html('<p class="options-panel-section">Race/Ethnicity</p>')
      d3.select('#comparison-menu').selectAll('div.race-ethnicity-radios')
       .data(RACE_OPTIONS)
       .enter()
       .append('div')
       .classed('race-ethnicity-radios', true)
       //.classed("checked", function(d){ return d === higherEdSelections.singleRace })// this becomes a function using singleRace
       .html(function(d){ return radioButtonTemplater(d) })

      d3.select('input[value=' + higherEdSelections.singleRace + ']').property('checked', true);
  }

  if (higherEdSelections.programLength === 'four'){
      d3.selectAll('.two-year').classed('checked', false)
      d3.selectAll('.two-year.sector-boxes').property('checked', false)

      d3.selectAll('.two-year').classed('inactive', true);
      d3.selectAll('.four-year, .program-type').classed('inactive', false);
  } else {
          d3.selectAll('.four-year').classed('checked', false);
      d3.selectAll('.four-year.sector-boxes').property('checked', false);

      d3.selectAll('.two-year').classed('inactive', false);
      d3.selectAll('.four-year, .program-type').classed('inactive', true);
  }
	//event listener after party:

	//sector boxes - updates arraySector
	d3.selectAll('.sector-boxes').on('click', function(){

		var userChoice = this.value;
		var checkbox = d3.select(this);
		//var checkboxChecked = checkbox.classed('checked');
		var selectionIndex = higherEdSelections.arraySectors.indexOf(translate[userChoice]);

			//switching from 4 year to 2
		if (checkbox.classed('two-year') && higherEdSelections.programLength === 'four'){
			//switch over all the checked's and reset the arraySectors to just be the new userchoice
			convertSelectors('two')
			higherEdSelections.arraySectors = [translate[userChoice]] //array starts fresh with current selection

			d3.selectAll('.four-year').classed('checked', false);
			d3.selectAll('.four-year.sector-boxes').property('checked', false);

			d3.selectAll('.two-year').classed('inactive', false);
			d3.selectAll('.four-year, .program-type').classed('inactive', true);
    	//staying within 2 year
		} else if (checkbox.classed('two-year') && higherEdSelections.programLength === 'two'){
			//remove or add userchoice from the array
			if (selectionIndex > -1){
				higherEdSelections.arraySectors.splice(selectionIndex, 1)
			} else {
				higherEdSelections.arraySectors.push(translate[userChoice])
			}
    	// switch from 2 to 4
		} else if (checkbox.classed('four-year') && higherEdSelections.programLength === 'two'){
			convertSelectors('four')
			higherEdSelections.arraySectors = [translate[userChoice]]
			d3.selectAll('.two-year').classed('checked', false)
			d3.selectAll('.two-year.sector-boxes').property('checked', false)

			d3.selectAll('.two-year').classed('inactive', true);
			d3.selectAll('.four-year, .program-type').classed('inactive', false);
    	// staying within 4
		} else if (checkbox.classed('four-year') && higherEdSelections.programLength === 'four'){
			if (selectionIndex > -1){
				higherEdSelections.arraySectors.splice(selectionIndex, 1)
			} else {
				higherEdSelections.arraySectors.push(translate[userChoice])
			}
		}

		checkbox.classed('checked', !checkbox.classed('checked'));
		//if the box is being unchecked and the selections array is empty
		if (selectionIndex > 0 && higherEdSelections.arraySectors.length < 1){
			//alert('Please pick at least one sector')
	      var choiceString = higherEdSelections.programLength === 'four' ? translate[userChoice] : twoYearTranslate[userChoice]
	      higherEdSelections.arraySectors.push(choiceString)
	      //TODO - why this not worky
	      d3.select('.sector-boxes > div > input[value=' + userChoice + ']').property('checked', true)
		} else {
			NESTED_BY_SECTOR = makeSectorNest();
			NESTED_BY_SECTOR = NESTED_BY_SECTOR.filter(function(d){ return higherEdSelections.arraySectors.indexOf(d.key) > -1 })
			drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis);
		}
		callBarChart(higherEdSelections.year);

	})//end sector boxes

	//sector radios - updates singleSector
	d3.selectAll('.sector-radios').on('click', function(){
		higherEdSelections.singleSector = translate[this.value];
		d3.select('#second-chart-container > h4 > span').text(higherEdSelections.singleSector);
		if (d3.select(this).classed("two-year")){
			convertSelectors('two')
		} else {
			convertSelectors('four')
		}

		NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
		NESTED_BY_RACE = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
		drawLineChart(NESTED_BY_RACE, 'sector', bySectorSVG, bySectorG, bySectorYAxis);
	})

	//race boxes - updates arrayRaces
	d3.selectAll('.race-ethnicity-checkboxes').on('click', function(){

		var checkbox = d3.select(this)
		var userChoice = checkbox.datum()

		if (checkbox.classed('checked')){
			higherEdSelections.arrayRaces = higherEdSelections.arrayRaces.filter(function(d){
				return d !== userChoice
			})
			//change the property of the input
			d3.select('.race-ethnicity-checkboxes > div > input[value=' + userChoice + ']').property('checked', false)
		} else {
			higherEdSelections.arrayRaces.push(userChoice)
			//change the property of the input
			d3.select('.race-ethnicity-checkboxes > div > input[value=' + userChoice + ']').property('checked', true)
		}

		checkbox.classed('checked', !checkbox.classed('checked'));

		//bar chart function refers to arrayRaces so don't filter here
		drawBarChart(FILTERED_BY_YEAR)

		if (higherEdSelections.arrayRaces.length < 1){
			//alert('Please pick one or more races or ethnicities')
		} else {
			NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
			NESTED_BY_RACE = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
		}

		if (chartType === 'one-school-all-races-container'){
	      var schoolDataByRace = makeDemogNest(higherEdSelections.selectedSchool, true).filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
	      drawLineChart(schoolDataByRace, 'sector', oneSchoolSVG, oneSchoolG, oneSchoolYAxis)
	    } else if (chartType === 'by-race-chart'){
	      drawLineChart(NESTED_BY_RACE, 'sector', bySectorSVG, bySectorG, bySectorYAxis);
	    } else if (chartType === 'by-sector-chart'){
	      drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis);
	    }

	})

	//race radios - updates singleRace
	d3.selectAll('.race-ethnicity-radios').on('click', function(){

		var userChoice = d3.select(this).datum();
		higherEdSelections.singleRace = userChoice;
    if (chartType === 'by-sector-chart'){
  		d3.select('#third-chart-container > h4 > span').text(translateRace[userChoice]);
  		d3.select('input[value=' + userChoice + ']').property('checked', true)
  		drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis);
    } else if (chartType === 'multiple-schools'){
      callComparisonChart();
    }
	})
}

d3.select('#school-comparison').on('click', function(d){
  //toggle the chart type
  if (higherEdSelections.chartType === 'one-school-all-races-container'){
    higherEdSelections.chartType = 'multiple-schools';
    callComparisonChart();
  } else {
    higherEdSelections.chartType = 'one-school-all-races-container';
    callSchoolChart();
  }

  buildOptionPanel(higherEdSelections.chartType);
})

function callBarChart(year){
  FILTERED_BY_YEAR = filterDataByYear(year).filter(function(d){
    return higherEdSelections.arraySectors.indexOf(d[SECTOR_KEY]) > -1
  })
  drawBarChart(FILTERED_BY_YEAR)
}

function callComparisonChart(){
	  	//filter school data to that sector && state
	var comparisons = higherEdData.allData.schoolfour.filter(function(d){
		return d.fourcat === higherEdSelections.singleSector && d.fips_ipeds === higherEdSelections.state
	})
	//put race radios on dynamic menu one
	var nestedBySchool = d3.nest().key(function(d){ return d.inst_name }).entries(comparisons);

	d3.select('#fourth-chart-container > h4 > span').text(higherEdSelections.state + ' ' + higherEdSelections.singleSector + 's ');
	drawLineChart(nestedBySchool, 'comparison', oneSchoolSVG, oneSchoolG, oneSchoolYAxis)
}

function callSchoolChart(){
  var schoolDataByRace = makeDemogNest(higherEdSelections.selectedSchool, true);
  d3.select('#fourth-chart-container > h4 > span').text(higherEdSelections.selectedSchool);
  //schoolDataByRace = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
  drawLineChart(schoolDataByRace, 'sector', oneSchoolSVG, oneSchoolG, oneSchoolYAxis)
}

function makeDropdown(data){
  data.sort(function(a, b){
    return a.localeCompare(b);
  })

  var select = d3.select('#dropdown').on('change', menuSelected)

  var options = select.selectAll('option')
                      .data(data)
                      .enter()
                      .append('option')
                      .text(function(d){ return d })
                      .attr('value', function(d){ return d })
                      .property('selected', function(d){ return d === higherEdSelections.state })
}

function menuSelected(){
	higherEdSelections.state = this.value;
	d3.select('#first-chart-container > h4 > span:nth-child(1)').text(higherEdSelections.state);
	d3.select('#third-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
	d3.select('#second-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);

	higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
		return d.fips_ipeds === higherEdSelections.state;
	})

  callBarChart(higherEdSelections.year);

	//format data and call line chart race
	NESTED_BY_SECTOR = makeSectorNest();
	NESTED_BY_SECTOR = NESTED_BY_SECTOR.filter(function(d){ return higherEdSelections.arraySectors.indexOf(d.key) > -1 })
	drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis);

	NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
	NESTED_BY_RACE = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
	drawLineChart(NESTED_BY_RACE, 'sector', bySectorSVG, bySectorG, bySectorYAxis)
}

function makeSchoolLookup(schoolNames){
  $( '#school-lookup' ).autocomplete({
    source: schoolNames,
    select: function(event, ui){
      higherEdSelections.selectedSchool = ui.item.value;

      var schoolDatum = higherEdData.allData[SELECTED_DATASET].filter(function(d){return d.inst_name === higherEdSelections.selectedSchool })[0]
      higherEdSelections.state = schoolDatum.fips_ipeds
      higherEdSelections.singleSector = schoolDatum[SECTOR_KEY]
      // <p id="school-description">Sector: <span>4-year, selective public</span></p>

      d3.select('#school-description > span').text(schoolDatum.slevel + ', ' + schoolDatum[SECTOR_KEY])

      d3.select('#comparison-def > span').text(schoolDatum.fips_ipeds)

      if (higherEdSelections.chartType === 'multiple-schools'){
       	callComparisonChart();
      } else {
      	callSchoolChart();
      }
    }
  });
}
//MIN_YEAR is 2009
// Time
 var dataTime = d3.range(0, 9).map(function(d) {
    return new Date(MIN_YEAR + d, 10, 3);
  });

var sliderTime =
	d3.sliderBottom()
		.min(d3.min(dataTime))
		.max(d3.max(dataTime))
		.step(1000 * 60 * 60 * 24 * 365)
		.width(220)
		.tickFormat(function(d){ return '\'' + d3.timeFormat('%y')(d)})
		.tickValues(dataTime)
		.default(new Date(2017, 10, 3))
    .handle(["M 1, 0 m -8.5, 0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0"]) //draw a circle as a path: https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
		.on('onchange', function(val){

			higherEdSelections.year = timeFormat(val);
			callBarChart(higherEdSelections.year);
			d3.select('#first-chart-container > h4 > span:nth-child(2)').text(timeFormat(val));
		});

var gTime =
	d3.select('div#year-input')
		.append('svg')
		.attr('width', 250)
		.attr('height', 60)
		.append('g')
		.attr('transform', 'translate(15,15)');

gTime.call(sliderTime);
d3.select('#first-chart-container > h4 > span:nth-child(2)').text(timeFormat(sliderTime.value()));





function initializeStaticControls(){
	//event listener party
	d3.selectAll('.geography-choices').on('click', function(){

		var userChoice = this.getAttribute('data-cat');
		console.log(userChoice)
		higherEdSelections.geography = userChoice

		d3.selectAll('.geography-choices').classed('selected', false)
		d3.select(this).classed('selected', !d3.select(this).classed('selected'))

		if ( userChoice === 'state'){
			//UI changes
			d3.select('#first-chart-container > h4 > span:nth-child(1)').text(higherEdSelections.state);
			d3.select('#third-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			d3.select('#second-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);

			d3.select('#time-selection').style('display', 'block');
			d3.select('#school-selection').style('display', 'none');

	    d3.select('#first-dynamic-menu').style('display', 'block');
	    d3.select('#second-dynamic-menu').style('display', 'block');

	    d3.selectAll('.time-selector').classed('selected', false);

      if (higherEdSelections.chartType === 'by-sector-chart' || higherEdSelections.chartType === 'by-race-chart'){
        d3.selectAll('.time-selector.main-choice.line').classed('selected', true);
        d3.select("div.sub-choice[value='" + higherEdSelections.chartType + "']").classed('selected', true)
      } else {
        d3.select('.time-selector.main-choice.bar').classed('selected', true);
      }

			//global selectors
			SELECTED_DATASET = 'filteredForState';
			SECTOR_KEY = higherEdSelections.programLength === 'four' ? 'fourcat' : 'twocat';

			//create state dropdown menu
			var states = higherEdData.allData.statefour.map(function(d){return d.fips_ipeds});
			var menuData = states.filter(distinct);
			makeDropdown(menuData);
			d3.select('#dropdown').style('display', 'block');

			//filter state data to just selected state
			higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
				return d.fips_ipeds === higherEdSelections.state;
			})
			// if coming from a chart type that isn't shared by 'state' view, show the bar chart as default
			if (higherEdSelections.chartType === 'one-school-all-races-container' || higherEdSelections.chartType === 'multiple-schools'){
				showChart('single-year-bar')
				higherEdSelections.chartType = 'single-year-bar'
			}

		} else if ( userChoice === 'national' ){
			d3.select('#time-selection').style('display', 'block');
			d3.select('#dropdown').style('display', 'none')
			d3.select('#school-selection').style('display', 'none')
			d3.select('#first-chart-container > h4 > span:nth-child(1)').text('US');
      d3.select('#second-chart-container > h4 > span:nth-child(2)').text('US');
      d3.select('#third-chart-container > h4 > span:nth-child(2)').text('US');

      d3.select('#first-dynamic-menu').style('display', 'block')
      d3.select('#second-dynamic-menu').style('display', 'block')
			//selectors updated
			SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength
		      //the chart types aren't shared between school and national/state, so it amkes sense to reset
		      //to default bar chart when going back to national or state from school
			if (higherEdSelections.chartType === 'one-school-all-races-container' || higherEdSelections.chartType === 'multiple-schools'){
				showChart('single-year-bar')
		      d3.selectAll('.time-selector').classed('selected', false);
		      d3.select('.time-selector.main-choice.bar').classed('selected', true);
		  		higherEdSelections.chartType = 'single-year-bar'
			}

		} else if ( userChoice === 'school' ){
      		d3.select('#school-comparison').property('checked', false);

      		higherEdSelections.geography = 'school'

			SELECTED_DATASET = 'schoolfour';
			higherEdSelections.chartType = 'one-school-all-races-container'

			var schoolNames = higherEdData.allData.schoolfour.filter(function(d){
				if (d.year ==='2015'){ return d.inst_name }
			}).map(function(d){
				return d.inst_name
			})

			makeSchoolLookup(schoolNames);
			showChart(higherEdSelections.chartType);
			callSchoolChart();
    }

    if (userChoice !== 'school'){
        //all these use SELECTED_DATASET inside the filtering/nesting functions
    	callBarChart(higherEdSelections.year);

    	NESTED_BY_SECTOR = makeSectorNest();
    	NESTED_BY_SECTOR = NESTED_BY_SECTOR.filter(function(d){ return higherEdSelections.arraySectors.indexOf(d.key) > -1 })
    	drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis);

    	NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
    	NESTED_BY_RACE = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
    	drawLineChart(NESTED_BY_RACE, 'sector', bySectorSVG, bySectorG, bySectorYAxis)
    }

    buildOptionPanel(higherEdSelections.chartType)

	})

	//if view is 'state' add state dropdown menu
	//if view is 'school' add look up box for school name

	d3.selectAll('.time-selector').on('click', function(){
		d3.event.stopPropagation();
		var chart = this.getAttribute('value') //single-year-bar, by-sector-chart, by-race-chart

		higherEdSelections.chartType = chart;

		d3.selectAll('.time-selector').classed('selected', false);
		d3.select(this).classed('selected', true);

		if (chart === 'by-sector-chart'){
			d3.select('.time-selector.bar').classed('selected', false);
			d3.select('.time-selector.line.main-choice').classed('selected', true);
			d3.select('#third-chart-container > h4 > span:nth-child(1)').text(translateRace[higherEdSelections.singleRace]);
			if (higherEdSelections.geography === 'state'){
				d3.select('#third-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			}
			drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis)// data nested by sector or race; the selected radio ('topic'); svg
		} else if (chart === 'by-race-chart'){
			d3.select('.race').classed('selected', true);
			d3.select('.time-selector.bar').classed('selected', false);
			d3.select('.time-selector.line.main-choice').classed('selected', true);
			d3.select('#second-chart-container > h4 > span:nth-child(1)').text(higherEdSelections.singleSector);
			if (higherEdSelections.geography === 'state'){
				d3.select('#second-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			}
			drawLineChart(NESTED_BY_RACE, 'sector', bySectorSVG, bySectorG, bySectorYAxis)
		} else if ( chart === 'single-year-bar' ){
			d3.select('.time-selector.bar').classed('selected', true);
			d3.select('.time-selector.line.main-choice').classed('selected', false);
		}

		showChart(chart);
		buildOptionPanel(chart);
	})
} //end initializeStaticContols

function filterDataByYear(year){
	//this might need to filter for all the things, year, race, and sector
	return higherEdData.allData[SELECTED_DATASET].filter(function(d){
				return d.year === year
			});
}

function makeSectorNest(){
		if (higherEdSelections.geography === 'state'){
		higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
			return d.fips_ipeds === higherEdSelections.state;
		})
	}
	var nest = d3.nest().key(function(d){
		return d[SECTOR_KEY]
	}).entries(higherEdData.allData[SELECTED_DATASET]);
	return nest;
}


function makeDemogNest(sector, isSchoolData){

	var nestedByDemog = [],
		filtered;

	if (higherEdSelections.geography === 'state'){
		higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
			return d.fips_ipeds === higherEdSelections.state;
		})
	}

	if (isSchoolData){
		filtered = higherEdData.allData[SELECTED_DATASET].filter(function(d){
					return d.inst_name === higherEdSelections.selectedSchool
				})
		higherEdSelections.state = filtered[0].fips_ipeds;
		higherEdSelections.singleSector = filtered[0][SECTOR_KEY];
	} else {
		filtered = higherEdData.allData[SELECTED_DATASET].filter(function(d){
							return d[SECTOR_KEY] === sector
						})
	}

	for (var i = 0; i < RACE_OPTIONS.length; i++){
		nestedByDemog.push({'key': RACE_OPTIONS[i], 'values': []})
		filtered.forEach(function(yearData){
			var obj = {
				'year': yearData.year,
				'value': yearData[RACE_OPTIONS[i]]
			}
			nestedByDemog[i].values.push(obj)
		})
	}
	return nestedByDemog;
}

function prepareData(){
	NESTED_BY_SECTOR = makeSectorNest();
	NESTED_BY_RACE = makeDemogNest('Public Nonselective');

	higherEdSelections.arraySectors = NESTED_BY_SECTOR.map(function(d){ return d.key })
	higherEdSelections.arrayRaces = higherEdData.allData[SELECTED_DATASET].columns.slice(2)
}

function init(){
	RACE_OPTIONS = higherEdData.allData.nationalfour.columns.slice(2)
	prepareData();
	buildOptionPanel('single-year-bar');
	initializeStaticControls();

  //janky but move the numbers on the slider, can't find the option in the package: https://github.com/johnwalley/d3-simple-slider
  d3.selectAll("#year-input > svg > g > g.axis > g > text").attr("y", 12)
  d3.select("#year-input > svg > g > g.slider > g > text").attr("y", 19).style("font-size", 14)

	//draw your default chart, bars for 2017: all races/sectors
	FILTERED_BY_YEAR = filterDataByYear(higherEdSelections.year);
	drawBarChart(FILTERED_BY_YEAR);
}

d3.csv('data/national-2yr.csv').then(function(nationaltwo){
	higherEdData.allData.nationaltwo = nationaltwo;
	d3.csv('data/national-4yr.csv').then(function(nationalfour){
		higherEdData.allData.nationalfour = nationalfour;
			d3.csv('data/schools.csv').then(function(schoolfour){
        //I combined all schools into one csv and am calling all schools 'schoolfour', '
        //I know this is wrong but it seems easier
				higherEdData.allData.schoolfour = schoolfour;
				d3.csv('data/state-2yr.csv').then(function(statetwo){
					higherEdData.allData.statetwo = statetwo;
					d3.csv('data/state-4yr.csv').then(function(statefour){
						higherEdData.allData.statefour = statefour;
						init();
					})
				})
			})
		})
})


