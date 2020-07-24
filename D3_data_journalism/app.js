
function makeResponsive() {

    // if SVG area isn't empty, remove it
    var svgArea = d3.select('#scatter').select('svg');

    if (!svgArea.empty()) {
        svgArea.remove();
    };

    // svg container
    var svgHeight = window.innerHeight;
    var svgWidth = window.innerWidth - 200;

    // margins
    var margin = {
        top: 50,
        right: 50,
        bottom: 150,
        left: 100
    };

    // chart area minus margins
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;

    var label

    // create svg container
    var svg = d3.select("#scatter").append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth)

    // shift everything over by the margins
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .classed('chart', true)
        
    //Initial chart axis parameters
    var currentX = "poverty"
    var currentY = "healthcare"

    //function for updating x-scale upon label click
    function xScaleUpdate(censusData, currentX) {
        // create scales
        var xScale = d3.scaleLinear()
          .domain([d3.min(censusData, d => d[currentX] - 1),
            d3.max(censusData, d => d[currentX])
        ])
          .range([0, chartWidth]);
        return xScale;
      };

    // function to update x-axis upon label click
    function renderAxes(newXScale, xLabel) {
        console.log(newXScale);
        var xAxis = d3.axisBottom(newXScale);
      
        svg.select(".xAxis").transition()
          .duration(1000)
          .call(xAxis);
      
        return xLabel;
      };

    // function to update tooltip
    function updateToolTip(currentX, circlesGroup) {
        var label = currentX

        // call tooltip
        var toolTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([30, -30])
            .html(function(d) {
                return `<div>${d.state}</div><div>${label}: ${d[currentX]}</div>`
            });

        circlesGroup.call(toolTip);

        circlesGroup
            .on("mouseover", function(d) {
                toolTip.show(d, this);
            })
            .on("mouseout", function(d) {
                toolTip.hide(d);
            });
        return circlesGroup;
    };

    // read in the data
    d3.csv("data/data.csv").then(function(censusData, err) {
        

        // parse the data to decimals
        censusData.forEach(d => {
            d["poverty"] = parseFloat(d["poverty"])
            d["healthcare"] = parseFloat(d["healthcare"])
            d["age"] = parseFloat(d["age"])
            d["income"] = parseFloat(d["income"])
        }) 
    console.log(censusData);
        //call xScaleUpdate function
        // var xScale = xScaleUpdate(censusData, currentX);
        var xScale = d3.scaleLinear()
          .domain([d3.min(censusData, d => d[currentX] - 1),
            d3.max(censusData, d => d[currentX])
        ])
          .range([0, chartWidth]);

        var yScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[currentY] - 2), d3.max(censusData, d => (d[currentY]))])
            .range([chartHeight, 0]);

        // create axes
        var yAxis = d3.axisLeft(yScale);
        var xAxis = d3.axisBottom(xScale);

        // set x to the bottom of the chart
        var xLabel = chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .classed("xAxis", true)
        .call(xAxis);
        console.log(xAxis);

        // set y to the y axis
        chartGroup.append("g")
        .call(yAxis);


        // create circle markers
        var circlesGroup = chartGroup.selectAll('circles')
            .data(censusData)
            .enter();

        circlesGroup
            .append("circle")
            .attr("cx", d => xScale(d[currentX]))
            .attr("cy", d => yScale(d[currentY]))
            .attr("r", "15")
            .attr("class", 'stateCircle')


        chartGroup.selectAll('text').exit().data(censusData)   
            .enter()
            .append('text')
            
            .attr('class', 'stateText')
            .attr("dx", d => xScale(d[currentX]))
            .attr("dy", d => yScale(d[currentY])+7)
            .text(d => d.abbr)


        // append svg group for x-axis labels
        svg.append('g')
            .attr('class', 'xText');

        var xText = d3.select('.xText')
        var xLabels = xText.attr("transform", `translate(${svgWidth/2}, ${svgHeight -100})`);

        // append x-axis label text
        var povertyLabel = xText.append('text')
            .attr("data-name","poverty") // for event listener
            .attr("data-axis","x")
            .text('Poverty (%)')
            .classed('active', true);

        var ageLabel = xText.append('text')
            .text('Age (Median)')
            .attr("data-name","age") // for event listener
            .attr("data-axis","x")
            .classed('inactive', true)
            .attr('y', 26); // places the label below the first one

        var incomeLabel = xText.append('text')
            .text('Income (Median)')
            .attr("data-name","income")
            .attr("data-axis","x")
            .classed('inactive', true)
            .attr('y', 52); //places the label below the other tw0

        //append y axis
        svg.append('g')
            .attr('class', 'yText');

        chartGroup = d3.selectAll(".yText").append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left / 2)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "1em")
            .classed("axis-text active", true)
            .text("Healthcare (%)");

        // x-axis labels event listener
    xLabels.selectAll('text')
        .on('click', function() {
            var dataName = d3.select(this).attr('data-name');

            if(dataName !== currentX) {
                currentX = dataName;
                
                console.log(censusData, currentX)

                // xScale = xScaleUpdate(censusData, currentX);
                xScale.domain([d3.min(censusData, d => d[currentX] - 1),
                  d3.max(censusData, d => d[currentX])
              ]);
                
                console.log(d3.min(censusData, d => d[currentX] - 1));

                // xLabel = renderAxes(xScale, xLabel);
                // var xAxis = d3.axisBottom(xScale);
      
                svg.select(".xAxis").transition()
                  .duration(100)
                  .call(xAxis);
                var cGroup = chartGroup.selectAll('circle')

                chartGroup.selectAll('.stateText').remove()

                chartGroup.selectAll('text').exit()
                .data(censusData)   
                .enter()
                .append('text')
                .transition().duration(1100)
                .attr('class', 'stateText')
                .attr("dx", d => xScale(d[currentX]))
                .attr("dy", d => yScale(d[currentY])+5)
                .text(d => d.abbr)

                // var cGroup2 = renderCircles(cGroup, xScale, currentX)
                cGroup.transition()
                    .duration(1000)
                    .attr("cx", d => xScale(d[currentX]));
                
                var cGroup3 = updateToolTip(currentX, cGroup)

                if (currentX === 'age') {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);    
                } else if (currentX === 'income') {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true); 
                } else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

}).catch(function(error) {
    console.log(error)
})
};

makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);