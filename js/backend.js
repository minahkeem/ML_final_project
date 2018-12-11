const left_margin = 50;
const line_w = 840;
const line_h = 16;
const rect_w = 30;

/* averages the player stats into team stats */
function groupTeams(data) {
    var groupData = [];
    var sum = 0;
    for(var key in data) {
        players = data[key];
        var totals = {};
        for(var i = 0; i < players.length; i++) {
            var playerStats = players[i];
            for(var stat in playerStats) { //summing each feature
                if (!totals.hasOwnProperty(stat)) {
                    totals[stat] = playerStats[stat];
                }
                else {
                    totals[stat] += playerStats[stat];
                }
            }
        }
        for(var stat in totals) {
            totals[stat] /= players.length;
        }
        var temp = {};
        temp['team_name']=key;
        temp['team_stats']=totals;
        groupData.push(temp);
    }
    
    return groupData;
}

/* displays team stats as a heat map
   groupAvgData is used for labeling
   stdScaleData is used for drawing the heatmap */
function drawBaseHeatMap(groupAvgData, stdScaleData) {
    heatmap = d3.select("#heat-map");
    
    var lines = heatmap.selectAll("svg.lines")
        .data(stdScaleData)
        .enter()
        .append("svg")
        .attr("width", line_w+left_margin)
        .attr("height", line_h);
    
    lines.append("text")
        .attr("text-anchor", "end")
        .attr("x", left_margin-5)
        .attr("y", 15)
        .text((d) => {
            return d.team_name;
        })
    
    var colors = ["#e25300", "#f48c42", "#ffffff", "#31afce","#2946ad"]; //orange to blue
    var colorRange = d3.range(0, 1, 0.25);
    colorRange.push(1);
    
    var colorScale = d3.scaleLinear()
        .domain(colorRange)
        .range(colors)
        .interpolate(d3.interpolateRgb);
    var colorInterpolate = d3.scaleLinear()
        .domain([-1.75, 1.75])
        .range([0,1]);
    
    pos = left_margin-rect_w;
    
    lines.selectAll("rect.pixels")
        .data((d) => {
            var vals = [];
            for (key in d.team_stats) {
                if (key !== 'SEMI-FINAL' && key !=='PLAYOFF' && key !== 'PLAYER' && key !== 'TEAM') {
                    vals.push([key, d.team_stats[key]]);
                }
            }
            return vals;
        })
        .enter()
        .append("rect")
        .attr("x", () => {
            if (pos >= 810) {
                pos = left_margin-rect_w;
            }
            pos = pos + rect_w;
            return pos;
        })
        .attr("y", 0)
        .attr("width", rect_w)
        .attr("height", line_h)
        .attr("fill", (d) => {
            return colorScale(colorInterpolate(d[1]));
        })
        .append("svg:title")
        .text((d) => {
            return "AVERAGE ".concat(d[0].concat(": ".concat(d[1])));
        });
}

function main() {
    d3.json("/20182019_prediction.json", (rawData) => {
        d3.json("/20182019_prediction_scaled.json", (scaledData) => {
            var groupAvgData = groupTeams(rawData);
            var stdScaleData = groupTeams(scaledData);
            console.log(groupAvgData, stdScaleData);
            drawBaseHeatMap(groupAvgData,stdScaleData);
        })
    });
}

main();