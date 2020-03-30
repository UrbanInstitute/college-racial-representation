

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

  function classify(string){
  return string.replace(/\W+/g, '-').toLowerCase();
}

  var COLLEGE_SECTOR_CHECKBOXES =
  '<p class="options-panel-section">College Sectors</p><div class="collapsible"><p class="program-length-hed four-year">4-year<span class="more-info">?</span></p><p class="program-type">Public</p><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked" name="public-nonselective" value="public-nonselective" ><label for="public-nonselective" class="four-year ">Nonselective</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="public-selective" value="public-selective" /><label for="public-selective" class="four-year ">Selective</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="public-highly-selective" value="public-highly-selective" /><label for="public-highly-selective" class="four-year ">More selective</label></div><p class="program-type">Private</p><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="private-nonselective" value="private-nonselective" /><label for="private-nonselective" class="four-year ">Nonselective</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="private-selective" value="private-selective" /><label for="private-selective" class="four-year ">Selective</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="private-highly-selective" value="private-highly-selective" /><label for="private-highly-selective" class="four-year ">More selective</label></div><p class="program-type">For-profit</p><div class="c-cb"><input type="checkbox" class="sector-boxes four-year checked " name="for-profit" value="for-profit" /><label for="for-profit" class="four-year ">All</label></div><p class="program-length-hed two-year inactive">2-year<span class="more-info">?</span></p><div class="c-cb"><input type="checkbox" class="sector-boxes two-year inactive " name="two-year-public" value="two-year-public" /><label for="two-year-public" class="two-year inactive ">Public</label></div><div class="c-cb"><input type="checkbox" class="sector-boxes two-year inactive " name="two-year-private" value="two-year-private" /><label for="two-year-private" class="two-year inactive ">For-profit</label></div></div>'

  var COLLEGE_SECTOR_RADIOS =
  '<p class="options-panel-section">College Sectors</p><div class="collapsible"><p class="program-length-hed">4-year<span class="more-info">?</span></p><p class="program-type">Public</p><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " id="public-nonselective" name="sector-radios" value="public-nonselective" ><span>Nonselective</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="public-selective"/><span>Selective</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="public-highly-selective"/><span>More selective</span></label></div><p class="program-type">Private</p><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="private-nonselective"/><span>Nonselective</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="private-selective"/><span>Selective</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="private-highly-selective"/><span>More selective</span></label></div><p class="program-type">For-profit</p><div><label class="n-radio-label"><input type="radio" class="sector-radios n-radio " name="sector-radios" value="for-profit"/><span>All</span></label></div><p class="program-length-hed">2-year<span class="more-info">?</span></p><div><label class="n-radio-label"><input type="radio" class="sector-radios two-year n-radio" name="sector-radios" value="two-year-public"/><span>Public</span></label></div><div><label class="n-radio-label"><input type="radio" class="sector-radios two-year n-radio" name="sector-radios" value="two-year-private"/><span>For-profit</span></label></div></div>'


