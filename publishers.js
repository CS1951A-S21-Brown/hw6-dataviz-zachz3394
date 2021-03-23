{
const margin = {top: 20, right: 100, bottom: 50, left: 200};

const width=900;
const height=350;

let datapath = 'data/video_games.csv';

let genre = document.getElementById('genre').value;
let sort = document.querySelector('input[name="sort"]:checked').value;

let svg = d3.select('#publishers')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let x = d3.scaleLinear()
    .range([0, width - margin.left - margin.right]);

let y = d3.scaleBand()
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

let avgX = d3.scaleLinear()
    .range([0, width - margin.left - margin.right]);

let title = svg.append('text')
    .attr('transform', `translate(${(width - margin.left - margin.right) / 2}, ${margin.top - 10})`)
    .style('text-anchor', 'middle')
    .style('font-size', '18px');

let legend = svg.append('g')
    .style('background-color', 'black')
    .attr('transform', `translate(${(width - margin.right - margin.left - 125)}, ${height-margin.top-margin.bottom - 50})`)

legend.append('circle').attr('r', 6)
        .style('fill', '#DD6E42')
legend.append('circle').attr('r', 6)
        .style('fill', '#50C9CE')
        .attr('transform', 'translate(0, 20)')
legend.append('text').text('Total Sales for Genre (in millions)')
        .style('font-size', '12px')
        .attr('transform', 'translate(10, 4)')
legend.append('text').text('Average Sales per Game (in millions)')
        .style('font-size', '12px')
        .attr('transform', 'translate(10, 24)')


let y_axis_label = svg.append('g');
let countRef = svg.append('g');

function updatePublisher() {
    genre = document.getElementById('genre').value;
    sort = document.querySelector('input[name="sort"]:checked').value;
    title.text(`Top 10 Publishers for ${genre} Games by Sales`);
    d3.csv(datapath).then(function(data) {
        data = cleanDataPublisher(data, genre, sort);
        console.log(data);
        let maxTotal = data.reduce(function (a, b) {
            if (a['Sales'] > b['Sales']) return a;
            return b;
        })['Sales'];
        x.domain([0, maxTotal]);
        y.domain(data.map(x => x['Publisher']))
        let maxAvg = data.reduce(function (a, b) {
            if (a['Average'] > b['Average']) return a;
            return b;
        })['Average'];
        avgX.domain([0, maxAvg]);
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let bars = svg.selectAll('.total').data(data);
        bars.enter().append('rect')
            .merge(bars).transition()
            .duration(1000).attr('x', x(0))
            .attr('class', 'total')
            .attr('y', d => y(d['Publisher'])) 
            .attr('width', d => x(d['Sales']))
            .attr('height', y.bandwidth()/2)
            .style('fill', '#DD6E42');

        let avgBars = svg.selectAll('.avg').data(data);
        avgBars.enter().append('rect')
            .merge(avgBars).transition()
            .duration(1000).attr('x', x(0))
            .attr('class', 'avg')
            .attr('y', d => y(d['Publisher']) + y.bandwidth()/2) 
            .attr('width', d => avgX(d['Average']))
            .attr('height', y.bandwidth()/2)
            .style('fill', '#50C9CE');

        let counts = countRef.selectAll('.totalLabels').data(data);
        counts.enter()
            .append('text').merge(counts)
            .transition().duration(1000)
            .attr('class', 'totalLabels')
            .attr('x', d => x(d['Sales']) + 5)       
            .attr('y', d => y(d['Publisher']) + 8)      
            .style('text-anchor', 'start')
            .text(d => d['Sales'].toFixed(2));

        let avgCounts = countRef.selectAll('.avgLabels').data(data);
        avgCounts.enter()
            .append('text').merge(avgCounts)
            .transition().duration(1000)
            .attr('class', 'avgLabels')
            .attr('x', d => avgX(d['Average']) + 5)       
            .attr('y', d => y(d['Publisher']) + 21)
            .style('text-anchor', 'start')
            .text(d => d['Average'].toFixed(2));

        bars.exit().remove();
        avgBars.exit().remove();
        counts.exit().remove();
        avgCounts.exit().remove();
    });
}

function cleanDataPublisher(data, genre, sortOn) {
    if (year) data = data.filter(function(x) {return x['Genre'] === genre});
    data = data.map(function(x) {x['Global_Sales'] = parseFloat(x['Global_Sales'], 10); return x;});

    const publishers = new Map();
    for (const g of data) {
        const pub = g['Publisher'];
        if (publishers.has(pub)) {
            const [total, ct] = publishers.get(pub);
            publishers.set(pub, [total + g['Global_Sales'], ct + 1]);
        } else {
            publishers.set(pub, [g['Global_Sales'], 1]);
        }
    }
    const cleaned = [];
    for (const [key, val] of publishers.entries()) {
        cleaned.push({Publisher: key, Sales: val[0], Average: val[0]/val[1]});
    }
    cleaned.sort(function(a, b) {
        if (a[sortOn] - b[sortOn] < 0) return 1;
        if (a[sortOn] - b[sortOn] > 0) return -1;
        return 0;
    });
    return cleaned.slice(0, 10);
}
updatePublisher();
}
