

// Uncomment to enable Bootstrap tooltips
// https://getbootstrap.com/docs/4.0/components/tooltips/#example-enable-tooltips-everywhere
// $(function () { $('[data-toggle="tooltip"]').tooltip(); });

// Uncomment to enable Bootstrap popovers
// https://getbootstrap.com/docs/4.0/components/popovers/#example-enable-popovers-everywhere
// $(function () { $('[data-toggle="popover"]').popover(); });


//TODOs

//BUGS
//axis labels repeat a billion times and layer up
//in state view, clicking a 2 year college causes some error
// --> I think this is bc two-year colleges aren't actually loaded?
//data needs to be changed out

//FEATURES
//make chart responsive
//mouseover on legend highlights the corresponding line
//mouseover on comparison chart shows the name of the school in teh right margin
//clicking data highlights should do something
//add downloadable chart image
//make the URL update

//STYLING

//dropdown menus
//data hgihgliht boxes

//TEXT
//add axis titles





// the datas
var higherEdData = {};
	higherEdData.allData = {};

// the user selections
var higherEdSelections = {};
	higherEdSelections.geography = 'national', //national, state, school
	higherEdSelections.chartType = 'single-year-bar', //single-year-bar, by-sector-chart, by-race-chart, one-school-all-races, multiple-schools
	higherEdSelections.year = '2017',
	higherEdSelections.programLength = 'four',  //two, four
	higherEdSelections.singleRace = 'dif_hispa',
	higherEdSelections.singleSector = 'Public Nonselective',
	higherEdSelections.state = 'Alabama',
  	higherEdSelections.selectedSchool = 'Alabama A & M University',
	higherEdSelections.arrayRaces = [],
	higherEdSelections.arraySectors = []

var SECTOR_KEY = 'fourcat',
	SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength,
	NESTED_BY_SECTOR,
	NESTED_BY_RACE,
	FILTERED_BY_YEAR,
	STATE_DATA,
  	SCHOOL_NAMES,
  	RACE_OPTIONS;

var chartDivWidth = $('#chart-area-container').innerWidth(),
	aspectRatio

var margin = {top: 10, right: 10, bottom: 30, left: 40},
    barMargin = {top: 10, right: 10, bottom: 30, left: 0},
    // width = parseInt(d3.select("#chart-area-container").style("width")),
    // width = width - margin.left - margin.right,
    width = 600,
    height = 700 - margin.top - margin.bottom;

//the chart selections & their G's

//bar chart

var singleYearSVG = d3.select('#single-year-container').append('svg')
    .attr('width', width + barMargin.left + barMargin.right)

var barChartG = singleYearSVG.append('g')
    .attr('transform', 'translate(' + barMargin.left + ',' + barMargin.top + ')');

var barLegend = d3.select('#single-year-container > div.legend').append('ul')
  .attr('class', 'key')

// sectors are radios
var byRaceSVG = d3.select('#by-sector-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var byRaceG = byRaceSVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
var byRaceLegend = d3.select('#by-sector-container > div.legend').append('ul')
  .attr('class', 'key')
var byRaceAxis = byRaceSVG.append('g')
  .attr('class', 'grid')
  .attr('transform', 'translate(' + margin.left + ',0)')

// races are radios
var bySectorSVG = d3.select('#by-race-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var bySectorG = bySectorSVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
var bySectorLegend = d3.select('#by-race-container > div.legend').append('ul')
  .attr('class', 'key')
var bySectorYAxis = bySectorSVG.append('g')
  .attr('class', 'grid')
  .attr('transform', 'translate(' + margin.left + ',0)')

var oneSchoolSVG = d3.select('#one-school-all-races').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var oneSchoolG = oneSchoolSVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
var oneSchoolLegend = d3.select('#one-school-all-races > div.legend').append('ul')
  .attr('class', 'key')
var oneSchoolYAxis = oneSchoolSVG.append('g')
  .attr('class', 'grid')
  .attr('transform', 'translate(' + margin.left + ',0)')

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
	 'public-selective': 'Public Selective'
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

var colorArray = ['#ec008b','#55b748','#1696d2','#9d9d9d','#fdbf11','#000000','#0a4c6a', '#351123']

var color = d3.scaleOrdinal()
    .range(colorArray)

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
	var contentWidth = 600

	var chartScootch = {
		'single-year-bar': 0,
		'by-race-chart': contentWidth * -1,
		'by-sector-chart': contentWidth * -2,
    	'one-school-all-races': contentWidth * -3,
    	'multiple-schools': contentWidth * -4
	}
	d3.select('#single-year-container').transition().style('margin-left', chartScootch[chartType] + 'px')
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

	var color = d3.scaleOrdinal()
	    .range(colorArray);

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
    var x = d3.scaleLinear()
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
			.attr('x', x(0))//barMargin.left)
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
    .attr('x', function(d){ return +d.value > 0 ? x(0) : x(d.value) })
    .attr('fill', function(d){ return raceColorObj[d.key] })
	.attr('height', y1.bandwidth())
	.attr('width', function(d){ return +d.value > 0 ? x(d.value) - x(0) : (x(0) - x(d.value)) })

	rects.transition().duration(800)
		.attr('x', function(d){ return d.value > 0 ? x(0) : x(d.value) })
		.attr('width', function(d){ return d.value > 0 ? x(d.value) - x(0) : (x(0) - x(d.value)) })

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
	//scales
	var x = d3.scaleTime()
		.range([margin.left, width - margin.right])
		.domain([parseTime(MIN_YEAR), parseTime(MAX_YEAR)])

	var domainInflater = 1.3

	var min = d3.min(data, function(d){return d3.min(d.values, function(d){ return +d[selected[topic]] }) })
		min = min < -4 ? min * domainInflater : -4 ;
	var max = d3.max(data, function(d){return d3.max(d.values, function(d){return +d[selected[topic]] }) })
		max = max < 5 ? 5 : max * domainInflater ;

	var y = d3.scaleLinear()
		.range([height - margin.bottom, margin.top])
		.domain([
			min,
			max
		]);

	var line = d3.line()
		// .defined(function(d){ return !isNaN(d) })
		.x(function(d){ return x(parseTime(d.year)) })
		.y(function(d){ return y(+d[selected[topic]]) })

  //color is totally dependent on order, in the colorArray and in the data
	color.domain(data.map(function(d){return d.key}))

	//d3.select(".x-axis").remove();
	svg.append('g')
		.attr('class','x-axis')
		.attr('transform', 'translate(' + margin.left + ',' + (height - margin.bottom) + ')')
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y')));

	var yAxis = d3.axisLeft(y)
		.tickSize(-width)
		.tickFormat(function(d){ return d + '%'});

	axisSelection.call(yAxis);

	svg.selectAll('g.tick > line')
		.style('stroke', function(d,i){
			if (d === 0){
				return '#000000'
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
      if (topic === 'sector'){
        return raceColorObj[d.key]
      } else if (topic === 'race'){
			 return color(d.values[i][SECTOR_KEY]) }
      })
		.attr('stroke-width', 2)
		.attr('class', function(d){
			var string = '';
			if (topic==='comparison'){
        string = 'other-school '
        if (d.key === higherEdSelections.selectedSchool){
          string = 'highlight-school '
        }
      }
			return string;
		})
  //TODO append text with teh school name to show on mouseover

	path.transition()
		.attr('d', function(d){ return line(d.values)  })
		.attr('stroke-width', 2)
		.attr('stroke', function(d,i){ if (topic === 'sector'){ return raceColorObj[d.key] } else if (topic === 'race'){
			return color(d.values[i][SECTOR_KEY]) } })
		//.attr('data-cat', function(d){ return d.key })

	path.exit().remove();

	if (topic === 'sector'){
		var keys = bySectorLegend.selectAll('li')
			.data(higherEdSelections.arrayRaces)
			.enter()
			.append('li')
			.attr('class', function(d){ return d })
			.classed('key-item', true)
			.classed('race', true)
			.style('border-left', function(d){ return '17px solid ' + color(d) })
			.text(function(d){ return translateRace[d] })
	} else if (topic === 'race') {
		var keys = byRaceLegend.selectAll('li')
			.data(data.map(function(d){return d.key})) //list of sectors
			.enter()
			.append('li')
			.attr('class', function(d){ return d })
			.classed('key-item', true)
			.classed('race', true)
			.style('border-left', function(d){ return '17px solid ' + color(d) })
			.text(function(d){ return d })
	}

  if (higherEdSelections.chartType === 'one-school-all-races') {
    oneSchoolLegend.selectAll('li').remove();
    var keys = oneSchoolLegend.selectAll('li')
      .data(higherEdSelections.arrayRaces)
      .enter()
      .append('li')
      .attr('class', function(d){ return d })
      .classed('key-item', true)
      .classed('race', true)
      .style('border-left', function(d){ return '17px solid ' + color(d) })
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
  }

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
	} else if (chartType === 'one-school-all-races'){
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

	//event listener after party:

	//sector boxes - updates arraySector
	d3.selectAll('.sector-boxes').on('click', function(){

		var userChoice = this.value;
		var checkbox = d3.select(this);
		var checkboxChecked = checkbox.classed('checked');

		var twoYearTranslate = {
			'two-year-public': 'Public 2-year',
			'two-year-private': 'For-Profit 2-year'
		}
			//switching from 4 year to 2
		if (checkbox.classed('two-year') && higherEdSelections.programLength === 'four'){
			//switch over all the checked's and reset the arraySectors to just be the new userchoice
			SECTOR_KEY = 'twocat'
			higherEdSelections.programLength = 'two'
			SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength
			higherEdSelections.arraySectors = [twoYearTranslate[userChoice]]

			d3.selectAll('.four-year').classed('checked', false);
			d3.selectAll('.four-year.sector-boxes').property('checked', false);

			d3.selectAll('.two-year').classed('inactive', false);
			d3.selectAll('.four-year, .program-type').classed('inactive', true);
    //staying within 2 year
		} else if (checkbox.classed('two-year') && higherEdSelections.programLength === 'two'){
			//remove or add userchoice from the array
			if (checkboxChecked){
				higherEdSelections.arraySectors = higherEdSelections.arraySectors.filter(function(d){
					return d !== twoYearTranslate[userChoice]
				})
			} else {
				higherEdSelections.arraySectors.push(twoYearTranslate[userChoice])
			}
    // switch from 2 to 4
		} else if (checkbox.classed('four-year') && higherEdSelections.programLength === 'two'){
			SECTOR_KEY = 'fourcat'
			higherEdSelections.programLength = 'four'
			SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength
			higherEdSelections.arraySectors = [translate[userChoice]]
			d3.selectAll('.two-year').classed('checked', false)
			d3.selectAll('.two-year.sector-boxes').property('checked', false)

			d3.selectAll('.two-year').classed('inactive', true);
			d3.selectAll('.four-year, .program-type').classed('inactive', false);
    // staying within 4
		} else if (checkbox.classed('four-year') && higherEdSelections.programLength === 'four'){
			if (checkboxChecked){
				higherEdSelections.arraySectors = higherEdSelections.arraySectors.filter(function(d){
					return d !== translate[userChoice]
				})
			} else {
				higherEdSelections.arraySectors.push(translate[userChoice])
			}
		}
									//equivalent to toggleClass
		checkbox.classed('checked', !checkbox.classed('checked'));

		if (checkboxChecked && higherEdSelections.arraySectors.length < 1){
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

	})

	//sector radios - updates singleSector
	d3.selectAll('.sector-radios').on('click', function(){
		higherEdSelections.singleSector = translate[this.value];
		d3.select('#by-race-container > h4 > span').text(higherEdSelections.singleSector);
		NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
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
			alert('Please pick one or more races or ethnicities')
		} else {
			NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
			NESTED_BY_RACE = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
		}

		if (chartType === 'one-school-all-races'){
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
  		d3.select('#by-sector-container > h4 > span').text(translateRace[userChoice]);
  		d3.select('input[value=' + userChoice + ']').property('checked', true)
  		drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis);
    } else if (chartType === 'multiple-schools'){
      callComparisonChart();
    }
	})
}

d3.select('#school-comparison').on('click', function(d){
  //toggle the chart type
  if (higherEdSelections.chartType === 'one-school-all-races'){
    higherEdSelections.chartType = 'multiple-schools';
    callComparisonChart();
  } else {
    higherEdSelections.chartType = 'one-school-all-races';
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

	d3.select('#one-school-all-races > h4 > span').text(higherEdSelections.state + ' ' + higherEdSelections.singleSector + 's ');
	drawLineChart(nestedBySchool, 'comparison', oneSchoolSVG, oneSchoolG, oneSchoolYAxis)
}

function callSchoolChart(){
  var schoolDataByRace = makeDemogNest(higherEdSelections.selectedSchool, true);
  d3.select('#one-school-all-races > h4 > span').text(higherEdSelections.selectedSchool);
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
	d3.select('#single-year-container > h4 > span:nth-child(1)').text(higherEdSelections.state);
	d3.select('#by-sector-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
	d3.select('#by-race-container > h4 > span:nth-child(2)').text(higherEdSelections.state);

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

// Time
 var dataTime = d3.range(0, 9).map(function(d) {
    return new Date(MIN_YEAR + d, 0, 1);
  });

var sliderTime =
	d3.sliderBottom()
		.min(d3.min(dataTime))
		.max(d3.max(dataTime))
		.step(1000 * 60 * 60 * 24 * 365)
		.width(220)
		.tickFormat(function(d){ return '\'' + d3.timeFormat('%y')(d)})
		.tickValues(dataTime)
		.default(new Date(2017, 0, 1))
		.on('onchange', function(val){
			higherEdSelections.year = timeFormat(val);
			callBarChart(higherEdSelections.year);
			d3.select('#single-year-container > h4 > span:nth-child(2)').text(timeFormat(val));
		});

var gTime =
	d3.select('div#year-input')
		.append('svg')
		.attr('width', 250)
		.attr('height', 60)
		.append('g')
		.attr('transform', 'translate(15,10)');

gTime.call(sliderTime);
d3.select('#single-year-container > h4 > span:nth-child(2)').text(timeFormat(sliderTime.value()));
// d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));

function initializeStaticControls(){
	//event listener party
	d3.selectAll('.geography-choices').on('click', function(){

		var userChoice = this.getAttribute('data-cat');
		console.log(userChoice)
		higherEdSelections.geography = userChoice

		d3.selectAll('.geography-choices').classed('selected', false)
		d3.select(this).classed('selected', !d3.select(this).classed('selected'))


		if ( userChoice === 'state'){
			d3.select('#single-year-container > h4 > span:nth-child(1)').text(higherEdSelections.state);
			d3.select('#by-sector-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			d3.select('#by-race-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			SELECTED_DATASET = 'filteredForState';
			SECTOR_KEY = higherEdSelections.programLength === 'four' ? 'fourcat' : 'twocat';

			d3.select('#time-selection').style('display', 'block');
			d3.select('#school-selection').style('display', 'none');

	        d3.select('#first-dynamic-menu').style('display', 'block')
	        d3.select('#second-dynamic-menu').style('display', 'block')

			var states = higherEdData.allData.statefour.map(function(d){return d.fips_ipeds});

			var menuData = states.filter(distinct);
			makeDropdown(menuData);
			d3.select('#dropdown').style('display', 'block');

			higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
				return d.fips_ipeds === higherEdSelections.state;
			})

			if (higherEdSelections.chartType === 'one-school-all-races' || higherEdSelections.chartType === 'multiple-schools'){
				showChart('single-year-bar')
			}
			higherEdSelections.chartType = 'single-year-bar'

		} else if ( userChoice === 'national' ){
			SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength
			d3.select('#time-selection').style('display', 'block');
			d3.select('#dropdown').style('display', 'none')
			d3.select('#school-selection').style('display', 'none')
			d3.select('#single-year-container > h4 > span:nth-child(1)').text('US');

	        d3.select('#first-dynamic-menu').style('display', 'block')
	        d3.select('#second-dynamic-menu').style('display', 'block')

			if (higherEdSelections.chartType === 'one-school-all-races' || higherEdSelections.chartType === 'multiple-schools'){
				showChart('single-year-bar')
			}
      		higherEdSelections.chartType = 'single-year-bar'
      		buildOptionPanel(higherEdSelections.chartType)
		} else if ( userChoice === 'school' ){
			SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength;
			higherEdSelections.chartType = 'one-school-all-races'

			//this shit takes forever!!!
			var schoolFours = higherEdData.allData.schoolfour.filter(function(d){
				if (d.year ==='2015'){ return d.inst_name }
			}).map(function(d){
				return d.inst_name
			})

			var schoolTwos = higherEdData.allData.schooltwo.filter(function(d){
				if (d.year ==='2015'){ return d.inst_name }
			}).map(function(d){
				return d.inst_name
			})

			var schoolNames = schoolFours.concat(schoolTwos);
			makeSchoolLookup(schoolNames);

      buildOptionPanel('one-school-all-races')

			showChart(higherEdSelections.chartType);

			callSchoolChart();

    	}

    //all these use SELECTED_DATASET inside the filtering/nesting functions

	//format data and call bar chart
	callBarChart(higherEdSelections.year);

	//format data and call line chart race
	NESTED_BY_SECTOR = makeSectorNest();

	NESTED_BY_SECTOR = NESTED_BY_SECTOR.filter(function(d){ return higherEdSelections.arraySectors.indexOf(d.key) > -1 })
	drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis);

	NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
	NESTED_BY_RACE = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
	drawLineChart(NESTED_BY_RACE, 'sector', bySectorSVG, bySectorG, bySectorYAxis)
	//format data and call line chart sector

	})

	//if view is 'state' add state dropdown menu
	//if view is 'school' add look up box for school name

	d3.selectAll('.time-selector').on('click', function(){
		d3.event.stopPropagation();
		var chart = this.getAttribute('value') //single-year-bar, by-sector-chart, by-race-chart

		higherEdSelections.chartType = chart;

		d3.selectAll('.time-selector').classed('selected', false);
		d3.select(this).classed('selected', true);

    //the 'trends over time' button doesn't represent a specific chart but it
    //leads to a default, 'by-race-chart', so showing/hiding
    //the UI is part of the selection
		if (chart === 'by-sector-chart'){
			d3.select('.time-selector.bar').classed('selected', false);
			d3.select('.time-selector.line.main-choice').classed('selected', true);
			d3.select('#by-sector-container > h4 > span:nth-child(1)').text(translateRace[higherEdSelections.singleRace]);
			if (higherEdSelections.geography === 'state'){
				d3.select('#by-sector-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			}
			drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis)// data nested by sector or race; the selected radio ('topic'); svg
		} else if (chart === 'by-race-chart'){
			d3.select('.race').classed('selected', true);
			d3.select('.time-selector.bar').classed('selected', false);
			d3.select('.time-selector.line.main-choice').classed('selected', true);
			d3.select('#by-race-container > h4 > span:nth-child(1)').text(higherEdSelections.singleSector);
			if (higherEdSelections.geography === 'state'){
				d3.select('#by-race-container > h4 > span:nth-child(2)').text(higherEdSelections.state);
			}
			drawLineChart(NESTED_BY_RACE, 'sector', bySectorSVG, bySectorG, bySectorYAxis)
		} else if ( chart === 'single-year-bar' ){
			d3.select('.time-selector.bar').classed('selected', true);
			d3.select('.time-selector.line.main-choice').classed('selected', false);
		}

		// if (){
		// 	    d3.selectAll('.sub-choice').classed('selected', false);
  //   d3.select(this).classed('selected', true);
		// }

		showChart(chart);
		buildOptionPanel(chart);
	})

  // d3.selectAll('.time-selector.sub-choice').on('click', function(){
  //   d3.event.stopPropagation();

  //   var chart = this.getAttribute('value') //single-year-bar, by-sector-chart, by-race-chart

  //   higherEdSelections.chartType = chart;



  //   if (chart === 'by-sector-chart'){
  //     drawLineChart(NESTED_BY_SECTOR, 'race', byRaceSVG, byRaceG, byRaceAxis);
  //     showChart(chart);
  //     buildOptionPanel(chart);
  //   } else if (chart === 'by-race-chart'){
  //     drawLineChart(NESTED_BY_RACE, 'sector', bySectorSVG, bySectorG, bySectorYAxis)
  //     showChart(chart);
  //     buildOptionPanel(chart);
  //   }
  // })
} //end initializeStaticContols

function filterDataByYear(year){
	//this might need to filter for all the things, year, race, and sector
	return higherEdData.allData[SELECTED_DATASET].filter(function(d){
				return d.year === year
			});
}

function makeSectorNest(){
	var nest = d3.nest().key(function(d){
		return d[SECTOR_KEY]
	}).entries(higherEdData.allData[SELECTED_DATASET]);
	return nest;
}


function makeDemogNest(sector, isSchoolData){

	var nestedByDemog = [],
		filtered;

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


	//draw your default chart, bars for 2017: all races/sectors
	FILTERED_BY_YEAR = filterDataByYear(higherEdSelections.year);
	drawBarChart(FILTERED_BY_YEAR);

  // var OPTIONS_PANEL_TOTAL_WIDTH = parseInt(d3.select("#options-panel").style("width")) +
  //   parseInt(d3.select("#options-panel").style("margin-right"))

}

d3.csv('data/national-2yr.csv').then(function(nationaltwo){
	higherEdData.allData.nationaltwo = nationaltwo;
	d3.csv('data/national-4yr.csv').then(function(nationalfour){
		higherEdData.allData.nationalfour = nationalfour;
		d3.csv('data/school-2yr.csv').then(function(schooltwo){
			higherEdData.allData.schooltwo = schooltwo;
			d3.csv('data/school-4yr.csv').then(function(schoolfour){
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
})


