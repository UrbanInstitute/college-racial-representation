

// Uncomment to enable Bootstrap tooltips
// https://getbootstrap.com/docs/4.0/components/tooltips/#example-enable-tooltips-everywhere
// $(function () { $('[data-toggle="tooltip"]').tooltip(); });

// Uncomment to enable Bootstrap popovers
// https://getbootstrap.com/docs/4.0/components/popovers/#example-enable-popovers-everywhere
// $(function () { $('[data-toggle="popover"]').popover(); });


// Some Q's maybe to get help with:
// 
// 

// the datas
var higherEdData = {};
	higherEdData.allData = {};

// the user selections
var higherEdSelections = {};
	higherEdSelections.geography = 'national', //national, state, school
	higherEdSelections.chartType = 'single-year-bar', //single-year-bar, sectors-as-lines, race-ethnicities-as-lines
	higherEdSelections.year = '2017',
	higherEdSelections.programLength = 'four',  //two, four
	higherEdSelections.singleRace = 'dif_hispa',
	higherEdSelections.singleSector = 'Public Non-Selective',
	higherEdSelections.state = 'Alabama',
	higherEdSelections.arrayRaces = [],
	higherEdSelections.arraySectors = []
	
var SECTOR_KEY = 'fourcat',
	SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength,
	NESTED_BY_SECTOR,
	NESTED_BY_RACE,
	FILTERED_BY_YEAR,
	STATE_DATA;

var colorArray = ['#E88E2D','#E9807D','#46ABDB','#D2D2D2','#FDD870','#98CF90','#EB99C2', '#351123']

var raceColorObj = {
	'dif_white': '#EB99C2',
	'dif_hispa': '#D2D2D2',
	'dif_black': '#46ABDB',
	'dif_asian': '#E9807D',
	'dif_amind': '#E88E2D',
	'dif_pacis': '#98CF90',
	'dif_othra': '#000000',
	'dif_twora': '#FDD870'
}

var translate = {
	 'for-profit': 'For-Profit',
	 'private-highly-selective': 'Private More Selective',
	 'private-nonselective': 'Private Non-Selective',
	 'private-selective': 'Private Selective',
	 'public-highly-selective': 'Public More Selective',
	 'public-nonselective': 'Public Non-Selective',
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

var margin = {top: 20, right: 10, bottom: 30, left: 40},
    width = 600 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;


//the chart selections & their G's

//bar chart
var singleYearSVG = d3.select('#single-year-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var barChartG = singleYearSVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
var barChartXAxis = barChartG.append('g')
	.attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
	.attr('class', 'grid');
var barLegend = d3.select('#single-year-container > div.legend').append('ul')
	.attr('class', 'key')

// sectors are radios
var sectorLineSVG = d3.select('#multi-year-by-sector-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var sectorLineG = sectorLineSVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
var sectorLineLegend = d3.select('#multi-year-by-sector-container > div.legend').append('ul')
	.attr('class', 'key')
var sectorLineYAxis = sectorLineSVG.append('g')
	.attr('class', 'grid')
	.attr('transform', 'translate(' + margin.left + ',0)')

// races are radios
var raceEthnicityLineSVG = d3.select('#multi-year-by-race-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var raceEthnicityLineG = raceEthnicityLineSVG.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
var raceLineLegend = d3.select('#multi-year-by-race-container > div.legend').append('ul')
	.attr('class', 'key')
var raceLineYAxis = raceEthnicityLineSVG.append('g')
	.attr('class', 'grid')
	.attr('transform', 'translate(' + margin.left + ',0)')

var parseTime = d3.timeParse('%Y'),
	timeFormat = d3.timeFormat('%Y'),
	formatTwoDecimals = d3.format('.2f')

var color = d3.scaleOrdinal() 
    .range(colorArray)

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
	console.log('list of sectors in the domain: ' + data.map(function(d){ return d[SECTOR_KEY] }))
	//scale used to place each sector
	var y0 = d3.scaleBand()
	    .domain(data.map(function(d){ return d[SECTOR_KEY] }) ) //returns lists of sectors
	    .rangeRound([height - margin.bottom, margin.top])
	    .paddingInner(0.1)

	//scale used to place each race within sector
    var y1 = d3.scaleBand()
	    .domain(higherEdSelections.arrayRaces)
	    .rangeRound([y0.bandwidth(), 0])
	    .padding(0.05)

	var min = 0, max = 0;
	for (var i = 0; i < data.length; i++){
		for (var j = 0; j < higherEdSelections.arrayRaces.length; j++){
			if ( +data[i][higherEdSelections.arrayRaces[j]] < min ){
				min = +data[i][higherEdSelections.arrayRaces[j]]
			} else if ( +data[i][higherEdSelections.arrayRaces[j]] > max ){
				max = +data[i][higherEdSelections.arrayRaces[j]]
			}
		}
	}

	//regular scale for bar length
    var x = d3.scaleLinear()
	    .domain([min,max]) 
	    .rangeRound([margin.left, width - margin.right])

	//hello i am the axis
	var xAxis = d3.axisBottom(x)
		.tickSize(-height)
		.tickFormat(function(d){ return d + '%'})

	barChartXAxis.call(xAxis)
		.selectAll('text')
		.attr('y', 6)
	d3.select('.domain').remove();

	d3.select('.zero-line').remove();
    barChartXAxis.append('line')
	    .attr('class', 'zero-line')
	    .attr('x1', x(0))
	    .attr('x2', x(0))
	    .attr('y1', 0)
	    .attr('role','presentation')
	    .attr('y2', -height);

	var sectorGroups = barChartG.selectAll('g.sector')
		.data(data, function(d){ return d[SECTOR_KEY] })
		.join('g')        
		  .attr('transform', function(d){ return 'translate(0,' + y0(d[SECTOR_KEY]) + ')' } ) 
		  .attr('class', function(d){ if (d[SECTOR_KEY] === 'Public Non-Selective') { return 'Public Nonselective'} 
		  	else if (d[SECTOR_KEY] === 'Private Non-Selective'){ return 'Private Nonselective'} else {
		  		return d[SECTOR_KEY]
		  	} })
		  .classed('sector', true)

	d3.selectAll('.sector-label').remove(); //shrug emoji?

	var sectorLabels = sectorGroups.append('text')
			.classed('sector-label', true)
			.text(function(d){ return d[SECTOR_KEY] })
			.attr('x', x(0.25))

	sectorGroups.exit().remove();

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
		.attr('height', y1.bandwidth())
		.attr('fill', function(d){ return raceColorObj[d.key] })
		.attr('x', function(d){ return +d.value > 0 ? x(0) : x(d.value) })
		.attr('width', function(d){ return +d.value > 0 ? x(d.value) - x(0) : (x(0) - x(d.value)) })

	rects.transition().duration(800)
		.attr('x', function(d){ return d.value > 0 ? x(0) : x(d.value) })
		.attr('width', function(d){ return d.value > 0 ? x(d.value) - x(0) : (x(0) - x(d.value)) })
				.attr('y', function(d){ return y1(d.key) })
		.attr('height', y1.bandwidth())

	rects.exit().remove();

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

//svg & g: sectorLineSVG, sectorLineG, raceEthnicityLineSVG, raceEthnicityLineSVG; axis: raceLineYAxis, sectorLineYAxis; 
function drawLineChart(data, topic, svg, g, axisSelection){

	var selected = {
		'race': higherEdSelections.singleRace, //"dif_hispa", "dif_white".. etc
		'sector': 'value' //bc this data object just has one sector at a time
	}
	var ymdFmt = d3.timeParse('%Y-%m-%d')
	//scales
	var x = d3.scaleTime()
		.range([margin.left, width - margin.right])
		.domain([parseTime(2009), parseTime(2017)])

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
		.style('stroke-dasharray', function(d,i){
			if(d === 0){
				return 'none'
			} else {
				return '2, 2'
			}
		})
		
	    
	var path = g.selectAll('path')
		.data(data, function(d){ return d.key })
		
	path.enter()
		.append('path')
		.attr('fill', 'none')
		.attr('d', function(d){ return line(d.values)  })
		.attr('stroke', function(d,i){ return topic === 'sector' ? color(d.key) : color(d.values[i][SECTOR_KEY] ) })
		.attr('stroke-width', 2)
		.attr('data-cat', function(d){ return d.key })

	path.transition()
		.attr('d', function(d){ return line(d.values)  })
		.attr('stroke-width', 2)
		.attr('stroke', function(d,i){ return topic === 'sector' ? color(d.key) : color(d.values[i][SECTOR_KEY] )  })
		.attr('data-cat', function(d){ return d.key })

	path.exit().remove();

	if (topic === 'sector'){		
		var keys = raceLineLegend.selectAll('li')
			.data(higherEdSelections.arrayRaces)
			.enter()
			.append('li')
			.attr('class', function(d){ return d })
			.classed('key-item', true)
			.classed('race', true)
			.style('border-left', function(d){ return '17px solid ' + color(d) })
			.text(function(d){ return translateRace[d] })
	} else {

		var keys = sectorLineLegend.selectAll('li')
			.data(data.map(function(d){return d.key})) //list of sectors
			.enter()
			.append('li')
			.attr('class', function(d){ return d })
			.classed('key-item', true)
			.classed('race', true)
			.style('border-left', function(d){ return '17px solid ' + color(d) })
			.text(function(d){ return d })
	}

}

function showChart(chartType){
	//have 2 divs for bar/line that slide in/out cleanly 
	//var contentWidth = (widthUnder(1085)) ? window.innerWidth + 20 : d3.select("#chartAreaContainer").node().getBoundingClientRect().width
	var contentWidth = 600 

	var chartScootch = {
		'single-year-bar': 0,
		'race-ethnicities-as-lines': contentWidth * -1,
		'sectors-as-lines': contentWidth * -2
	}

	d3.select('#single-year-container').transition().style('margin-left', chartScootch[chartType] + 'px')

}

function buildOptionPanel(chartType){

	var raceOptions = higherEdData.allData.nationalfour.columns.slice(2),
		sectorOptions = []

		higherEdData.allData[SELECTED_DATASET].filter(function(d){ 
			return d.year === '2015' 
		}).forEach(function(d){ 
			sectorOptions.push(d[SECTOR_KEY]) 
		})

	// radio button template:
	function radioButtonTemplater(option){
		var text = 
		'<label for="' + option + '"><input type="radio" class=" " name="' + chartType + '" value="' + option + '" /><span>' + translateRace[option] + '</span></label>'
        return text
	}
	// checkbox template
	function checkboxTemplater(option){
		var text = 
		'<div class="c-cb"><input type="checkbox" class=" " name="' + chartType + '" value="' + option + '" checked/><label for="' + option + '">' + translateRace[option] + '</label></div>'
        return text
	}

	//radio button one always goes up top
	d3.select('#first-dynamic-menu').text('')
	d3.select('#second-dynamic-menu').text('')

	if (chartType === 'single-year-bar'){
		//checkboxes for everything
		d3.select('#year-selector').style('display', 'block');

		d3.select('#first-dynamic-menu').html(COLLEGE_SECTOR_CHECKBOXES)//controls initialized further down for this one

		d3.select('#second-dynamic-menu').append('p').attr('class', 'options-panel-section').text('Race/Ethnicity')
		d3.select('#second-dynamic-menu').selectAll('div.race-ethnicity-checkboxes')
			.data(raceOptions)
			.enter()
			.append('div')
			.classed('race-ethnicity-checkboxes', true)
			.classed('checked', true)
			.html(function(d){ return checkboxTemplater(d) })

		d3.selectAll('.race-ethnicity-checkboxes > div > input')
			.property('checked', function(d){ return higherEdSelections.arrayRaces.indexOf(this.value) > -1 });


		d3.selectAll('.sector-boxes')
			.property('checked', function(d){ return higherEdSelections.arraySectors.indexOf(translate[this.value]) > -1 });

	} else if (chartType === 'sectors-as-lines'){
		//races as radio buttons, sectors as checkboxes
		d3.select('#year-selector').style('display', 'none')
		d3.select('#first-dynamic-menu').append('p').attr('class', 'options-panel-section').text('Race/Ethnicity')
		d3.select('#first-dynamic-menu').selectAll('div.race-ethnicity-radios')
			.data(raceOptions)
			.enter()
			.append('div')
			.classed('race-ethnicity-radios', true) 
			//.classed("checked", function(d){ return d === higherEdSelections.singleRace })// this becomes a function using singleRace 
			.html(function(d){ return radioButtonTemplater(d) })

		d3.select('#second-dynamic-menu').html(COLLEGE_SECTOR_CHECKBOXES)
		
		d3.select('input[value=' + higherEdSelections.singleRace + ']').property('checked', true)
		
		d3.selectAll('.sector-boxes')
			.property('checked', function(d){ return higherEdSelections.arraySectors.indexOf(translate[this.value]) > -1 });

	} else if (chartType === 'race-ethnicities-as-lines'){
		//sectors as radio buttons, races as checkboxes
		d3.select('#year-selector').style('display', 'none')
		
		d3.select('#first-dynamic-menu').html(COLLEGE_SECTOR_RADIOS)

		d3.select('#second-dynamic-menu').append('p').attr('class', 'options-panel-section').text('Race/Ethnicity')
		d3.select('#second-dynamic-menu').selectAll('div.race-ethnicity-checkboxes')
			.data(raceOptions)
			.enter()
			.append('div')
			.classed('race-ethnicity-checkboxes', true) 
			.classed('checked', function(d){ return higherEdSelections.arrayRaces.indexOf(d) > -1 })
			.html(function(d){ return checkboxTemplater(d) })

		var translateBack = {
			 'For-Profit': 'for-profit',
			 'Private More Selective': 'private-highly-selective',
			 'Private Non-Selective': 'private-nonselective',
			 'Private Selective': 'private-selective',
			 'Public More Selective': 'public-highly-selective',
			 'Public Non-Selective': 'public-nonselective',
			 'Public Selective': 'public-selective'
		}

		d3.select('input[value=' + translateBack[higherEdSelections.singleSector] + ']').property('checked', true)

		d3.selectAll('.race-ethnicity-checkboxes > div > input')
			.property('checked', function(d){ return higherEdSelections.arrayRaces.indexOf(this.value) > -1 });
	}
	
	//event listener party: 

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

			d3.selectAll('.four-year').classed('checked', false)
			d3.selectAll('.four-year.sector-boxes').property('checked', false)	
			
		} else if (checkbox.classed('two-year') && higherEdSelections.programLength === 'two'){
			//remove or add userchoice from the array
			if (checkboxChecked){
				higherEdSelections.arraySectors = higherEdSelections.arraySectors.filter(function(d){
					return d !== twoYearTranslate[userChoice]
				})
			} else {
				higherEdSelections.arraySectors.push(twoYearTranslate[userChoice])
			}
			
		} else if (checkbox.classed('four-year') && higherEdSelections.programLength === 'two'){
			SECTOR_KEY = 'fourcat'
			higherEdSelections.programLength = 'four'
			SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength
			higherEdSelections.arraySectors = [translate[userChoice]]
			d3.selectAll('.two-year').classed('checked', false)
			d3.selectAll('.two-year.sector-boxes').property('checked', false)
			
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
			alert('Please pick at least one sector')
		} else {

			NESTED_BY_SECTOR = makeSectorNest();
			NESTED_BY_SECTOR = NESTED_BY_SECTOR.filter(function(d){ return higherEdSelections.arraySectors.indexOf(d.key) > -1 })
			drawLineChart(NESTED_BY_SECTOR, 'race', sectorLineSVG, sectorLineG, sectorLineYAxis); 
		}
		
		//filter the year data too and call bar chart
		FILTERED_BY_YEAR = filterDataByYear(higherEdSelections.year);
		FILTERED_BY_YEAR = FILTERED_BY_YEAR.filter(function(d){return higherEdSelections.arraySectors.indexOf(d[SECTOR_KEY]) > -1  })
		drawBarChart(FILTERED_BY_YEAR)
	
	})


	//sector radios - updates singleSector
	d3.selectAll('.sector-radios').on('click', function(){
		higherEdSelections.singleSector = translate[this.value];
		d3.select('#multi-year-by-race-container > h4 > span').text(higherEdSelections.singleSector);
		NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
		drawLineChart(NESTED_BY_RACE, 'sector', raceEthnicityLineSVG, raceEthnicityLineG, raceLineYAxis);
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
		
									//equivalent to toggleClass
		checkbox.classed('checked', !checkbox.classed('checked'));


		//bar chart function refers to arrayRaces so we don't filter here
		drawBarChart(FILTERED_BY_YEAR)
		console.log(higherEdSelections.arrayRaces.length)
		if (higherEdSelections.arrayRaces.length < 1){
			alert('Please pick one or more races')
		} else {
			//take lines off 
			NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
			// put lines back on
			NESTED_BY_RACE = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
		}

		

		drawLineChart(NESTED_BY_RACE, 'sector', raceEthnicityLineSVG, raceEthnicityLineG, raceLineYAxis);
	})

	//race radios - updates singleRace
	d3.selectAll('.race-ethnicity-radios').on('click', function(){	
		var userChoice = d3.select(this).datum();
		higherEdSelections.singleRace = userChoice;
		d3.select('#multi-year-by-sector-container > h4 > span').text(translateRace[userChoice]);
		d3.select('input[value=' + userChoice + ']').property('checked', true)
		drawLineChart(NESTED_BY_SECTOR, 'race', sectorLineSVG, sectorLineG, sectorLineYAxis); 
	})
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
	higherEdSelections.state = this.value 

	higherEdData.allData.filteredForState =  higherEdData.allData[higherEdSelections.geography + higherEdSelections.programLength].filter(function(d){
		return d.fips_ipeds === higherEdSelections.state;
	})

		//format data and call bar chart
	FILTERED_BY_YEAR = filterDataByYear(higherEdSelections.year);
	FILTERED_BY_YEAR = FILTERED_BY_YEAR.filter(function(d){return higherEdSelections.arraySectors.indexOf(d[SECTOR_KEY]) > -1  })
	drawBarChart(FILTERED_BY_YEAR)

	//format data and call line chart race
	NESTED_BY_SECTOR = makeSectorNest();
	NESTED_BY_SECTOR = NESTED_BY_SECTOR.filter(function(d){ return higherEdSelections.arraySectors.indexOf(d.key) > -1 })
	drawLineChart(NESTED_BY_SECTOR, 'race', sectorLineSVG, sectorLineG, sectorLineYAxis); 

	NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
	NESTED_BY_RACE = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
	drawLineChart(NESTED_BY_RACE, 'sector', raceEthnicityLineSVG, raceEthnicityLineG, raceLineYAxis)
}

function initializeStaticControls(){

	d3.selectAll('.geography-choices').on('click', function(){
		var userChoice = this.value;
		higherEdSelections.geography = this.value;
		SELECTED_DATASET = higherEdSelections.geography + higherEdSelections.programLength

		if ( userChoice === 'state'){
			higherEdData.allData.filteredForState =  higherEdData.allData[SELECTED_DATASET].filter(function(d){
				return d.fips_ipeds === higherEdSelections.state;
			})
			SELECTED_DATASET = 'filteredForState';

			var distinct = function(value, index, self){ return self.indexOf(value) === index; }
			var states = higherEdData.allData.statefour.map(function(d){return d.fips_ipeds});
			var menuData = states.filter(distinct);
			makeDropdown(menuData)

			d3.select('#dropdown').style('display', 'block')
		} else if ( userChoice === 'national' ){
			d3.select('#dropdown').style('display', 'none')
		}

		//format data and call bar chart
		FILTERED_BY_YEAR = filterDataByYear(higherEdSelections.year);
		FILTERED_BY_YEAR = FILTERED_BY_YEAR.filter(function(d){return higherEdSelections.arraySectors.indexOf(d[SECTOR_KEY]) > -1  })
		drawBarChart(FILTERED_BY_YEAR)

		//format data and call line chart race
		NESTED_BY_SECTOR = makeSectorNest();
		NESTED_BY_SECTOR = NESTED_BY_SECTOR.filter(function(d){ return higherEdSelections.arraySectors.indexOf(d.key) > -1 })
		drawLineChart(NESTED_BY_SECTOR, 'race', sectorLineSVG, sectorLineG, sectorLineYAxis); 

		NESTED_BY_RACE = makeDemogNest(higherEdSelections.singleSector);
		NESTED_BY_RACE = NESTED_BY_RACE.filter(function(d){ return higherEdSelections.arrayRaces.indexOf(d.key) > -1 })
		drawLineChart(NESTED_BY_RACE, 'sector', raceEthnicityLineSVG, raceEthnicityLineG, raceLineYAxis)
		//format data and call line chart sector
		
	})

	//if view is 'state' add state dropdown menu
	//if view is 'school' add look up box for school name
	d3.selectAll('.time-selector').on('click', function(){
		d3.event.stopPropagation();
		var chart = this.getAttribute('value') //single-year-bar, sectors-as-lines, race-ethnicities-as-lines

		higherEdSelections.chartType = chart;
		d3.selectAll('.time-selector').classed('selected', false);
		d3.select(this).classed('selected', true);

		if (chart === 'sectors-as-lines'){
			drawLineChart(NESTED_BY_SECTOR, 'race', sectorLineSVG, sectorLineG, sectorLineYAxis)// data nested by sector or race; the selected radio ('topic'); svg
		} else {
			drawLineChart(NESTED_BY_RACE, 'sector', raceEthnicityLineSVG, raceEthnicityLineG, raceLineYAxis)
		}

		showChart(chart);
		buildOptionPanel(chart)
	})

	d3.select('#year-input').on('click', function(){
		var year = document.getElementById('year-box').value;
		higherEdSelections.year = year;
		d3.select('#single-year-container > h4 > span').text(year)
		FILTERED_BY_YEAR = filterDataByYear(year);
		FILTERED_BY_YEAR = FILTERED_BY_YEAR.filter(function(d){return higherEdSelections.arraySectors.indexOf(d[SECTOR_KEY]) > -1  })
		drawBarChart(FILTERED_BY_YEAR)
	})	
}

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

function makeDemogNest(sector){

	var raceOptions = higherEdData.allData.nationalfour.columns.slice(2)

	var nestedByDemog = []

	var filtered = higherEdData.allData[SELECTED_DATASET].filter(function(d){ 
						return d[SECTOR_KEY] === sector 
					})

	for (var i = 0; i < raceOptions.length; i++){
		nestedByDemog.push({'key': raceOptions[i], 'values': []})
		filtered.forEach(function(yearData){ 		
			var obj = {
				'year': yearData.year,
				'value': yearData[raceOptions[i]]
			}
			nestedByDemog[i].values.push(obj)
		})
	}
	return nestedByDemog;
}

function prepareData(){
	NESTED_BY_SECTOR = makeSectorNest();
	NESTED_BY_RACE = makeDemogNest('Public Non-Selective');

	higherEdSelections.arraySectors = NESTED_BY_SECTOR.map(function(d){ return d.key })
	higherEdSelections.arrayRaces = higherEdData.allData[SELECTED_DATASET].columns.slice(2)
}

function init(){
	prepareData();
	buildOptionPanel('single-year-bar');
	initializeStaticControls();

	//draw your default chart, bars for 2017: all races/sectors 
	FILTERED_BY_YEAR = filterDataByYear(higherEdSelections.year);
	drawBarChart(FILTERED_BY_YEAR);
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


	