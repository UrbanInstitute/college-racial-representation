//TODOs
//BUGS

//FEATURES
//make chart responsive using resize

//I took out 'dif_othra' and kept in (was dif_twora) 'dif_multi' which became 'multiracial'


function toggle_visibility(id) {
  var e = document.getElementById(id);
  if (e.style.display == 'inline-block')
      e.style.display = 'none';
  else
      e.style.display = 'inline-block';
}

//This is for IE 11
if (!Object.entries) {
  Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}

// https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
var US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','District of Columbia']
// the datas
var higherEdData = {};
	higherEdData.allData = {};

// the user selections
var higherEdSelections = {};
	higherEdSelections.geography = getQueryParam('geography','national',['national','state','school']),
	higherEdSelections.chartType = getQueryParam('chart-type','single-year-bar',['single-year-bar', 'by-sector-chart', 'by-race-chart', 'one-school-all-races-container', 'multiple-schools']) ,
	higherEdSelections.year = getQueryParam('year','2009', Array.apply(null, Array(9)).map(function (o, i) {return String(i + 2009);})) //strings of years 2009 -> 2017
	higherEdSelections.programLength = getQueryParam('program-length','four',['two', 'four'])
	higherEdSelections.singleRace = getQueryParam('single-race', 'dif_hispa', Object.keys(translateRace))
	higherEdSelections.singleSector = translate[getQueryParam('single-sector','public-nonselective',Object.keys(translate))],
	higherEdSelections.state = decodeURIComponent(getQueryParam('state','Alabama', US_STATES)),
  	higherEdSelections.selectedSchool = decodeURIComponent(getQueryParam('selected-school',encodeURIComponent('Northern Virginia Community College'),'all')),
	higherEdSelections.arrayRaces = getQueryParam('array-race',['dif_white', 'dif_hispa', 'dif_black', 'dif_asian', 'dif_amind', 'dif_pacis', 'dif_multi'],Object.keys(translateRace)),
	higherEdSelections.arraySectors = getQueryParam('array-sectors',['For-Profit', 'Private More Selective', 'Private Nonselective', 'Private Selective', 'Public More Selective', 'Public Nonselective', 'Public Selective'],Object.keys(translate)),
	higherEdSelections.defaultSchool = higherEdSelections.selectedSchool


var SECTOR_KEY = higherEdSelections.programLength + 'cat',
	SELECTED_DATASET = (higherEdSelections.geography == 'state') ? 'filteredForState' : higherEdSelections.geography + higherEdSelections.programLength,
	NESTED_BY_SECTOR,
	NESTED_BY_RACE,
	FILTERED_BY_YEAR,
	STATE_DATA,
  	SCHOOL_NAMES,
  	RACE_OPTIONS

var storedWidth = document.body.clientWidth;
var IS_MOBILE = storedWidth < 769 ? true : false ;

var optionsPanelTotalWidth =
	IS_MOBILE ? 0 :
	parseInt(d3.select('#options-panel').style('width')) + parseInt(d3.select('#options-panel').style('margin-right')),
	pageContainerWidth = parseInt(d3.select('.page-container').style('width')),
	chartHole = pageContainerWidth - optionsPanelTotalWidth

d3.selectAll('.chart-div, #chart-area-container').style('width', chartHole + 'px')
d3.select('#chart-frame').style('width', chartHole * 4 + 'px')
//svg, .chart-div, #chart-area-container all need to be same width

var margin = {top: 5, right: 20, bottom: 30, left: 35},
    barMargin = {top: 10, right: 10, bottom: 30, left: 0},
    width = chartHole - margin.left - margin.right,
    aspectRatio = IS_MOBILE ? 0.8 : 0.67,
    height = (chartHole * aspectRatio) - margin.top - margin.bottom;

var xLine, xBar,
	y = d3.scaleLinear()
		.range([height - margin.bottom, margin.top]);

var MIN_YEAR = 2009,
    MAX_YEAR = 2017;


var panelMouseover = d3.select('body').append('div')
    .attr('class', 'tooltip panelmouseover')
    .style('opacity', 0);

//******The chart selections & their G's
//bar chart
var singleYearContainer = d3.select('#first-chart-container').append('div')
    .style('width', (width + barMargin.left + barMargin.right) + 'px')
// var barChartG = singleYearSVG.append('g')
    // .attr('transform', 'translate(' + barMargin.left + ',' + barMargin.top + ')');
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
d3.select(window).on('resize', resize);

	var windowWidth = window.innerWidth

	//there's also a media query for big screens
    // if (windowWidth > 1530){
    //   d3.select('#heroimage').style('height', windowWidth/1.585 + 'px')

    // }
    // else {
    //   d3.select('#heroimage').style('background-size', 'contain')
    // }


function resize(){
  //https://stackoverflow.com/questions/17328742/mobile-chrome-fires-resize-event-on-scroll
  if (storedWidth !== document.body.clientWidth){
    console.log('diff')

    storedWidth = window.innerWidth;

    IS_MOBILE = storedWidth < 768 ? true : false ;

    if (window.innerWidth > 1530){
      d3.select('#heroimage').style('height', storedWidth/1.585 + 'px')
    }
    // else {
    //   d3.select('#heroimage').style('background-size', 'contain')
    // }

    optionsPanelTotalWidth = parseInt(d3.select('#options-panel').style('width')) + parseInt(d3.select('#options-panel').style('margin-right'))
    if (IS_MOBILE){
    	optionsPanelTotalWidth = 0
    	d3.selectAll('#first-dynamic-menu, #second-dynamic-menu').style('display', 'none')
    	d3.select('#mobile-filter-options').style('display', 'inline')
    } else {
    	d3.select('#first-dynamic-menu, #second-dynamic-menu').style('display', 'block')
    	d3.select('#mobile-filter-options').style('display', 'none')
    }

    pageContainerWidth = parseInt(d3.select('.page-container').style('width'))
    chartHole = pageContainerWidth - optionsPanelTotalWidth - margin.left - margin.right

    var width = chartHole,
      height = (chartHole * aspectRatio) - margin.top - margin.bottom

     addArrowsToHighlights();
    //resize the containers
    d3.selectAll('#first-chart-container, #third-chart-container, #second-chart-container, #fourth-chart-container')
        .style('width', width + 'px')

    d3.selectAll('.chart-div, #chart-area-container').style('width', width + 'px')

    singleYearContainer
        .style('width', width )
        .attr('height', height);
    byRaceSVG
        .attr('width', width)
        .attr('height', height);

    bySectorSVG
        .attr('width', width + margin.left + margin.right)
        .attr('height', height);

    oneSchoolSVG
        .attr('width', width)
        .attr('height', height);

    var topicDependentKey = {
		'by-race-chart': 'value', //"dif_hispa", "dif_white".. etc
		'by-sector-chart': higherEdSelections.singleRace, //bc this data object just has one sector at a time
		'multiple-schools': higherEdSelections.singleRace,
		'one-school-all-races-container': higherEdSelections.singleRace
	}
	if (higherEdSelections.chartType !== 'single-year-bar'){
	    xLine.range([margin.left, width - margin.right])
	    var line = d3.line()
	  		.x(function(d){ return xLine(parseTime(d.year)) })
	  		.y(function(d){ return y(+d[topicDependentKey]) })
	}

    if (higherEdSelections.chartType === 'single-year-bar'){
    	xBar.rangeRound([barMargin.left, width - barMargin.right])

	    d3.selectAll('rect')
	      .attr('x', function(d){ return +d.value > 0 ? xBar(0) : xBar(d.value) })
	      .attr('fill', function(d){ return raceColorObj[d.key] })
	      .attr('width', function(d){ return +d.value > 0 ? xBar(d.value) - xBar(0) : (xBar(0) - xBar(d.value)) })
    }

    // d3.selectAll('path.data-line')
    // 	.attr('d', function(d){ return line(d.values)  })

    d3.selectAll('g.tick > line')
      .attr('x2', chartHole - margin.left)

    showChart(higherEdSelections.chartType);



  }
}

var parseTime = d3.timeParse('%Y'),
  timeFormat = d3.timeFormat('%Y'),
  formatTwoDecimals = d3.format('.2f')



var distinct = function(value, index, self){ return self.indexOf(value) === index; }

function radioButtonTemplater(option){
var html =
'<div><label class="n-radio-label"><input type="radio" class="n-radio " name="' + higherEdSelections.chartType + '" value="' + option + '" /><span>' + translateRace[option] + '</span></label></div>'
    return html
}
// checkbox template
function checkboxTemplater(option){
var html =
'<div class="c-cb"><input type="checkbox" class="race-checkbox" name="' + higherEdSelections.chartType + '" value="' + option + '" checked/><label for="' + option + '">' + translateRace[option] + '</label></div>'
    return html
}

function convertSelectors(numberString){

	SECTOR_KEY = numberString + 'cat'
	higherEdSelections.programLength = numberString

	if (higherEdSelections.geography === 'state'){
		SELECTED_DATASET = 'filteredForState'
		higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
			return d.fips_ipeds === higherEdSelections.state;
		})
	} else if (higherEdSelections.geography === 'school' ){
		//because I combined all the schools into one datasheet and called them all 'schoolfour'
		SELECTED_DATASET = 'schoolfour'
		SECTOR_KEY = 'fourcat'
		higherEdSelections.programLength = 'four'
	} else {
		SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength
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

	var containerName = {
		'single-year-bar': '#first-chart-container',
		'by-race-chart': '#second-chart-container',
		'by-sector-chart': '#third-chart-container',
    	'one-school-all-races-container': '#fourth-chart-container',
    	'multiple-schools':  '#fourth-chart-container'
	}
	d3.selectAll('.chart-div').style('display', 'none')
	d3.select('.chart-div' + containerName[chartType]).style('display', 'inline-block')
	d3.select('#first-chart-container').transition().style('margin-left', chartScootch[chartType] + 'px')
}

function addArrowsToHighlights(){
	if (window.innerWidth < 950){
		d3.selectAll('.caret').style('display', 'inline')
		d3.selectAll('img.caret').on('click', function(){
			var isLeft = d3.select(this).classed('left')
			//get the ID of wrapping div to know whether scenario1, 2 or 3
			var wrappingDiv = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
			var id = wrappingDiv.getAttribute('id'),
			multiplier = id.substring(id.length - 1)

			var chartScootch = isLeft ? (parseInt(d3.select(wrappingDiv).style('width')) * -1) * (multiplier -2) :
			(parseInt(d3.select(wrappingDiv).style('width')) * -1) * multiplier
			d3.select('#scenario1').style('margin-left', chartScootch + 'px')
		})

		// var scootch = ( parseInt(d3.select('div.scenario').style('height')) / 2 ) - 30 + 'px'
		// d3.selectAll('.caret').style('bottom', scootch)
	} else {
		d3.selectAll('.caret').remove();
	}
}

function drawBarChart(data, animate){

	var keys = higherEdSelections.arrayRaces.slice() //higherEdData.allData[SELECTED_DATASET].columns.slice(1);

	keys.push(SECTOR_KEY);


	//some jankyness right now. Basically want the following behavior when using the year slider:
		//do not animate the bars
		//set x domain based on all possible year values for the selected dataset and keys
	//all other options (where animate == true) have the opposite behavior, namely
		//bars animate
		//x domain is set just based on the data that is displayed
	//so could rename "animate" var to, like, "isNotYearInput" if you like, or keep as is, or discuss
	var isYearInput = !animate

	//make your data an array of objects
	data = data.map(function(sector){
		var obj = {}
		for (var i = 0; i < keys.length; i++){
			obj[keys[i]] = sector[keys[i]]
		}
		return obj
	})


	// console.log(higherEdData.allData[SELECTED_DATASET], animate)
	var allBarValues = []
	//could be more elegant...eh
	if(isYearInput){
		for(var i = 0; i < higherEdData.allData[SELECTED_DATASET].length; i++){
			var datum = Object.entries(higherEdData.allData[SELECTED_DATASET][i])
			for(var j = 0; j < datum.length; j++){
				var key = datum[j][0],
					value = datum[j][1]
				if(key.search('dif') != -1 && keys.indexOf(key) != -1 ) allBarValues.push(+value)
			}

		}
	}else{
		for(var i = 0; i < data.length; i++){
			var datum = Object.entries(data[i])
			for(var j = 0; j < datum.length; j++){
				var key = datum[j][0],
					value = datum[j][1]
				if(key.search('dif') != -1) allBarValues.push(+value)
			}

		}
	}

  var 	barChartHeight = 200,
  		barChartWidth = IS_MOBILE ? chartHole : chartHole * .5 - 30;


	//scale used to place each sector
	var y0 = d3.scaleBand()
	    .domain(data.map(function(d){ return d[SECTOR_KEY] }) ) //returns lists of sectors
	    .rangeRound([barChartHeight, 0])
	    .paddingInner(0.3)
// console.log(y0.bandwidth())
	//scale used to place each race within sector
    var y1 = d3.scaleBand()
	    .domain(higherEdSelections.arrayRaces)
	    .rangeRound([barChartHeight - barMargin.top - barMargin.bottom, 25])
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
	    .domain(d3.extent(allBarValues))
	    .rangeRound([50, barChartWidth - barMargin.right-50])

	var sectorContainers = singleYearContainer.selectAll('div.sector')
		.data(data, function(d){ return d[SECTOR_KEY] })
		.join('div')
		  // .attr('transform', function(d){ return 'translate(0,' + y0(d[SECTOR_KEY]) + ')' } )
		  .attr('class', function(d){ if (d[SECTOR_KEY] === 'Public Nonselective') { return 'Public Nonselective'}
		  	else if (d[SECTOR_KEY] === 'Private Nonselective'){ return 'Private Nonselective'} else {
		  		return d[SECTOR_KEY]
		  	} })
		  .classed('sector', true)
	sectorContainers.selectAll('svg').remove()
	console.log(barChartWidth, barChartHeight)

	var sectorSvgs = sectorContainers
		.append('svg').attr('width',barChartWidth).attr('height', barChartHeight)

var sectorGroups = sectorSvgs.append('g')
		.attr('transform', 'translate(0,12)')


//define a pattern fill for negative bars
sectorSvgs
  .append('defs')
  .append('pattern')
    .attr('id', 'verticalHatch')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 5)
    .attr('height', 5)
  .append('line')
    .attr('x1',0)
    .attr('x2',0)
    .attr('y1',0)
    .attr('y2',5)
    .attr('stroke', '#fff')
    .attr('stroke-width', 3);

	d3.selectAll('.sector-label').remove(); //shrug emoji?

	var sectorLabels = sectorGroups.append('text')
		.classed('sector-label', true)
		.text(function(d){
			var string = d[SECTOR_KEY]
			return higherEdSelections.programLength === 'four' ? string :
				string.slice(0, string.length - 7) })
		.attr('text-anchor', function(){ return IS_MOBILE ? 'left' : 'middle' })
		.attr('font-size', 16)
		.attr('x', function(){ return IS_MOBILE ? 0 : xBar(0) })
      	.attr('y', 0)

	sectorContainers.exit().remove();

	var barG = sectorGroups.selectAll('g')
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
		.enter()
		.append('g')

  var rects = barG
	  .append('rect')
	    .attr('y', function(d){ return y1(d.key) })
	    .attr('x', function(d){
	    	return animate ? xBar(0) : +d.value > 0 ? xBar(0) : xBar(d.value)
	    })
	    .attr('fill', function(d){ return raceColorObj[d.key] })
	  	.attr('height', y1.bandwidth())
	  	.attr('width',function(d){ return animate ? 0 : +d.value > 0 ? xBar(d.value) - xBar(0) : (xBar(0) - xBar(d.value)) })
	  	if(animate){
		  rects.transition()
		  	.attr('width', function(d){ return +d.value > 0 ? xBar(d.value) - xBar(0) : (xBar(0) - xBar(d.value)) })
		    .attr('x', function(d){
		    	return +d.value > 0 ? xBar(0) : xBar(d.value)
		    })
		}
		rects.transition().duration(800)
			.attr('x', function(d){ return d.value > 0 ? xBar(0) : xBar(d.value) })
			.attr('width', function(d){ return d.value > 0 ? xBar(d.value) - xBar(0) : (xBar(0) - xBar(d.value)) })

			.attr('height', y1.bandwidth())

//as in some of my other edits I'm sure a nicer way to do this without repeated code but...moving quickly!
  var hatchRects = barG
	  .append('rect')
	    .attr('y', function(d){ return y1(d.key) })
	    .attr('x', function(d){
	    	return animate ? xBar(0) : +d.value > 0 ? xBar(0) : xBar(d.value)
	    })
	    .attr('fill', 'url(#verticalHatch)')
	  	.attr('height', y1.bandwidth())
	  	.attr('width',function(d){ return animate ? 0 : +d.value > 0 ? 0 : (xBar(0) - xBar(d.value)) })
	  	if(animate){
		  hatchRects.transition()
		  	.attr('width', function(d){ return +d.value > 0 ? 0 : (xBar(0) - xBar(d.value)) })
		    .attr('x', function(d){
		    	return +d.value > 0 ? xBar(0) : xBar(d.value)
		    })
		}
		// hatchRects.transition().duration(800)
		// 	.attr('x', function(d){ return d.value > 0 ? xBar(0) : xBar(d.value) })
		// 	.attr('width', function(d){ return d.value > 0 ? xBar(d.value) - xBar(0) : (xBar(0) - xBar(d.value)) })

		// 	.attr('height', y1.bandwidth())


	rects.exit().remove()
	hatchRects.exit().remove()


  var yAxis = sectorGroups.append('line')
  	.attr('x1',xBar(0))
  	.attr('x2',xBar(0))
  	.attr('y1', 20)
  	.attr('y2', barChartHeight - 35)
  	.attr('class', 'bar y axis')


  d3.selectAll('.bar-labels').remove();
  var barLabels = barG.append('text')
    .classed('bar-labels', true)
    .text(function(d){ return formatTwoDecimals(d.value) + '%' })
    .attr('x', function(d){
    	return animate ? xBar(0) : +d.value > 0 ? xBar(d.value) + 3 : xBar(d.value) - 2
    })
    .attr('text-anchor', function(d){ return  +d.value > 0 ? 'start' : 'end' })
    .attr('y', function(d){ return y1(d.key) + y1.bandwidth()*.5 + 3 })

    if(animate){
    	barLabels.transition()
		    .attr('x', function(d){
		    	return +d.value > 0 ? xBar(d.value) + 3 : xBar(d.value) - 2
		    })
    }

    d3.selectAll('li.key-item-bar').remove();
    var legendData = higherEdSelections.arrayRaces.sort(d3.ascending)
	var keys = barLegend.selectAll('li.key-item-bar')
		.data(legendData)
		.enter()
		.append('li')
		.attr('class', function(d){ return d })
		.classed('bar-chart-key', true)
		.classed('key-item-bar', true)
		.classed('race', true)
		.style('border-left', function(d){ return '17px solid ' + raceColorObj[d] })
		.text(function(d){ return translateRace[d] })

	d3.select('#under-over').remove()
	var grayBoxSVG = d3.select('#first-chart-container > div.legend').append('svg')
		.attr('height', 20).attr('width', 300).attr('id', 'under-over').style('margin-bottom', 25)
	  grayBoxSVG.append('rect')
	    .attr('y', 0)
	    .attr('x', 0)
	    .attr('fill', '#D2D2D2')
	  	.attr('height', 14)
	  	.attr('width', 17)
	  	.attr('class', 'key-item-bar')

	  grayBoxSVG.append('rect')
	  	.attr('y', 0)
	  	.attr('x', 0)
	  	.attr('fill', 'url(#verticalHatch)')
	  	.attr('height', 14)
	  	.attr('width', 17)
	  	.attr('class', 'key-item-bar')

	  grayBoxSVG.append('text')
	  	.attr('y', 11)
	  	.attr('x', 20)
	  	.text('Underrepresented')
	  	.attr('class', 'key-item-bar')

	  grayBoxSVG.append('rect')
	    .attr('y', 0)
	    .attr('x', 150)
	    .attr('fill', '#D2D2D2')
	  	.attr('height', 14)
	  	.attr('width', 17)
	  	.attr('class', 'key-item-bar')

	  grayBoxSVG.append('text')
	  	.attr('y', 11)
	  	.attr('x', 170)
	  	.text('Overrepresented')
	  	.attr('class', 'key-item-bar')

}

//svg & g: byRaceSVG, byRaceG, bySectorSVG, bySectorSVG; axis: bySectorYAxis, byRaceAxis;
function drawLineChart(data, topic, svg, g, axisSelection){

	var selected = {
		'race': higherEdSelections.singleRace, //"dif_hispa", "dif_white".. etc
		'sector': 'value', //bc this data object just has one sector at a time
		'comparison': higherEdSelections.singleRace
	}
	if (higherEdSelections.chartType === 'multiple-schools'){
		var tt = d3.select('body').append('div')
		    .attr('class', 'tooltip')
		    .style('opacity', 0);
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


  svg.append('text')
  	.text('Year')
  	.attr('y', height + margin.bottom)
  	.attr('x', width/2)
  	.attr('class', 'axis-label')

	var line = d3.line()
		.x(function(d){ return xLine(parseTime(d.year)) })
		.y(function(d){ return y(+d[selected[topic]]) })
		.defined(function(d){
			if (d[selected[topic]] === ''){
				return false
			} else {
				return !isNaN(d[selected[topic]])
			}
		})

	d3.select('.x-axis').remove();
	svg.append('g')
		.attr('class','x-axis')
		.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top - margin.bottom) + ')')
		.call(d3.axisBottom(xLine).tickFormat( function(d){ return IS_MOBILE ? '\'' + d3.timeFormat('%y')(d) :
			d3.timeFormat('%Y')(d)
		}) );

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
		.data(data, function(d){
			//on second pass here (from voronoi fx?) d is undefined for 'school comparison', so added this check
			if (typeof(d) != 'undefined' && d.hasOwnProperty('key')) {
			 	return d.key
			}
		})

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
		.attr('stroke-width', function(d){
			        		if (d.key !== higherEdSelections.selectedSchool){
				        		return 2
				        	} else {
				        		return 4
				        	}
				        })
		.attr('class', function(d,i){
			var string = 'data-line ';
			if (topic==='comparison'){
		        if (d.key === higherEdSelections.selectedSchool){
			         string += 'highlight-school '
			    } else if (d.key === 'State average'){
			    	string += 'state-avg'
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

	d3.selectAll('.highlight-school').moveToFront();


	if ( higherEdSelections.chartType === 'multiple-schools' ){

		var voronoi = d3.voronoi()
			.x(function(d){ return xLine(parseTime(d.year)) })
			.y(function(d){ return y(+d[selected[topic]]) })
			.extent([[0, 0], [width, height - margin.bottom]]);

		var voronoiGroup = g.append('g')
			.attr('class', 'voronoi');

		voronoiGroup.selectAll('path')
			.data(voronoi.polygons(d3.merge(data.map(function(d) { return d.values; }))))
			.enter().append('path')
				.attr('d', function(d) { return d ? 'M' + d.join('L') + 'Z' : null; })
				.on('mouseover', function(d){
					tt.style('opacity', .9);
	        		tt.html(d.data.inst_name)
			            .style('left', (d3.event.pageX) + 'px')
			            .style('top', (d3.event.pageY - 28) + 'px');
			        d3.select('path[data-cat=' + classify(d.data.inst_name) +  ']')
			        	.attr('stroke-width', function(d){
			        		if (d.key !== higherEdSelections.selectedSchool){
				        		return 4
				        	} else {
				        		return 6
				        	}
				        })
			        	.style('stroke', function(d){
			        		if (d.key !== higherEdSelections.selectedSchool){
				        		return '#353535'
				        	}
				        })
				        .attr('opacity', 1)

				})
				.on('mouseout', function(d){
					tt.style('opacity', 0)
					d3.select('path[data-cat=' + classify(d.data.inst_name) +  ']')
						.style('stroke', function(d){
							if (d.key !== higherEdSelections.selectedSchool){
				        		return '#969696'
				        	}
						})
						.attr('stroke-width', function(d){
							if (d.key !== higherEdSelections.selectedSchool){
				        		return 2
				        	} else {
				        		return 4
				        	}
						})
						.attr('opacity', function(d){
							if (d.key !== higherEdSelections.selectedSchool){
				        		return 0.6
				        	}
						})
				})
	}


	function makeLegend(selection, data, isRaceChart){
		data.sort(d3.ascending)
		d3.selectAll('li.key-item-line').remove();
		var keys = selection.selectAll('li')
			.data(data)
			.enter()
			.append('li')
			.attr('class', function(d){ return isRaceChart ? classify(d) : d })
			.attr('data-cat', function(d){ return isRaceChart ? classify(d) : d })
			.classed('key-item-line', true)
			.classed('race', isRaceChart)
			.style('border-left', function(d){
				var color = isRaceChart ? raceColorObj[d] : sectorColorObj[classify(d)];
				return '17px solid ' + color;
			})
			.text(function(d){
				if (isRaceChart){
					return translateRace[d];
				} else {
					var firstLetter = d[0].toUpperCase(),
					endPosition = higherEdSelections.programLength === 'two' ? d.length - 6 : d.length,
					remainingLetters = d.slice(1,endPosition).toLocaleLowerCase(),
					sectorLabel = firstLetter.concat(remainingLetters)
					return sectorLabel
				}

			})
	}

	if (topic === 'sector'){
		makeLegend(bySectorLegend, higherEdSelections.arrayRaces, true)
	}

	if (topic === 'race') {
		var raceData = data.map(function(d){return d.key})
		makeLegend(byRaceLegend, raceData, false)
	}

  	if (higherEdSelections.chartType === 'one-school-all-races-container') {
  		d3.selectAll('li.key-item-comparison').remove()
  	  	makeLegend(oneSchoolLegend, higherEdSelections.arrayRaces, true)
  	}

  if (higherEdSelections.chartType === 'multiple-schools'){
    oneSchoolLegend.selectAll('li').remove();
    var schoolComparisonColors = ['#1696D2', '#969696', '#000000']
    var keys = oneSchoolLegend.selectAll('li.key-item-comparison')
      .data([higherEdSelections.selectedSchool, higherEdSelections.state + ' ' + higherEdSelections.singleSector.toLowerCase() + ' college', 'State average'])
      .enter()
      .append('li')
      .attr('class', function(d){ return d })
      .classed('key-item-comparison', true)
      .classed('race', true)
      .style('border-left', function(d,i){ return '17px solid ' + schoolComparisonColors[i] })
      .text(function(d){ return d })

    d3.selectAll('.data-line')
    	.on('mouseover', function(d){
        	d3.select(this).attr('stroke-width', 4)
        }).on('mouseout', function(d) {
        	d3.select(this).attr('stroke-width', 2)
        });
    }

	d3.selectAll('.key-item-line').on('mouseover', function(){
		var category = this.getAttribute('data-cat');
		category = higherEdSelections.chartType === 'by-sector-chart' ? classify(category) : category
		d3.selectAll('.data-line')
			.style('opacity', 0.5)
			.attr('stroke-width', 1)
		d3.selectAll('.' + category)
			.style('opacity', 1)
			.attr('stroke-width', 4)
	})

	d3.selectAll('.key-item-line').on('mouseout', function(){
		d3.selectAll('.data-line')
			.style('opacity', 1)
			.attr('stroke-width', 2)
	})
}

function buildOptionPanel(chartType){
		//empty these
		d3.select('#first-dynamic-menu').text('')
		d3.select('#second-dynamic-menu').text('')
	  	d3.select('#comparison-menu').text('')
	  	//this is to manage extra space needed for the slider on mobile
	  	if (chartType !== 'single-year-bar'){
	  		d3.select('#time-selection').classed('single-year-selected', false)
	  	}

	  	//create the right menu for each chart
		if (chartType === 'single-year-bar'){
			//checkboxes for everything
			d3.select('#first-dynamic-menu').html(COLLEGE_SECTOR_CHECKBOXES)//controls initialized further down for this one

			d3.select('#second-dynamic-menu').append('p').attr('class', 'options-panel-section').text('Race/Ethnicity')
			var div = d3.select('#second-dynamic-menu').append('div').attr('class', 'collapsible')
			div.selectAll('div.race-checkbox-wrapper')
				.data(RACE_OPTIONS)
				.enter()
				.append('div')
				.classed('race-checkbox-wrapper', true)
				.classed('checked', true)
				.html(function(d){ return checkboxTemplater(d) })
			//this is to manage extra space needed for the slider on mobile
			d3.select('#time-selection').classed('single-year-selected', true)

		} else if (chartType === 'by-sector-chart'){
			//races as radio buttons, sectors as checkboxes
			d3.select('#first-dynamic-menu').append('p').attr('class', 'options-panel-section').text('Race/Ethnicity')
			var div = d3.select('#first-dynamic-menu').append('div').attr('class', 'collapsible')
			div.selectAll('div.race-ethnicity-radios')
				.data(RACE_OPTIONS)
				.enter()
				.append('div')
				.classed('race-ethnicity-radios', true)
				.html(function(d){ return radioButtonTemplater(d) })

			d3.select('#second-dynamic-menu').html(COLLEGE_SECTOR_CHECKBOXES)

		} else if (chartType === 'by-race-chart'){
			//sectors as radio buttons, races as checkboxes
			d3.select('#first-dynamic-menu').html(COLLEGE_SECTOR_RADIOS)

			d3.select('#second-dynamic-menu').append('p').attr('class', 'options-panel-section').text('Race/Ethnicity')
			var div = d3.select('#second-dynamic-menu').append('div').attr('class', 'collapsible')
			div.selectAll('div.race-checkbox-wrapper')
				.data(RACE_OPTIONS)
				.enter()
				.append('div')
				.classed('race-checkbox-wrapper', true)
				.html(function(d){ return checkboxTemplater(d) })

		} else if (chartType === 'one-school-all-races-container'){

	      d3.select('#school-selection').style('display', 'block');

	      d3.select('#time-selection').style('display', 'none');
	      d3.select('#state-menu').style('display', 'none');

	      d3.select('#first-dynamic-menu').style('display', 'none')
	      d3.select('#second-dynamic-menu').style('display', 'none')

	      //school chart gets checkboxes for race, comparison chart gets radio for sectors
	      d3.select('#comparison-menu').html('<p class="options-panel-section">Race/Ethnicity</p>')
	      d3.select('#comparison-menu').selectAll('div.race-checkbox-wrapper')
	        .data(RACE_OPTIONS)
	        .enter()
	        .append('div')
	        .classed('race-checkbox-wrapper', true)
	        .classed('checked', true)
	        .html(function(d){ return checkboxTemplater(d) })

	  	} else if (chartType === 'multiple-schools'){

	  		d3.select('#school-selection').style('display', 'block');

	      d3.select('#time-selection').style('display', 'none');
	      d3.select('#state-menu').style('display', 'none');

	      d3.select('#first-dynamic-menu').style('display', 'none')
	      d3.select('#second-dynamic-menu').style('display', 'none')

	      d3.select('#comparison-menu').html('<p class="options-panel-section">Race/Ethnicity</p>')
	      d3.select('#comparison-menu').selectAll('div.race-ethnicity-radios')
	       .data(RACE_OPTIONS)
	       .enter()
	       .append('div')
	       .classed('race-ethnicity-radios', true)
	       //.classed("checked", function(d){ return d === higherEdSelections.singleRace })// this becomes a function using singleRace
	       .html(function(d){ return radioButtonTemplater(d) })
	  }
	  //second menu should always be collapsed on load
	  d3.select('#second-dynamic-menu > div.collapsible').classed('collapsed', true)

		//sector boxes - updates arraySector
		d3.selectAll('.sector-boxes').on('click', function(){

			var userChoice = this.value;
			var checkbox = d3.select(this);
			var selectionIndex = higherEdSelections.arraySectors.indexOf(translate[userChoice]);

				//switching from 4 year to 2
			if (checkbox.classed('two-year') && higherEdSelections.programLength === 'four'){
				//switch over all the checked's and reset the arraySectors to just be the new userchoice
				convertSelectors('two')
				higherEdSelections.arraySectors = [translate[userChoice]] //array starts fresh with current selection

				// d3.selectAll('.four-year').classed('checked', false);
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

				// d3.selectAll('.two-year').classed('checked', false)
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

			//if the box is being unchecked (i.e., was in arraySectors already) but the selections array is now empty
			if (selectionIndex > -1 && higherEdSelections.arraySectors.length < 1){
		      higherEdSelections.arraySectors.push(translate[userChoice])
		      d3.select('input[value=' + userChoice + ']').property('checked', true)
			}
			callSectorLine()
			callBarChart(higherEdSelections.year, true);

		})//end sector boxes


		//sector radios - updates singleSector
		d3.selectAll('.sector-radios').on('click', function(){
			higherEdSelections.singleSector = translate[this.value];

			if (d3.select(this).classed('two-year')){
				convertSelectors('two')
			} else {
				convertSelectors('four')
			}

			var sectorLength = higherEdSelections.programLength === 'two' ? '' : ' 4-Year'
			d3.select('#second-chart-container > h4 > span').text(higherEdSelections.singleSector + sectorLength);
			callRaceLine();
		})

		//race boxes - updates arrayRaces
		d3.selectAll('.race-checkbox').on('click', raceCheckboxListener)

		//race radios - updates singleRace
		d3.selectAll('.race-ethnicity-radios').on('click', function(){
			var userChoice = d3.select(this).datum();
			higherEdSelections.singleRace = userChoice;
		    if (chartType === 'by-sector-chart'){
		  		d3.select('#third-chart-container > h4 > span').text(translateRace[userChoice]);
		  		// d3.select('input[value=' + userChoice + ']').property('checked', true)

		  		callSectorLine();
		    } else if (chartType === 'multiple-schools'){
		      callComparisonChart();
		    }
		})

		//now make all the checked radios & boxes match current selections
		d3.select('div.race-ethnicity-radios> div > label > input[value=' + higherEdSelections.singleRace + ']').property('checked', true);

		d3.select('input.sector-radios[value=' + translateBack[higherEdSelections.singleSector] + ']').property('checked', true)
		d3.selectAll('.race-checkbox-wrapper > div > input')
			.property('checked', function(d){ return higherEdSelections.arrayRaces.indexOf(this.value) > -1 });
		d3.selectAll('input.sector-boxes')
			.property('checked', function(d){ return higherEdSelections.arraySectors.indexOf(translate[this.value]) > -1 });


		if (higherEdSelections.programLength === 'four'){
			d3.selectAll('.two-year').classed('inactive', true);
			d3.selectAll('.four-year, .program-type').classed('inactive', false);
		} else if (higherEdSelections.programLength === 'two'){
			d3.selectAll('.two-year').classed('inactive', false);
			d3.selectAll('.four-year, .program-type').classed('inactive', true);
		}

		if ( higherEdSelections.chartType === 'by-sector-chart' || higherEdSelections.chartType === 'by-race-chart' ){
			d3.selectAll('div.sub-choice').classed('active-unselected', true)
		}

		//mouseovers and shrinky buttons

		 d3.selectAll('.options-panel-section').append('span').attr('class', 'minimize').html('&#8212').on('click', function(){
			var div = this.parentElement.parentElement.getAttribute('id')
			d3.select('#' + div + '> div.collapsible').classed('collapsed', !d3.select('#' + div + '> div.collapsible').classed('collapsed'))

	    	this.innerHTML === '—' ? d3.select(this).html('+') : d3.select(this).html('&#8212')
	    })
		 //second menu collapsed by default
		d3.select('#second-dynamic-menu > p > span.minimize').html('+')

		 if ( higherEdSelections.chartType === 'one-school-all-races-container' || higherEdSelections.chartType === 'multiple-schools'){
		 	d3.selectAll('.minimize').remove();
		 }

		// var panelMouseover = d3.select('body').append('div')
		//     .attr('class', 'tooltip panelmouseover')
		//     .style('opacity', 0);

		d3.selectAll('.more-info').on('mouseover', function(){
	    	panelMouseover
	    		.style('opacity', 1)
	        	.html('Comparisons between 4-year and 2-year colleges aren’t available because we use different age groups for our analyses of the two institution levels’ potential pool of students.')
	            .style('left', (d3.event.pageX + 20) + 'px')
	            .style('top', (d3.event.pageY - 28) + 'px');
		}).on('mouseout', function(d) {
	        	panelMouseover.style('opacity', 0);
	    });



	if (IS_MOBILE){
    	if (higherEdSelections.chartType === 'single-year-bar'){
    		d3.select('#race-ethnicity-filter').style('display', 'none')
    		d3.select('#sector-filter').style('display', 'inline-block')
    		d3.select('#mobile-filter-options > h4').style('visibility', 'visible').text('Choose sectors')
    		d3.select('#year-input-wrapper').style('display', 'block')
    	} else if (higherEdSelections.chartType === 'by-sector-chart'){
    		d3.select('#race-ethnicity-filter').style('display', 'inline-block')
    		d3.select('#sector-filter').style('display', 'none')
    		d3.select('#mobile-filter-options > h4').style('visibility', 'visible').text('Choose a race/ethnicity')
    		d3.select('#year-input-wrapper').style('display', 'none')
    	} else if (higherEdSelections.chartType === 'by-race-chart'){
    		d3.select('#race-ethnicity-filter').style('display', 'none')
    		d3.select('#sector-filter').style('display', 'inline-block')
    		d3.select('#mobile-filter-options > h4').style('visibility', 'visible').text('Choose a sector')
    		d3.select('#year-input-wrapper').style('display', 'none')
    	}
	}

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

function callBarChart(year, animate){
	if (higherEdSelections.chartType === 'single-year-bar'){
		d3.selectAll('div.sub-choice').classed('active-unselected', false)
	}
	var programLength = higherEdSelections.programLength === 'two' ? '2-Year ' : '4-Year ' ;
	if (higherEdSelections.geography === 'national'){

		d3.select('#first-chart-container > h4 > span:nth-child(1)').text(programLength + 'US');
	} else {
		d3.select('#first-chart-container > h4 > span:nth-child(1)').text(programLength + higherEdSelections.state);
	}

	var twoYears = ['Public 2-Year', 'For-Profit 2-Year']

	for ( var i = 0; i < higherEdSelections.arraySectors.length; i ++ ){
		//if a sector in the array IS a two year and the program length is four
		if ( twoYears.indexOf(higherEdSelections.arraySectors[i]) > -1 && higherEdSelections.programLength === 'four' ){
			convertSelectors('two')
		}
		//if a sector IS NOT a two year and program length is two
		if ( twoYears.indexOf(higherEdSelections.arraySectors[i]) < 0  &&  higherEdSelections.programLength === 'two' ){
			convertSelectors('four')
		}
	}

	FILTERED_BY_YEAR = filterDataByYear(year).filter(function(d){
		return higherEdSelections.arraySectors.indexOf(d[SECTOR_KEY]) > -1
	})
	drawBarChart(FILTERED_BY_YEAR, animate)
}

function callSectorLine(){
	d3.select('#third-chart-container > h4 > span:nth-child(1)').text(translateRace[higherEdSelections.singleRace]);
	var sectorLength = higherEdSelections.programLength === 'two' ? '2-Year ' : '4-Year '
	if (higherEdSelections.geography === 'state'){
		d3.select('#third-chart-container > h4 > span:nth-child(2)').text(sectorLength + higherEdSelections.state);
	} else if (higherEdSelections.geography === 'national'){
		d3.select('#third-chart-container > h4 > span:nth-child(2)').text(sectorLength + 'US');
	}
	var twoYears = ['Public 2-Year', 'For-Profit 2-Year']

	for ( var i = 0; i < higherEdSelections.arraySectors.length; i ++ ){
		//if a sector in the array IS a two year and the program length is four
		if ( twoYears.indexOf(higherEdSelections.arraySectors[i]) > -1 && higherEdSelections.programLength === 'four' ){
			convertSelectors('two')
		}
		//if a sector IS NOT a two year and program length is two
		if ( twoYears.indexOf(higherEdSelections.arraySectors[i]) < 0  &&  higherEdSelections.programLength === 'two' ){
			convertSelectors('four')
		}
	}
// console.log(higherEdSelections)
	var sectors = makeSectorNest();
	sectors = sectors.filter(function(d){ return higherEdSelections.arraySectors.indexOf(d.key) > -1 })
	drawLineChart(sectors, 'race', byRaceSVG, byRaceG, byRaceAxis);
}

function callRaceLine(){

	var twoYears = ['Public 2-Year', 'For-Profit 2-Year']

	for ( var i = 0; i < higherEdSelections.arraySectors.length; i ++ ){
		//if a sector in the array IS a two year but the program length is four
		if ( twoYears.indexOf(higherEdSelections.arraySectors[i]) > -1 && higherEdSelections.programLength === 'four' ){
			convertSelectors('two')
		}
		//if a sector IS NOT a two year and program length is two
		if ( twoYears.indexOf(higherEdSelections.arraySectors[i]) < 0  &&  higherEdSelections.programLength === 'two' ){
			convertSelectors('four')
		}
	}

	//if the singleSector is a two year school, set everything to 'two', otherwise 'four'
	if (twoYears.indexOf(higherEdSelections.singleSector) > -1 ){
		convertSelectors('two')
	} else {
		convertSelectors('four')
	}

	var demos = makeDemogNest(higherEdSelections.singleSector);
	demos = demos.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
	drawLineChart(demos, 'sector', bySectorSVG, bySectorG, bySectorYAxis)
}

function callComparisonChart(){
	d3.select('#school-comparison').property('checked', true);
	  	//filter school data to that sector && state
	  	//dumb naming alert: all teh schools are in 'schoolfour', there is no 'schooltwo'
	var comparisons = higherEdData.allData.schoolfour.filter(function(d){
		return d.fourcat === higherEdSelections.singleSector && d.fips_ipeds === higherEdSelections.state
	})

	//now pull out the state level data for the selected sector && state to be the average line on the chart
	//this goes wrong when another view has changed the programLEngth but this one is still on default

	var pgmLength = higherEdData.allData.schoolfour.filter(function(sch){return sch.inst_name === higherEdSelections.selectedSchool })[0].slevel

	higherEdSelections.programLength = pgmLength === '4-year' ? 'four' : 'two'

	var stateAverage = higherEdData.allData['state' + higherEdSelections.programLength].filter(function(d){
		return d[higherEdSelections.programLength + 'cat'] === higherEdSelections.singleSector &&
		d.fips_ipeds === higherEdSelections.state
	})

	var nestedState = d3.nest().key(function(d){ return d.fips_ipeds }).entries(stateAverage);
	nestedState[0].key = 'State average'
	var nestedBySchool = d3.nest().key(function(d){ return d.inst_name }).entries(comparisons);

	var chartData = nestedBySchool.concat(nestedState)
	d3.select('#fourth-chart-container > h4 > span:nth-child(1)').text(translateRace[higherEdSelections.singleRace] + ' ')
	d3.select('#fourth-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state + ' ' + higherEdSelections.singleSector + ' Colleges');
	drawLineChart(chartData, 'comparison', oneSchoolSVG, oneSchoolG, oneSchoolYAxis)
}

function callSchoolChart(){
  var schoolDataByRace = makeDemogNest(higherEdSelections.selectedSchool, true);
  d3.select('#fourth-chart-container > h4 > span:nth-child(1)').text('')
  d3.select('#fourth-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.selectedSchool);
  schoolDataByRace = schoolDataByRace.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })

  var actualProgramLength = ''
  if (higherEdSelections.singleSector !== 'Public 2-Year' && higherEdSelections.singleSector !== 'For-Profit 2-Year'){
  	actualProgramLength = '4-year '
  }

  d3.select('#school-description > span').text('Sector: ' + actualProgramLength + higherEdSelections.singleSector.toLowerCase())
  d3.select('#comparison-def > span').text(higherEdSelections.state)

  drawLineChart(schoolDataByRace, 'sector', oneSchoolSVG, oneSchoolG, oneSchoolYAxis)
}

function makeDropdown(data){
  data.sort(function(a, b){
    return a.localeCompare(b);
  })

  var select = d3.select('#dropdown')

  var options = select.selectAll('option')
                      .data(data)
                      .enter()
                      .append('option')
                      .text(function(d){ return d })
                      .attr('value', function(d){ return d })
                      .property('selected', function(d){ return d === higherEdSelections.state })

  $('#dropdown').selectmenu({
  	change: menuSelected
  })
}

function menuSelected(){
	higherEdSelections.state = this.value;

	d3.select('#third-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
	d3.select('#second-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);

	higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
		return d.fips_ipeds === higherEdSelections.state;
	})

  callBarChart(higherEdSelections.year, true);
  callSectorLine()
  callRaceLine()
}

function makeSchoolLookup(){
	var schools = d3.nest().key(function(d){
		return d.unitid })
	.entries(higherEdData.allData.schoolfour)

	schools.map(function(d){
		return d.label = d.values[0].inst_name
	})

  $( '#school-lookup' )
  .focus(function(){
  	this.value = ''
  })
  .autocomplete({
    source: schools,
    select: function(event, ui){


      d3.select('#school-lookup').classed('active', true)
      d3.select('#school-lookup-icon').classed('active', true).attr('src', 'images/closeIcon.png')

      higherEdSelections.selectedSchool = ui.item.value;
      								//this will always be 'schoolfour'
      var schoolDatum = higherEdData.allData[SELECTED_DATASET].filter(function(d){
      	return d.inst_name === higherEdSelections.selectedSchool })[0]

      higherEdSelections.programLength = schoolDatum.slevel === '4-year' ? 'four' : 'two' ;
      //all school stuff is schoolfour/fourcat
      SECTOR_KEY = 'fourcat'
      higherEdSelections.state = schoolDatum.fips_ipeds
      higherEdSelections.singleSector = schoolDatum[SECTOR_KEY]
      higherEdSelections.arraySectors = [schoolDatum[SECTOR_KEY]]

  	var length = higherEdSelections.programLength === 'two' ? '' : '4-year '


      d3.select('#school-description > span')
      	.text('Sector: ' + length +  schoolDatum[SECTOR_KEY].toLowerCase())

      d3.select('#comparison-def > span').text(schoolDatum.fips_ipeds)

      if (higherEdSelections.chartType === 'multiple-schools'){
       	callComparisonChart();
      } else {
      	callSchoolChart();
      }
    }
  });
  d3.select('#school-lookup-icon').on('click',function(){
  	if(d3.select(this).classed('active')){
  		var schoolLookup = d3.select('#school-lookup')
  		schoolLookup.classed('active', false)
  		d3.select(this).classed('active', false)
  			.attr('src', 'images/searchIcon.png')

  		schoolLookup.property('value','Start typing...')

  		d3.select('#school-description > span').html('&nbsp;')
  	}
  })
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
		.width(IS_MOBILE ? chartHole - 70 : 220)
		.tickFormat(function(d){ return '\'' + d3.timeFormat('%y')(d)})
		.tickValues(dataTime)
		.default(new Date(higherEdSelections.year, 10, 3))
    .handle(['M 1, 0 m -8.5, 0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0']) //draw a circle as a path: https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
		.on('onchange', function(val){

			higherEdSelections.year = timeFormat(val);
			callBarChart(higherEdSelections.year, false);
			d3.select('#first-chart-container > h4 > span:nth-child(2)').text(timeFormat(val));
		});


var gTime =
	d3.select('div#year-input')
		.append('svg')
		.attr('width', IS_MOBILE ? chartHole : 250)
		.attr('height', 60)
		.append('g')
		.attr('transform', 'translate(15,15)');

gTime.call(sliderTime);
d3.select('#first-chart-container > h4 > span:nth-child(2)').text(timeFormat(sliderTime.value()));


function initializeStaticControls(){
	//event listener party
	d3.selectAll('.geography-choices').on('click', function(){

		var userChoice = this.getAttribute('data-cat');

		higherEdSelections.geography = userChoice

		d3.selectAll('.geography-choices').classed('selected', false)
		d3.select(this).classed('selected', !d3.select(this).classed('selected'))


		if ( userChoice === 'state'){

			if (!IS_MOBILE){
				d3.select('#first-dynamic-menu').style('display', 'block');
				d3.select('#second-dynamic-menu').style('display', 'block');
			} else {
				d3.select('#mobile-filter-options').style('display', 'inline')
			}
			d3.selectAll('#first-chart-container > h4 > span:nth-child(1), #third-chart-container > h4 > span:nth-child(2), #second-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			d3.select('#time-selection').style('display', 'block');
			d3.select('#school-selection').style('display', 'none');
			d3.selectAll('.time-selector').classed('selected', false);

			if (higherEdSelections.chartType === 'by-sector-chart' || higherEdSelections.chartType === 'by-race-chart'){
				d3.selectAll('.time-selector.main-choice.line').classed('selected', true);
				//d3.select(".disable-box").style("display", "none")
				d3.selectAll('div.sub-choice').classed('active-unselected', true)
				d3.select('div.sub-choice[value=\'' + higherEdSelections.chartType + '\']').classed('selected', true)
			} else {
				d3.select('.time-selector.main-choice.bar').classed('selected', true);
			}


				//create state dropdown menu
			makeDropdown(US_STATES);
			d3.select('#state-menu').style('display', 'block');
			$('#dropdown').val(higherEdSelections.state)
			$('#dropdown').selectmenu('refresh')

			//global selectors
			SELECTED_DATASET = 'filteredForState';
			SECTOR_KEY = higherEdSelections.programLength === 'four' ? 'fourcat' : 'twocat';

			//filter state data to just selected state
			higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
				return d.fips_ipeds === higherEdSelections.state;
			})
			// if coming from a chart type that isn't shared by 'state' view, show the bar chart as default
			if (higherEdSelections.chartType === 'one-school-all-races-container' || higherEdSelections.chartType === 'multiple-schools'){
				showChart('single-year-bar')
				higherEdSelections.chartType = 'single-year-bar'
				d3.select('.disable-box').style('visibility', 'hidden')
			}
		} else if ( userChoice === 'national' ){
		    if (!IS_MOBILE){
			    d3.select('#first-dynamic-menu').style('display', 'block')
			    d3.select('#second-dynamic-menu').style('display', 'block')
		    } else {
		    	d3.select('#mobile-filter-options').style('display', 'inline')
		    }

			d3.select('#time-selection').style('display', 'block');
			d3.select('#state-menu').style('display', 'none')
			d3.select('#school-selection').style('display', 'none')
			d3.selectAll('#first-chart-container > h4 > span:nth-child(1), #second-chart-container > h4 > span:nth-child(2), #third-chart-container > h4 > span:nth-child(2)').text('US');
			//selectors updated
			SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength
		      //the chart types aren't shared between school and national/state, so it amkes sense to reset
		      //to default bar chart when going back to national or state from school
			if (higherEdSelections.chartType === 'one-school-all-races-container' || higherEdSelections.chartType === 'multiple-schools'){
			  showChart('single-year-bar')
		      d3.selectAll('.time-selector').classed('selected', false);
		      d3.select('.time-selector.main-choice.bar').classed('selected', true);
		      d3.select('.disable-box').style('visibility', 'hidden')
		  	  higherEdSelections.chartType = 'single-year-bar'
			}

		} else if ( userChoice === 'school' ){
      		d3.select('#school-comparison').property('checked', false);
      		d3.select('#school-lookup').attr('value', higherEdSelections.selectedSchool);


      		if (IS_MOBILE){
      			d3.select('#mobile-filter-options').style('display', 'none')
      		}

      		higherEdSelections.geography = 'school'

			SELECTED_DATASET = 'schoolfour';
			higherEdSelections.chartType = 'one-school-all-races-container'

			makeSchoolLookup();
			showChart(higherEdSelections.chartType);
			callSchoolChart();
	    }

	    if (userChoice !== 'school'){
	        //all these use SELECTED_DATASET inside the filtering/nesting functions
	    	callBarChart(higherEdSelections.year, true);
	    }

	    if (higherEdSelections.chartType === 'by-race-chart'){
	    	callRaceLine()
	    } else if (higherEdSelections.chartType === 'by-sector-chart'){
	    	callSectorLine()
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
		d3.selectAll('div.sub-choice').classed('active-unselected', false)

		if (chart === 'by-sector-chart'){
			d3.select('.time-selector.bar').classed('selected', false);
			d3.select('.time-selector.line.main-choice').classed('selected', true);
			d3.selectAll('div.sub-choice').classed('active-unselected', true)
			d3.select('.disable-box').style('visibility', 'visible')
			// d3.select('#third-chart-container > h4 > span:nth-child(1)').text(translateRace[higherEdSelections.singleRace]);
			// if (higherEdSelections.geography === 'state'){
			// 	d3.select('#third-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			// }
			callSectorLine();
		} else if (chart === 'by-race-chart'){
			d3.select('.race').classed('selected', true);
			d3.select('.time-selector.bar').classed('selected', false);
			d3.select('.time-selector.line.main-choice').classed('selected', true);
			d3.selectAll('div.sub-choice').classed('active-unselected', true)
			var sectorLength = higherEdSelections.programLength === 'two' ? '' : ' 4-Year'
			d3.select('#second-chart-container > h4 > span:nth-child(1)').text(higherEdSelections.singleSector + sectorLength);
			d3.select('.disable-box').style('visibility', 'visible')
			if (higherEdSelections.geography === 'state'){
				d3.select('#second-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			}
			callRaceLine();
		} else if ( chart === 'single-year-bar' ){
			d3.select('.time-selector.bar').classed('selected', true);
			d3.select('.time-selector.line.main-choice').classed('selected', false);
			d3.select('.disable-box').style('visibility', 'hidden')

			callBarChart(higherEdSelections.year, false);
		}

		showChart(chart);
		buildOptionPanel(chart);
	})

	d3.selectAll('.scenario.clickable').on('click', function(d){
		var scenarioID = this.getAttribute('id')

		if (scenarioID === 'scenario1'){
			higherEdSelections.arrayRaces = RACE_OPTIONS
			higherEdSelections.singleSector = 'Public More Selective'
			higherEdSelections.chartType = 'by-race-chart'
			higherEdSelections.geography = 'national'
			higherEdSelections.programLength = 'four'
			SELECTED_DATASET = 'nationalfour'
			SECTOR_KEY = 'fourcat'


			d3.select('#state-menu').style('display', 'none')
			d3.select('#school-selection').style('display', 'none')
			d3.select('#first-chart-container > h4 > span:nth-child(1)').text('US');
      		d3.select('#second-chart-container > h4 > span:nth-child(2)').text('US');
		    d3.select('#third-chart-container > h4 > span:nth-child(2)').text('US');

		    d3.select('.race').classed('selected', true);
			d3.select('.time-selector.bar').classed('selected', false);
			d3.select('.time-selector.line.main-choice').classed('selected', true);
			d3.select('.time-selector.line.sub-choice.by-sector').classed('active-unselected', true).classed('selected', false)
			var sectorLength = higherEdSelections.programLength === 'two' ? '' : ' 4-Year'
			d3.select('#second-chart-container > h4 > span:nth-child(1)').text(higherEdSelections.singleSector + sectorLength);

			if (!IS_MOBILE){
				d3.select('#time-selection').style('display', 'block');
			    d3.select('#first-dynamic-menu').style('display', 'block')
			    d3.select('#second-dynamic-menu').style('display', 'block')
				d3.select('.disable-box').style('visibility', 'visible')
			}

			callRaceLine()
			d3.select('path.data-line.dif_white').attr('stroke-width', 4)

		} else if (scenarioID === 'scenario2') {
			higherEdSelections.singleRace = 'dif_hispa'
			higherEdSelections.arraySectors = ['For-Profit', 'Private More Selective', 'Private Nonselective', 'Private Selective', 'Public More Selective', 'Public Nonselective', 'Public Selective']
			higherEdSelections.chartType = 'by-sector-chart'
			higherEdSelections.geography = 'state'
			higherEdSelections.programLength = 'four'
			SELECTED_DATASET = 'filteredForState'
			SECTOR_KEY = 'fourcat'
			higherEdSelections.state = 'California'

			d3.select('#first-chart-container > h4 > span:nth-child(1)').text(higherEdSelections.state);
			d3.select('#third-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			d3.select('#second-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);

			d3.select('#school-selection').style('display', 'none');
		    d3.selectAll('.time-selector').classed('selected', false);
	        d3.selectAll('.time-selector.main-choice.line').classed('selected', true);
	        d3.selectAll('div.sub-choice').classed('active-unselected', true);
	        d3.select('div.sub-choice[value=\'' + higherEdSelections.chartType + '\']').classed('selected', true);

	        if (!IS_MOBILE){
	        	d3.select('#time-selection').style('display', 'block');
			    d3.select('#first-dynamic-menu').style('display', 'block');
			    d3.select('#second-dynamic-menu').style('display', 'block');
		        d3.select('.disable-box').style('visibility', 'visible')
	        }

			//create state dropdown menu
			makeDropdown(US_STATES);
			d3.select('#state-menu').style('display', 'block');
			$('#dropdown').val(higherEdSelections.state)
			$('#dropdown').selectmenu('refresh')

			//filter state data to just selected state
			higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
				return d.fips_ipeds === higherEdSelections.state;
			})
			// if coming from a chart type that isn't shared by 'state' view, show the bar chart as default
			if (higherEdSelections.chartType === 'one-school-all-races-container' || higherEdSelections.chartType === 'multiple-schools'){
				showChart('single-year-bar')
				higherEdSelections.chartType = 'single-year-bar'
			}

	    	callSectorLine();
		} else if (scenarioID === 'scenario3'){
			higherEdSelections.arrayRaces = RACE_OPTIONS
			higherEdSelections.chartType = 'one-school-all-races-container'
			higherEdSelections.geography = 'school'
			higherEdSelections.programLength = 'four'
			SELECTED_DATASET = 'schoolfour'
			SECTOR_KEY = 'fourcat'
			higherEdSelections.state = 'Michigan'
			higherEdSelections.selectedSchool = 'Wayne State University'

			d3.select('#school-comparison').property('checked', false);
			d3.select('#fourth-chart-container > h4 > span:nth-child(2)').text('Wayne State University')

			makeSchoolLookup();
			callSchoolChart();
			d3.select('path.data-line.dif_black').attr('stroke-width', 4)

			d3.select('#school-lookup').property('value', 'Wayne State University')
      d3.select('#comparison-def > span').text('Michigan')
		}
		d3.selectAll('div.geography-choices').classed('selected', false)
		d3.select('div.geography-choices[data-cat="' + higherEdSelections.geography + '"]').classed('selected', true)
		buildOptionPanel(higherEdSelections.chartType)
		showChart(higherEdSelections.chartType)
	})

} //end initializeStaticContols

d3.selectAll('.filter-btn').on('click', function(){
	var scootch = window.innerWidth - 192 + 'px',
		btnID = this.getAttribute('id');
	d3.select('.pop-up-menu').remove();
	if (higherEdSelections.chartType === 'single-year-bar'){
		var div = d3.select('div.slider').append('div').attr('class', 'pop-up-menu')
		div.append('span').attr('id', 'close-btn').style('left', window.innerWidth - 74 + 'px').style('top', '30px').html('&times;').on('click', function(){
			d3.selectAll('.slider').classed('close', true)
		})
		div.append('div').html(COLLEGE_SECTOR_CHECKBOXES)
			d3.selectAll('.sector-boxes').on('click', function(){

			var userChoice = this.value;
			var checkbox = d3.select(this);
			var selectionIndex = higherEdSelections.arraySectors.indexOf(translate[userChoice]);

				//switching from 4 year to 2
			if (checkbox.classed('two-year') && higherEdSelections.programLength === 'four'){
				//switch over all the checked's and reset the arraySectors to just be the new userchoice
				convertSelectors('two')
				higherEdSelections.arraySectors = [translate[userChoice]] //array starts fresh with current selection

				// d3.selectAll('.four-year').classed('checked', false);
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

				// d3.selectAll('.two-year').classed('checked', false)
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

			//if the box is being unchecked and the selections array is empty
			if (selectionIndex > 0 && higherEdSelections.arraySectors.length < 1){
				//alert('Please pick at least one sector')
		      higherEdSelections.arraySectors.push(translate[userChoice])
		      d3.select('.sector-boxes > div > input[value=' + userChoice + ']').property('checked', true)
			}

			callBarChart(higherEdSelections.year, true);

		})//end sector boxes
		//sync the checkmarks with the current selections
		d3.selectAll('input.sector-boxes')
			.property('checked', function(d){ return higherEdSelections.arraySectors.indexOf(translate[this.value]) > -1 });


	} else if (higherEdSelections.chartType === 'by-sector-chart'){
		var div = d3.select('div.slider').append('div').attr('class', 'pop-up-menu').style('margin-top', '35px')
		div.append('p').attr('class', 'options-panel-section').style('display', 'inline').text('Race/Ethnicity')
		div.append('span').attr('id', 'close-btn').style('left', scootch).html('&times;').on('click', function(){
			d3.selectAll('.slider').classed('close', true)
		})
		div.selectAll('div.race-ethnicity-radios')
			.data(RACE_OPTIONS)
			.enter()
			.append('div')
			.classed('race-ethnicity-radios', true)
			.html(function(d){ return radioButtonTemplater(d) })
			.on('click', function(){
				var userChoice = d3.select(this).datum();
				console.log(userChoice)
				higherEdSelections.singleRace = userChoice;
			    if (higherEdSelections.chartType === 'by-sector-chart'){
			  		d3.select('#third-chart-container > h4 > span').text(translateRace[userChoice]);
			  		d3.select('div.race-ethnicity-radios> div > label > input[value=' + higherEdSelections.singleRace + ']').property('checked', true);
			  		callSectorLine();
			    } else if (chartType === 'multiple-schools'){
			      callComparisonChart();
			    }

			})
	} else if (higherEdSelections.chartType === 'by-race-chart'){
		var div = d3.select('div.slider').append('div').attr('class', 'pop-up-menu')
		div.append('span').attr('id', 'close-btn').style('left', window.innerWidth - 70 + 'px').style('top', '30px').html('&times;').on('click', function(){
			d3.selectAll('.slider').classed('close', true)
		})
		div.append('div').html(COLLEGE_SECTOR_RADIOS)
		d3.selectAll('.sector-radios').on('click', function(){

			higherEdSelections.singleSector = translate[this.value];
			if (d3.select(this).classed('two-year')){
				convertSelectors('two')
			} else {
				convertSelectors('four')
			}
			var sectorLength = higherEdSelections.programLength === 'two' ? '' : ' 4-Year'
			d3.select('#second-chart-container > h4 > span').text(higherEdSelections.singleSector + sectorLength);
			callRaceLine();
		})
	}

	d3.selectAll('.more-info').on('click', function(){
		d3.event.stopPropagation();
    	panelMouseover
    		.style('opacity', 1)
        	.html('Comparisons between 4-year and 2-year colleges aren’t available because we use different age groups for our analyses of the two institution levels’ potential pool of students.')
            .style('left', '20px')
            .style('top', (d3.event.pageY -100) + 'px');
	})

	d3.select('.pop-up-menu').on('click', function(){
		if (d3.select('.panelmouseover').style('opacity') === '1'){
			panelMouseover
				.html('')
				.style('opacity', 0)
		}
	})

  	d3.selectAll('.slider').classed('close', false)
});


function raceCheckboxListener(){

	var userChoice = d3.select(this).attr('value')
	var checked = d3.select('input[value="' + userChoice + '"]').property('checked')

	if (checked){
		higherEdSelections.arrayRaces.push(userChoice)
	} else {
		higherEdSelections.arrayRaces = higherEdSelections.arrayRaces.filter(function(d){
			return d !== userChoice
		})
	}


	if (higherEdSelections.arrayRaces.length < 1){
		//force there to be at least one
		higherEdSelections.arrayRaces = [userChoice]
		d3.select('input[value="' + userChoice + '"]').property('checked', true)
	}
	if (higherEdSelections.chartType === 'one-school-all-races-container'){
      callSchoolChart();
    } else {
		callBarChart(higherEdSelections.year, true)
     	callRaceLine();
    }


}



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

	if (SELECTED_DATASET === 'schooltwo'){ SELECTED_DATASET = 'schoolfour'}
	var nest = d3.nest().key(function(d){
		return d[SECTOR_KEY]
	}).entries(higherEdData.allData[SELECTED_DATASET]);
	return nest;
}


function makeDemogNest(sector, isSchoolData){

	var nestedByDemog = [],
		schoolOrSector;

	if (higherEdSelections.geography === 'state'){
		higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
			return d.fips_ipeds === higherEdSelections.state;
		})
	}

	if (isSchoolData){
		var schoolID = higherEdData.allData.schoolfour.filter(function(d){
			return d.inst_name === higherEdSelections.selectedSchool
		})[0].unitid

										//schools dumped into one csv named schoolfour
		schoolOrSector = higherEdData.allData.schoolfour.filter(function(d){
					return d.unitid === schoolID
				})
		higherEdSelections.state = schoolOrSector[0].fips_ipeds;
		higherEdSelections.singleSector = schoolOrSector[0].fourcat;
	} else {
		schoolOrSector = higherEdData.allData[SELECTED_DATASET].filter(function(d){
							return d[SECTOR_KEY] === sector
						})
	}

	for (var i = 0; i < RACE_OPTIONS.length; i++){
		nestedByDemog.push({'key': RACE_OPTIONS[i], 'values': []})
		schoolOrSector.forEach(function(yearData){
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

	//more stuff to fix up from params
	//if there's not a search string
	if (location.search === ''){

		//if there's no search string, races will always be the same
		// higherEdSelections.arrayRaces = Object.keys(translateRace)
		//and sectors will depend on if it's a two-year
		if (higherEdSelections.singleSector === 'Public 2-Year' || location.search !== '' && higherEdSelections.singleSector === 'For-Profit 2-Year'){
			higherEdSelections.arraySectors = Object.keys(translateBack).slice(7,9)
		} else {
			higherEdSelections.arraySectors = Object.keys(translateBack).slice(0,7)
		}

	} else {
		if (higherEdSelections.singleSector === 'Public 2-Year' || higherEdSelections.singleSector === 'For-Profit 2-Year'){
			//be sure the program length is right
			higherEdSelections.programLength = 'two'
		} else {
			higherEdSelections.programLength = 'four'
		}

		if (higherEdSelections.chartType === 'one-school-all-races-container'){
			//the queryparams function doesn't move singleSector selection into arraySectors
			higherEdSelections.arraySectors = [higherEdSelections.singleSector]
		}

		if (higherEdSelections.chartType !== 'single-year-bar'){
			d3.select('.disable-box').style('visibility', 'visible')
		}
	}
}

function init(){
	resize();
	addArrowsToHighlights();
	RACE_OPTIONS = higherEdData.allData.nationalfour.columns.slice(2)
	prepareData();

	buildOptionPanel(higherEdSelections.chartType);
	initializeStaticControls();
  //can't find the option to move text on slider in the package: https://github.com/johnwalley/d3-simple-slider
  	d3.selectAll('#year-input > svg > g > g.axis > g > text').attr('y', 12)
  	d3.select('#year-input > svg > g > g.slider > g > text').attr('y', 19).style('font-size', 14)

  	//what if i sprinkle this all over
	if (higherEdSelections.singleSector === 'Public 2-Year' || higherEdSelections.singleSector === 'For-Profit 2-Year'){
		//be sure the program length is right
		higherEdSelections.programLength = 'two'
		convertSelectors('two')
	} else {
		higherEdSelections.programLength = 'four'
	}


  	if(higherEdSelections.geography == 'national'){

		d3.select('#time-selection').style('display', 'block');
		d3.select('#state-menu').style('display', 'none')
		d3.select('#school-selection').style('display', 'none')
		d3.select('#first-chart-container > h4 > span:nth-child(1)').text('US');
  		d3.select('#second-chart-container > h4 > span:nth-child(2)').text('US');
	    d3.select('#third-chart-container > h4 > span:nth-child(2)').text('US');
		if (!IS_MOBILE){
			d3.select('#first-dynamic-menu').style('display', 'block');
			d3.select('#second-dynamic-menu').style('display', 'block');
		} else {
			d3.select('#mobile-filter-options').style('display', 'inline')
		}
  	} else if(higherEdSelections.geography == 'state'){
		d3.select('#first-chart-container > h4 > span:nth-child(1)').text(higherEdSelections.state);
		d3.select('#third-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
		d3.select('#second-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.state);

		d3.select('#time-selection').style('display', 'block');
		d3.select('#school-selection').style('display', 'none');

		if (!IS_MOBILE){
			d3.select('#first-dynamic-menu').style('display', 'block');
			d3.select('#second-dynamic-menu').style('display', 'block');
		} else {
			d3.select('#mobile-filter-options').style('display', 'inline')
		}

		makeDropdown(US_STATES);
		d3.select('#state-menu').style('display', 'block');

		//filter state data to just selected state
		higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
			return d.fips_ipeds === higherEdSelections.state;
		})

  	}
  	else if(higherEdSelections.geography == 'school'){
			d3.select('#school-comparison').property('checked', false);
			d3.select('#fourth-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.selectedSchool)
			d3.select('#school-lookup').attr('value', higherEdSelections.selectedSchool)
			makeSchoolLookup()

  	}
  		//crap
	  var actualProgramLength = ''
	  if (higherEdSelections.singleSector !== 'Public 2-Year' && higherEdSelections.singleSector !== 'For-Profit 2-Year'){
	  	actualProgramLength = '4-year '
	  }

	switch(higherEdSelections.chartType){

		case 'single-year-bar':
			callBarChart(higherEdSelections.year, false);
			d3.selectAll('.time-selector').classed('selected', false);
			d3.select('.time-selector.main-choice.bar').classed('selected', true);
			d3.selectAll('div.sub-choice').classed('active-unselected', false)
			break;
		case 'by-sector-chart':
			callSectorLine();
			d3.selectAll('.time-selector').classed('selected', false);
			d3.selectAll('.time-selector.main-choice.line').classed('selected', true);
			d3.selectAll('div.sub-choice').classed('active-unselected', true);
			d3.select('div.sub-choice[value=\'' + higherEdSelections.chartType + '\']').classed('selected', true)
			break;
		case 'by-race-chart':
			callRaceLine();
			d3.selectAll('.time-selector').classed('selected', false);
			d3.selectAll('.time-selector.main-choice.line').classed('selected', true);
			d3.selectAll('div.sub-choice').classed('active-unselected', true);
			d3.select('div.sub-choice[value=\'' + higherEdSelections.chartType + '\']').classed('selected', true)
			break;
		case 'one-school-all-races-container':
			callSchoolChart();
			// var sLevel = higherEdSelections.programLength === 'two' ? '' : '4-year '
			d3.select('#school-description > span').text('Sector: ' + actualProgramLength + higherEdSelections.singleSector.toLowerCase())
      		d3.select('#comparison-def > span').text(higherEdSelections.state)

			break;

		case 'multiple-schools':
			callComparisonChart();
			// var sLevel = higherEdSelections.programLength === 'two' ? '' : '4-year '
			d3.select('#school-description > span').text('Sector: ' + actualProgramLength + higherEdSelections.singleSector.toLowerCase())
      		d3.select('#comparison-def > span').text(higherEdSelections.state)
			break;
	}

	d3.selectAll('div.geography-choices').classed('selected', false)
	d3.select('div.geography-choices[data-cat="' + higherEdSelections.geography + '"]').classed('selected', true)
	buildOptionPanel(higherEdSelections.chartType)
	showChart(higherEdSelections.chartType)
  	d3.select('#first-chart-container > h4 > span:nth-child(2)').text(higherEdSelections.year);
	//draw your default chart, bars for 2017: all races/sectors


	d3.select('#tmpClick').on('click', getShareUrl)

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


