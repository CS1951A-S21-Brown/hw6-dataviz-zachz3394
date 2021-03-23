// Add your JavaScript code here
{
const margin = {top: 20, right: 50, bottom: 50, left: 100};

const width=900;
const height=350;

let datapath = 'data/video_games.csv';

let region = document.getElementById('region').value;

let svg = d3.select('#genres')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let x = d3.scaleBand()
    .range([0, width - margin.left - margin.right])
    .padding(0.1);

let y = d3.scaleLinear()
    .range([margin.top, height - margin.bottom - margin.top]);

svg.append('text')
    .attr('transform', `translate(${(width - margin.left - margin.right) / 2}, ${height - margin.bottom + 30})`)
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Genre');

svg.append('text')
    .attr('transform', `translate(-60, ${(height - margin.bottom) / 2}) rotate(270)`)
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Sales (in millions)')

let title = svg.append('text')
    .attr('transform', `translate(${(width - margin.left - margin.right) / 2}, ${margin.top - 10})`)
    .style('text-anchor', 'middle')
    .style('font-size', '18px');

let y_axis_label = svg.append('g');
let x_axis_label = svg.append('g');

function updateRegion() {
    updateRegionPie();
    region = document.getElementById('region').value;
    title.text(`${region === 'Global' ? 'Worldwide' : region} by Genre`);
    d3.csv(datapath).then(function(data) {
        data = cleanDataGenre(data, region);
        console.log(data);
        let maxY = data.reduce(function (a, b) {
            if (a['Sales'] > b['Sales']) return a;
            return b;
        })['Sales'];
        x.domain(data.map(x => x['Genre']))
        y.domain([maxY, 0]);
        x_axis_label.call(
            d3.axisBottom(x).tickSize(0).tickPadding(10))
            .attr('transform', `translate(0, ${height - margin.bottom - margin.top})`);
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let bars = svg.selectAll('rect').data(data);
        bars.enter().append('rect')
            .merge(bars).transition()
            .duration(1000).attr('x', d => x(d['Genre']))
            .attr('y', d => y(d['Sales']))
            .attr('width', x.bandwidth() - 10)
            .attr('height', d => y(0) - y(d['Sales']))
            .style('fill', '#2A7221');

        bars.exit().remove();
    });
}

function cleanDataGenre(data, region) {
    data = data.map(function(x) {x[region] = parseFloat(x[region], 10); return x;});
    const genres = new Map();
    for (const g of data) {
        const genre = g['Genre'];
        if (genres.has(genre)) {
            genres.set(genre, genres.get(genre) + g[region]);
        } else {
            genres.set(genre, g[region]);
        }
    }
    const cleaned = [];
    for (const [key, val] of genres.entries()) {
        cleaned.push({Genre: key, Sales: val});
    }

    cleaned.sort(function(a, b) {
        return a['Genre'] > b['Genre'];
    });
    return cleaned;
}

updateRegion();

}
