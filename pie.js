{
const width=500;
const height=500;
const margin=50;

let datapath = 'data/video_games.csv';

let region = document.getElementById('region').value;
let radius = height / 2 - margin;
let tooltip = d3.select('#genres')
    .append('div')
    .style('opacity', 0)
    .style('background-color', 'white')
    .style('border-radius', '3px')
    .style('padding', '10px')

let svg = d3.select('#genres')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width/2}, ${height/2})`);


let over = function(_d) {
    tooltip.style('opacity', 1);
}

let move = function(d) {
    tooltip.html(`${d.data['Genre']} games sold ${d.data['Sales'].toFixed(2)} million copies,
        accounting for ${(100 * d.data['Percent']).toFixed(1)}% of total sales in this region`)
      .style("left", d + "px")     
      .style("top", d + "px");
}

let leave = function(_d) {
    tooltip.style('opacity', 0)
}
function updateRegionPie() {
    region = document.getElementById('region').value;
    d3.csv(datapath).then(function(data) {
        data = cleanDataGenre(data, region);
        let color = d3.scaleOrdinal()
					  .domain(data.map(x => x['Genre']))
					  .range(d3.schemeSet2);
        let pie = d3.pie().value(d => d['Sales']);
        let portions = pie(data);

        let arcGen = d3.arc().innerRadius(0).outerRadius(radius);
        let arcGen2 = d3.arc().innerRadius(radius + 20).outerRadius(radius + 20);
    
        let slices = svg.selectAll('path').data(portions);
        let labs = svg.selectAll('text').data(portions);
        slices.enter()
           .append('path')
           .on('mouseover', over)
           .on('mousemove', move)
           .on('mouseleave', leave)
           .merge(slices).transition()
           .duration(1000)
           .attr('d', arcGen)
           .attr('fill', d => color(d.data['Genre']))
           .attr('stroke', 'white')
        
        labs.enter()
           .append('text')
           .merge(labs).transition()
           .duration(1000)
           .text(d => d.data['Genre'])
           .attr('transform', d => 'translate(' + arcGen2.centroid(d) + ')')
           .style('text-anchor', 'middle')

        slices.exit().remove();
        labs.exit().remove();
	});
}


function cleanDataGenre(data, region) {
    data = data.map(function(x) {x[region] = parseFloat(x[region], 10); return x;});
    const genres = new Map();
    let totalSales = 0;
    for (const g of data) {
        const genre = g['Genre'];
        totalSales += g[region];
        if (genres.has(genre)) {
            genres.set(genre, genres.get(genre) + g[region]);
        } else {
            genres.set(genre, g[region]);
        }
    }
    const cleaned = [];
    for (const [key, val] of genres.entries()) {
        cleaned.push({Genre: key, Sales: val, Percent: val/totalSales});
    }

    cleaned.sort(function(a, b) {
        return a['Genre'] > b['Genre'];
    });
    return cleaned;
}

updateRegionPie();

}
