

var COLORS = {
    'null': '#d9d9d9',
    // grays
    'white': '#FFFFFF',
    'gray1': '#F5F5F5',
    'gray2': '#E3E3E3',
    'gray3': '#DCDBDB',
    'gray4': '#D2D2D2',
    'gray5': '#9D9D9D',
    'gray6': '#696969',
    'gray7': '#353535',
    'near-black': 'gray7',
    // core brand colors
    urbanBlue:
    [ [ '#1696D2' ],
      [ '#a2d4ec', '#1696D2' ],
      [ '#a2d4ec', '#1696D2', '#0a4c6a' ],
      [ '#cfe8f3', '#73bfe2', '#1696D2', '#0a4c6a' ],
      [ '#cfe8f3', '#73bfe2', '#1696D2', '#0a4c6a', '#000000' ],
      [ '#cfe8f3', '#a2d4ec', '#73bfe2', '#46abdb', '#1696d2', '#12719e' ] ],
    // extended palette
   gray:
    [ [ '#d2d2d2' ],
      [ '#', '#' ],
      [ '#', '#', '#' ],
      [ '#', '#', '#', '#' ],
      [ '#', '#', '#', '#', '#' ],
      [ '#', '#', '#', '#', '#', '#' ],
      [ '#d5d5d4','#adabac','#848081','#5c5859','#332d2f','#262223','#1a1717','#0e0c0d' ] ],
   orange:
    [ [ '#fdbf11' ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [ '#FFF2CF', '#FCE39E', '#FDD870', '#FCCB41', '#FDBF11', '#E88E2D', '#CA5800', '#843215' ] ],
   magenta:
    [ [ '#ec008b' ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [ '#F5CBDF', '#EB99C2', '#E46AA7', '#E54096', '#EC008B', '#AF1F6B', '#761548', '#351123' ] ],
   green:
    [ [ '#55b748' ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [ '#DCEDD9','#BCDEB4','#98CF90','#78C26D','#55B748','#408941','#2C5C2D','#1A2E19' ] ],
   spaceGray:
    [ [ '#5c5859' ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [ '#D5D5D4','#ADABAC','#848081','#5C5859','#332D2F','#262223','#1A1717','#0E0C0D' ] ],
   red:
    [ [ '#db2b27' ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [  ],
      [ '#F8D5D4','#F1AAA9','#E9807D','#E25552','#DB2B27','#A4201D','#6E1614','#370B0A' ] ],
}

var translate = {
   'for-profit': 'For-Profit',
   'private-highly-selective': 'Private More Selective',
   'private-nonselective': 'Private Nonselective',
   'private-selective': 'Private Selective',
   'public-highly-selective': 'Public More Selective',
   'public-nonselective': 'Public Nonselective',
   'public-selective': 'Public Selective',
   'two-year-public': 'Public 2-Year',
   'two-year-private': 'For-Profit 2-Year'
}

var translateBack = {
   'For-Profit': 'for-profit',
   'Private More Selective': 'private-highly-selective',
   'Private Nonselective': 'private-nonselective',
   'Private Selective': 'private-selective',
   'Public More Selective': 'public-highly-selective',
   'Public Nonselective': 'public-nonselective',
   'Public Selective': 'public-selective',
   'Public 2-Year': 'two-year-public',
   'For-Profit 2-Year': 'two-year-private'
}

var translateRace = {
  'dif_white': 'White',
  'dif_hispa': 'Hispanic',
  'dif_black': 'Black',
  'dif_asian': 'Asian',
  'dif_amind': 'American Indian',
  'dif_pacis': 'Pacific Islander',
  'dif_multi': 'Multiracial'
}


var raceColorObj = {
  'dif_white': '#0a4c6a',
  'dif_hispa': '#9d9d9d',
  'dif_black': '#1696d2',
  'dif_asian': '#55b748',
  'dif_amind': '#ec008b',
  'dif_pacis': '#000000',
  'dif_othra': '#fdbf11',
  'dif_multi': '#fdbf11'
}

var sectorColorObj = {
  'for-profit': '#fdbf11',
  'private-more-selective': '#98cf90',
  'private-nonselective': '#55b748',
  'private-selective': '#408941',
  'public-more-selective': '#73bfe2',
  'public-nonselective': '#1696d2',
  'public-selective': '#0a4c6a',
  'public-2-year': '#1696d2',
  'for-profit-2-year': '#fdbf11'
}



function classify(string){
  return string.replace(/\W+/g, '-').toLowerCase();
}

var COLLEGE_SECTOR_CHECKBOXES =
  '<p class="options-panel-section">College Sectors</p><div class="collapsible"><p class="program-length-hed four-year">4-year<span class="more-info">?</span></p><p class="program-type">Public</p><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked" name="public-nonselective" value="public-nonselective" ><label for="public-nonselective" class="four-year ">Nonselective</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="public-selective" value="public-selective" /><label for="public-selective" class="four-year ">Selective</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="public-highly-selective" value="public-highly-selective" /><label for="public-highly-selective" class="four-year ">More selective</label></div><p class="program-type">Private</p><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="private-nonselective" value="private-nonselective" /><label for="private-nonselective" class="four-year ">Nonselective</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="private-selective" value="private-selective" /><label for="private-selective" class="four-year ">Selective</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="private-highly-selective" value="private-highly-selective" /><label for="private-highly-selective" class="four-year ">More selective</label></div><p class="program-type">For-profit</p><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="for-profit" value="for-profit" /><label for="for-profit" class="four-year ">All</label></div><p class="program-length-hed two-year inactive">2-year<span class="more-info">?</span></p><div class="c-cb"><input type="checkbox" class="sector-boxes two-year inactive " name="two-year-public" value="two-year-public" /><label for="two-year-public" class="two-year inactive ">Public</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes two-year inactive " name="two-year-private" value="two-year-private" /><label for="two-year-private" class="two-year inactive ">For-profit</label></div></div>'

var COLLEGE_SECTOR_RADIOS =
  '<p class="options-panel-section">College Sectors</p><div class="collapsible"><p class="program-length-hed">4-year<span class="more-info">?</span></p><p class="program-type">Public</p><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " id="public-nonselective" name="sector-radios" value="public-nonselective" ><span>Nonselective</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="public-selective"/><span>Selective</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="public-highly-selective"/><span>More selective</span></label></div><p class="program-type">Private</p><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="private-nonselective"/><span>Nonselective</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="private-selective"/><span>Selective</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="private-highly-selective"/><span>More selective</span></label></div><p class="program-type">For-profit</p><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="for-profit"/><span>All</span></label></div><p class="program-length-hed">2-year<span class="more-info">?</span></p><div><label class="n-radio-label"><input type="radio" class="sector-radios two-year n-radio" name="sector-radios" value="two-year-public"/><span>Public</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios two-year n-radio" name="sector-radios" value="two-year-private"/><span>For-profit</span></label></div></div>'



function getQueryParam(param,fallback, validOpts) {
  
    param = param.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + param + '=([^&#]*)');
    var results = regex.exec(location.search);
    if (results === null){
      return fallback;
    }else{
      var testResult = decodeURIComponent(results[1].replace(/\+/g, ' '))
      if(Array.isArray(fallback)){
        return testResult.split(',').filter(function(o){ return validOpts.indexOf(o) != -1 })
      }else{
        // return (validOpts == 'all' || validOpts.indexOf(testResult) == -1) ? fallback : testResult;
        //if validOpts is 'all' or the test result isn't in valid Opts (like it's garbage) use the fallback, otherwise use the testresult
        if (validOpts === 'all'){
          return testResult
        } else if (validOpts.indexOf(testResult) == -1){
          return fallback
        } else if (validOpts.indexOf(testResult) > -1){
          return testResult;
        }
      }
    }
}
function getShareUrl(){
  //the base url (localhost in dev, staging/prop when live) including protocol (https://) and full path
  var shareURL = window.location.origin + window.location.pathname

  //not the cleanest, since the default values are also included in the first few lines of main.js
  //(the calls to getQueryParam) but I don't mind if you don't
  var queryParams = [
    ['geography','geography','national'],
    ['chartType','chart-type','single-year-bar'],
    ['year','year','2017'],
    ['programLength','program-length','four'],
    ['singleRace','single-race','dif_hispa'],
    ['singleSector','single-sector','public-nonselective'],
    ['state','state','Alabama'],
    ['selectedSchool','selected-school',encodeURIComponent('Alabama A & M University')],
    ['arrayRaces','array-race',Object.keys(translateRace)],
    ['arraySectors','array-sectors',Object.keys(translate).slice(2)]//default val is for four year, so doesn't include the 2 two-year options
  ]

  var nonFallback = 0;
  for(var i = 0; i < queryParams.length; i++){
    var key = queryParams[i][0],
      param = queryParams[i][1],
      fallback = queryParams[i][2]

    //special cases for the race and sector arrays
    if(Array.isArray(fallback)){
      //test if array matches default/fallback value. If it does, no need to change URL
      if(higherEdSelections[key].length != fallback.length){
        if(key == 'arrayRaces'){
          //if the first param added to querystring, add a "?" before param, otherwise add "&"
          nonFallback += 1;
          if(nonFallback == 1) shareURL += '?'
          else shareURL += '&'

          //add key/value pair to url
          shareURL += param + '=' + higherEdSelections[key].join(',')
        }else{
          //if the first param added to querystring, add a "?" before param, otherwise add "&"
          nonFallback += 1;
          if(nonFallback == 1) shareURL += '?'
          else shareURL += '&'

          //add key/value pair to url. This is basically just a "reverse lookup" in the translate object
          //(finding key by value instead of value by key), mapped onto the array of selected sectors
          shareURL += param + '=' + higherEdSelections[key].map(function(val){
            return Object.keys(translate).filter(function(k) { return translate[k] == val })[0];
          }).join(',')
        }
      }
    }else{
      var val;
      //schools can include spaces and special chars, so encode for URL
      if(key == 'selectedSchool') val = encodeURIComponent(higherEdSelections[key])
      //same reverse lookup as above, going value -> key for sector
      else if(key == 'singleSector') val = Object.keys(translate).filter(function(k) { return translate[k] == higherEdSelections[key] })[0];
      else val = higherEdSelections[key]
      if(val != fallback){
        //if the first param added to querystring, add a "?" before param, otherwise add "&"
        nonFallback += 1;
        if(nonFallback == 1) shareURL += '?'
        else shareURL += '&'


        //add key/value pair to URL
        shareURL += param + '=' + val
      }
    }

  }

  d3.select('#share-tooltip > input').attr('value', shareURL)
  d3.select('#share-tooltip').style('display','block')
  
  d3.selectAll('.copy-button').on('click', function(){
    d3.event.stopPropagation();
    copyTextToClipboard(shareURL)
    d3.select(this.parentNode).select('.copied-text')
      .style('opacity',1)
      .transition()
      .delay(1500)
      .duration(1000)
      .style('opacity', 0)
  })

  d3.select('#share-tooltip')
    .transition()
    .delay(3000)
    .style('display', 'none')

  return shareURL;
}

//clipboard functions from https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}


