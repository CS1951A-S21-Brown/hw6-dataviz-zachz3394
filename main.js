// Add your JavaScript code here
{
const margin = {top: 20, right: 100, bottom: 50, left: 200};

const width=900;
const height=350;

let datapath = 'data/video_games.csv';

let year = '';


let svg = d3.select('#toptens')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let x = d3.scaleLinear()
    .range([0, width - margin.left - margin.right]);

let y = d3.scaleBand()
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

svg.append('text')
    .attr('transform', `translate(${(width - margin.left - margin.right) / 2}, ${height - margin.top - 10})`)
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Global Sales (millions)');

let title = svg.append('text')
    .attr('transform', `translate(${(width - margin.left - margin.right) / 2}, ${margin.top - 10})`)
    .style('text-anchor', 'middle')
    .style('font-size', '18px');

let y_axis_label = svg.append('g');
let countRef = svg.append('g');

function update() {
    year = document.getElementById('year').value;
    title.text(`Top 10 Games of ${year ? year : 'All Time'} by Global Sales`);
    d3.csv(datapath).then(function(data) {
        data = cleanDataYear(data, year);
        console.log(data);
        if (data.length < 1) {
            window.alert(`No games found for ${year}`);
            return;
        }
        x.domain([0, data[0]['Global_Sales']]);
        y.domain(data.map(x => x['Name']))
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let bars = svg.selectAll('rect').data(data);
        bars.enter().append('rect')
            .merge(bars).transition()
            .duration(1000).attr('x', x(0))
            .attr('y', d => y(d['Name'])) 
            .attr('width', d => x(d['Global_Sales']))
            .attr('height',  y.bandwidth())
            .style('fill', '#9BC53D');

        let counts = countRef.selectAll('text').data(data);

        counts.enter()
            .append('text').merge(counts)
            .transition().duration(1000)
            .attr('x', d => x(d['Global_Sales']) + 5)       
            .attr('y', d => y(d['Name']) + 17)      
            .style('text-anchor', 'start')
            .text(d => d['Global_Sales'].toFixed(2));

        bars.exit().remove();
        counts.exit().remove();
    });
}

function cleanDataYear(data, year) {
    if (year) data = data.filter(function(x) {return x['Year'] === year});
    data = data.map(function(x) {x['Global_Sales'] = parseFloat(x['Global_Sales'], 10); return x;});

    let cleaned = [];
    if (year) {
        for (let i = 0; i < data.length; i++) {
            let game1 = {...data[i]};
            game1['Global_Sales'] = 0;
            let isDup = false;
            for (let j = 0; j < data.length; j++) {
                let game2 = data[j];
                if (game1['Name'] === game2['Name']) {
                    if (i <= j) game1['Global_Sales'] += game2['Global_Sales'];
                    else {
                        isDup = true; 
                        break;
                    }
                }
            }
            if (!isDup) cleaned.push(game1);
        }
    } else {
        cleaned = [...data];
    }
    cleaned.sort(function(a, b) {
        if (a['Global_Sales'] - b['Global_Sales'] < 0) return 1;
        if (a['Global_Sales'] - b['Global_Sales'] > 0) return -1;
        return 0;
    });
    return cleaned.slice(0, 10);
}
update();
}
