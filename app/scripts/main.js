

// Uncomment to enable Bootstrap tooltips
// https://getbootstrap.com/docs/4.0/components/tooltips/#example-enable-tooltips-everywhere
// $(function () { $('[data-toggle="tooltip"]').tooltip(); });

// Uncomment to enable Bootstrap popovers
// https://getbootstrap.com/docs/4.0/components/popovers/#example-enable-popovers-everywhere
// $(function () { $('[data-toggle="popover"]').popover(); });


	var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 600 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	// parse the date / time


	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("#exploreSciBar").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

	// Get the data

	Promise.all([
	    d3.csv("file1.csv"),
	    d3.csv("file2.csv"),
	]).then(function(files) {
	    // files[0] will contain file1.csv
	    // files[1] will contain file2.csv
	}).catch(function(err) {
	    // handle error here
	})

	  // format the data