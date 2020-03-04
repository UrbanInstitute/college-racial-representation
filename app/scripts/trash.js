function buildRaceMenu(div, inputType){
	var menuArea = d3.select(div);
	var raceEthnicities = ['American Indian', 'Asian', 'Black', 'Hispanic', 'Multiracial', 'Pacific Islander', 'White']
	menuArea.selectAll('.race-ethnicity-choice-div')
		.data(raceEthnicities)
		.enter()
		.append('div')
		.classed('race-ethnicity-choice-div', true)
		.html(function(d){
			return '<input type=\'radio\' class=\'race-ethnicity-choices\' name=\'race-ethnicity-choice\' value=\'' + d + '\' checked=\'\'/><label for=\'' + d +'\'>' + d + '</label>'
		})
}

function buildSectorMenu(div, inputType){
	var menuArea = d3.select(div);

	var sectors = [
	    { key: 'Four Year Colleges', 
	   		 value: [
		    		{ 
			    		key: 'Public', 
			    		value: ['Non-selective', 'Selective', 'Highly selective']
		    		},
		    		{ 
			    		key: 'Private',
			    		value: ['Non-selective', 'Selective', 'Highly selective']
		    		},
		    		{
		    			key: 'For-profit',
		    			value: []
		    		}
	    		]
	    	},
	    { key: 'Two Year Colleges', value: ['Public', 'Private']}
  	]

	// var div = d3.select("#list")
	//   .selectAll("div")
	//   .data(sectors)
	//   .enter().append("div");

	// div.append("dt")
	//     .text(function(d) { return d.key; });

	// div.append("dd")
	//     .text(function(d) { return d.value; });
	

	var majorCategories = menuArea.selectAll('.major-categories')
		.data(sectors)
		.enter()
		.append('p')
		.classed('major-categories', true)
		//.attr("id", function(d){ debugger })
		.text(function(d){ return d.key })

	var fourYears = majorCategories.selectAll('.sectors')
		.data(sectors[0].value)
		.enter()
		.append('p')
		.classed('sectors', true)
		.text(function(d){ return d.key })


	// fourYears.selectAll(".selectivity")
	// 	.data(function(d){ return d })
	// 	.append("p")
	// 	.classed("selectivity", true)
	// 	.text(function(d){ return d.value })


}

function buildMenuPanel(){

	//shows/hides the time slider
	//filters the sectors and race/ethnicity
	//appends sector/race choice in correct order as radio or checkbox, depending on chart type


		//if view is national or state and chart type is line-sectors
	//put sectors as radio buttons first - set/map to get keys

	if (higherEdSelections.chartType === 'line-sectors'){
		buildSectorMenu('#primary-attribute-menu', 'checkbox')
		buildRaceMenu('#secondary-attribute-menu', 'radio')
	}

	//races as check boxes second

	//nest data on sectors, with second array of dates

	//if view is national or state and chart type is line-race 
	//put races as radio buttons first
	//sectors as check boxes second 

	//nest data on race/ethnicity, with second array of dates
}