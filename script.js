var plotDiv = document.getElementById('plot');
var x = [];
var y = [];
var labels = [];
var cnt = 0;
var intervalID;
var plotColor = '#1f77b4'; // Default color
var yRange = [-1, 1.8];
var xRange = [0, 100];
var intervalTime = 50;
var windowSize = 100;
var windowStart = 0;
var windowEnd = windowStart + windowSize;
var checkHidden = true;


var plotDiv2 = document.getElementById('plot2');
var x2 = [];
var y2 = [];
var cnt2 = 0;
var intervalID2;
var yRange2 = [-1, 1.8];
var windowSize2 = 100;
var windowStart2 = 0;
var windowEnd2 = windowStart2 + windowSize2;
var plotColor2 = '#1f77b4'; // Default color
var xRange2 = [0, 100];
var intervalTime2 = 50;

function updateInterval(intervalTime) {
    if (intervalID) {
        clearInterval(intervalID);
        intervalID = setInterval(update, intervalTime);
    }
}

function OpenFile(event) {
    cnt = 0;
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
        var lines = reader.result.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var cols = lines[i].split('\t');
            x.push(parseFloat(cols[0])); //
            y.push(parseFloat(cols[1]));
        }
        plot();
    };
    reader.readAsText(input.files[0]);
}


function plot() {
    var layout = {
        title: 'First Graph Real-Time Plotting',
        scrollZoom: true,
        showlegend: true,
        modeBar: { orientation: 'v' },
        xaxis: { range: xRange, fixedrange: true },
        yaxis: { range: yRange },
    };

    Plotly.newPlot(plotDiv, [{ x: [], y: [], text: labels }], layout);
}

function HideDiv() {
    var x = document.getElementById("plot");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function HideDiv2() {
    var x = document.getElementById("plot2");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function HideTotalButtons() {
    var first = document.getElementById("firstDiv");
    var second = document.getElementById("secondDiv");
    var third = document.getElementById("linkedDiv");
    if (first.style.display === "none" && second.style.display === "none") {
        first.style.display = "block";
        second.style.display = "block";
        third.style.display = "none";
    } else {
        first.style.display = "none";
        second.style.display = "none";
        third.style.display = "block";
    }
}

function update() {
    // x.push(cnt);
    // y.push(); // add code to get ECG here

    // update xaxis range
    windowStart = Math.max(cnt - windowSize, 0);
    windowEnd = cnt;
    var update = {
        xaxis: {
            range: [x[windowStart], x[windowEnd]]
        }
    };

    if (cnt != x.length) {
        Plotly.update(plotDiv, { x: [x.slice(windowStart, windowEnd)], y: [y.slice(windowStart, windowEnd)], text: [labels.slice(windowStart, windowEnd)] }, update);        
        cnt++;
    }
}

function togglePlot() {
    updateLabel();
    var slider = document.getElementById('interval-slider');
    var button = document.getElementById("toggle-btn");
    if (button.innerHTML === "Stop") {
        clearInterval(intervalID);
        button.innerHTML = "Play";
        intervalID = 0
    } else {
        intervalID = setInterval(update, slider.value);
        button.innerHTML = "Stop";
    }
}

function updateLabel() {
    var label = document.getElementById('labelInput').value;
    var update = {
        annotations: [ {
                text: label,
                xref: 'paper',
                yref: 'paper',
                x: 1.0,
                y: 1.0,
                showarrow: false,
                font: {
                    size: 16
                }
            }
        ]
    };
    Plotly.update(plotDiv, {}, update);
}

function changeColor() {
    // Generate a random color
    var randomColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);

    // Update the plot color
    Plotly.restyle(plotDiv, { line: { color: randomColor } }, 0);
    plotColor = randomColor; // Save the new color for future updates
}

function ZoomSliderChange(value) {
    windowSize = Math.round(value * x.length / 100);
    windowStart = Math.max(cnt - windowSize, 0);
    if(cnt > windowSize){
        windowEnd = windowStart + windowSize;
    }else{
        windowEnd = (cnt - windowSize) + windowSize;
    }
    var update = {
        xaxis: {
            range: [x[windowStart], x[windowEnd]]
        }
    };
    Plotly.update(plotDiv, { x: [x.slice(windowStart, windowEnd)], y: [y.slice(windowStart, windowEnd)] }, update);
}


function updateYRange() {
    const slider = document.getElementById("yRangeInput").value;
    yRange[0] = parseFloat(slider);
    
    Plotly.update(plotDiv, { yaxis: { range: yRange } });
}

function updateXRange() {
    xRange[1] = parseInt(document.getElementById("xRangeInput").value);
    var slider = (xRange[1] / 500);

    var first = Math.max((slider * cnt) - windowSize, 0);
    var last  = Math.min((slider * cnt), cnt);

    Plotly.update(plotDiv, { xaxis: { range: [x[first], x[last]] } });

    // Plotly.update(plotDiv, { xaxis: { range: [Math.max(cnt - xRange[1], xRange[0]), cnt] } });

    var update = {
        xaxis: {
            range: [x[first], x[last]],
        }
    };

    console.log(first, last)
    // var update = {
    //     xaxis: {
    //         range: [Math.max(cnt - xRange[1], xRange[0]), cnt]
    //     }
    // };
    Plotly.update(plotDiv, { x: [x], y: [y] }, update);
}

function rewindPlot() {
    clearInterval(intervalID);
    x = [];
    y = [];
    cnt = 0;
    windowStart = 0;
    windowEnd = windowStart + windowSize;
    Plotly.purge(plotDiv);
    OpenFile({ target: { files: [document.getElementById("fileInput").files[0]] } });
    var button = document.getElementById("toggle-btn");
    button.innerHTML = "Start";
}


function calculateStatistics(data) {
    var n = (data.length / 100);
    var sum = 0;
    var sumSquared = 0;
    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;
    for (var i = 0; i <= n; i++) {
        var x = data[i];
        sum = sum + x;
        sumSquared += x * x;
        if (x < min) {
            min = x;
        }
        if (x > max) {
            max = x;
        }
    }
    var mean = sum / n;
    var variance = sumSquared / n - mean * mean;
    var stdDev = Math.sqrt(variance);
    return { min: min, max: max, mean: mean, stdDev: stdDev };
}

//second graph setting*********************************************************************************************************



function OpenFile2(event) {
    var input2 = event.target;
    var reader2 = new FileReader();
    reader2.onload = function () {
        var lines2 = reader2.result.split('\n');
        for (var i = 0; i < lines2.length; i++) {
            var cols2 = lines2[i].split('\t');
            y2.push(parseFloat(cols2[1]));
        }
        plot2();
    };
    reader2.readAsText(input2.files[0]);
}

function plot2() {
    var layout2 = {
        title: 'Second Graph Real-Time Plotting',
        scrollZoom: true,
        modeBar: { orientation: 'v' },
        showlegend: true,
        //name:trace1,
        xaxis: { range: [0, windowSize2], fixedrange: true },
        yaxis: { range: yRange2 },
    };
    Plotly.newPlot(plotDiv2, [{ x: x2, y: y2 }], layout2);
}

function update2() {
    x2.push(cnt2);
    y2.push(); // add code to get ECG here
    cnt2++;

    // update xaxis range
    windowStart2 = Math.max(cnt2 - windowSize2, 0);
    windowEnd2 = windowStart2 + windowSize2;
    var update22 = {
        xaxis: {
            range: [windowStart2, windowEnd2]
        }
    };

    Plotly.update(plotDiv2, { x: [x2.slice(windowStart2, windowEnd2)], y: [y2.slice(windowStart2, windowEnd2)] }, update22);
}

function togglePlot2() {
    /*if(linked == true) {
        //updateLabel2();
        var button2 = document.getElementById("toggle-btn");
        if (button2.innerHTML === "Stop") {
            clearInterval(intervalID);
            button2.innerHTML = "Play";
            console.log('happened');
            // Reset slider
            //var slider = document.getElementById('interval-slider2');
            //slider2.value = 100;
            //intervalTime2 = 100;
        } else {
            intervalID = setInterval(update, 50);
            button2.innerHTML = "Stop";
            console.log('happened 2');
        }
    } else {*/
    updateLabel2();
    var button2 = document.getElementById("toggle-btn2");
    if (button2.innerHTML === "Stop") {
        clearInterval(intervalID2);
        button2.innerHTML = "Play";
        // Reset slider
        var slider2 = document.getElementById('interval-slider2');
        slider2.value = 100;
        intervalTime2 = 100;
    } else {
        intervalID2 = setInterval(update2, 50);
        button2.innerHTML = "Stop";
    }
    //}

}

function updateInterval2(value) {
    intervalTime2 = value;
    if (intervalID2) {
        clearInterval(intervalID2);
        intervalID2 = setInterval(update2, intervalTime2);
    }
}

function rewindPlot2() {
    clearInterval(intervalID2);
    x2 = [];
    y2 = [];
    cnt2 = 0;
    windowStart2 = 0;
    windowEnd2 = windowStart2 + windowSize2;
    Plotly.purge(plotDiv2);
    OpenFile2({ target: { files: [document.getElementById("fileInput2").files[0]] } });
    var button2 = document.getElementById("toggle-btn2");
    button2.innerHTML = "Start";
}

function updateLabel2() {
    var label2 = document.getElementById('labelInput2').value;
    var update2 = {
        annotations: [
            {
                text: label2,
                xref: 'paper',
                yref: 'paper',
                x: 1.0,
                y: 1.0,
                showarrow: false,
                font: {
                    size: 16
                }
            }
        ]
    };
    Plotly.update(plotDiv2, {}, update2);
}

function changeColor2() {
    // Generate a random color
    var randomColor2 = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);

    // Update the plot color
    Plotly.restyle(plotDiv2, { line: { color: randomColor2 } }, 0);
    plotColor2 = randomColor2; // Save the new color for future updates
}

function ZoomSliderChange2(value) {
    windowSize2 = Math.round(value * x2.length / 100);
    windowStart2 = Math.max(cnt2 - windowSize2, 0);
    windowEnd2 = windowStart2 + windowSize2;
    var update2 = {
        xaxis: {
            range: [windowStart2, windowEnd2]
        }
    };
    Plotly.update(plotDiv2, { x: [x2.slice(windowStart2, windowEnd2)], y: [y2.slice(windowStart2, windowEnd2)] }, update2);
}

function updateYRange2() {
    
    yRange2[0] = parseFloat(document.getElementById("yRangeInput2").value);
    Plotly.update(plotDiv2, { yaxis: { range: yRange2 } });
}

function updateXRange2() {
    xRange2[1] = parseInt(document.getElementById("xRangeInput2").value);
    const slider = (xRange2[1] / 500);
    //console.log(slider);
    var first = slider * cnt2 - 100;
    var last = slider * cnt2;
    //console.log(last);
    if(first < 0) first = 0;
    if(last > cnt2) last = cnt2;
    //console.log(first);
    //console.log(xRange2[1]);

    Plotly.update(plotDiv2, { xaxis: { range: [first, last] } });
    var update = {
        xaxis: {
            range: [first, last],
        }
    };

    Plotly.update(plotDiv2, { x2: [x2], y2: [y2] }, update);

////////////////////////////////////////////////////////////////////////////////////////
/*
    Plotly.update(plotDiv2, { xaxis: { range: [Math.max(cnt2 - xRange2[1], xRange2[0]), cnt2] } });
    var update2 = {
        xaxis: {
            range: [Math.max(cnt - xRange2[1], xRange2[0]), cnt2]
        }
    };
    Plotly.update(plotDiv2, { x: [x2], y: [y2] }, update2);
    
///////////////////////////////////////////////////////////////////////////////////////
    xRange[1] = parseInt(document.getElementById("xRangeInput").value);

    const slider = (xRange[1] / 500);

    var first = slider * cnt - 100;
    var last = slider * cnt;
    if(first < 0) first = 0;
    if(last > cnt) last = cnt;

    Plotly.update(plotDiv, { xaxis: { range: [first, last] } });

    //Plotly.update(plotDiv, { xaxis: { range: [Math.max(cnt - xRange[1], xRange[0]), cnt] } });

    var update = {
        xaxis: {
            range: [first, last],
        }
    };

    // var update = {
    //     xaxis: {
    //         range: [Math.max(cnt - xRange[1], xRange[0]), cnt]
    //     }
    // };
    Plotly.update(plotDiv, { x: [x], y: [y] }, update);
*/
}

//link settings********************************************


function updatelabelTotal(event) {
    if (event.key != "Enter") return;

    var labeltotal = document.getElementById('labelInputTotal').value;
    var update = {
        annotations: [
            {
                text: labeltotal,
                xref: 'paper',
                yref: 'paper',
                x: 1.0,
                y: 1.0,
                showarrow: false,
                font: {
                    size: 16
                }
            }
        ]
    };

    var update2 = {
        annotations: [
            {
                text: labeltotal,
                xref: 'paper',
                yref: 'paper',
                x: 1.0,
                y: 1.0,
                showarrow: false,
                font: {
                    size: 16
                }
            }
        ]
    };
    Plotly.update(plotDiv, {}, update);
    Plotly.update(plotDiv2, {}, update2);
}


function togglePlotTotal() {

    togglePlot();
    togglePlot2();
    var btn = document.getElementById("toggle-btn-total");
    if (btn.innerHTML == "Start") {
        btn.innerHTML = "pause";
    } else {
        btn.innerHTML = "Start";
    }
}

function rewindPlotTotal() {

    clearInterval(intervalID2);
    clearInterval(intervalID);
    x = [];
    y = [];
    x2 = [];
    y2 = [];
    cnt2 = cnt = 0;
    windowStart2 = windowStart = 0;
    windowEnd = windowStart + windowSize;
    windowEnd2 = windowStart2 + windowSize2;
    Plotly.purge(plotDiv);
    Plotly.purge(plotDiv2);
    OpenFile({ target: { files: [document.getElementById("fileInput").files[0]] } });
    OpenFile2({ target: { files: [document.getElementById("fileInput2").files[0]] } });
    var buttonTotal = document.getElementById("toggle-btn-total");
    buttonTotal.innerHTML = "Start";
    //button.innerHTML = "Start";

    //rewindPlot()

}

function saveaspdf() {
    var element = document.getElementById('plot');
    var opt = {
        margin: 1,
        filename: 'First Graph Real-Time Plotting.pdf',
        image: { type: 'pdf', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    var stats = calculateStatistics(y);
    var html = '<h2>Plotted Signal</h2>' + element.innerHTML; // Add title to the plot in the PDF
    html += '<h3>Statistics</h3><ul><li>Minimum: ' + stats.min + '</li><li>Maximum: ' + stats.max + '</li><li>Mean: ' + stats.mean + '</li><li>Standard Deviation: ' + stats.stdDev + '</li></ul>'; // Add statistics to the PDF
    html2pdf().set(opt).from(html).save();
}

function changeColorTotal() {
    //changeColor();
    //changeColor2();
    // Generate a random color
    var randomColorTotal = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);

    // Update the plot color
    Plotly.restyle(plotDiv2, { line: { color: randomColorTotal } }, 0);
    Plotly.restyle(plotDiv, { line: { color: randomColorTotal } }, 0);
    plotColor2 = randomColorTotal;
    plotColor = randomColorTotal // Save the new color for future updates
}

function ZoomSliderChangeTotal(value) {
    ZoomSliderChange(value);
    ZoomSliderChange2(value);
}

function updateIntervalTotal(value) {
    updateInterval(value);
    updateInterval2(value);
}

function updateXRangeTotal() {
    updateXRange();
    updateXRange2();
}

function updateYRangeTotal() {
    updateYRange();
    updateYRange2();
}
function HideDivTotal() {
    HideDiv();
    HideDiv2();
}

function saveAsPDF2() {
    var element2 = document.getElementById('plot2');
    var opt2 = {
        margin: 1,
        filename: 'Second Graph Real-Time Plotting.pdf',
        image: { type: 'pdf', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    var stats2 = calculateStatistics2(y2);
    var html2 = '<h2>Plotted Signal</h2>' + element2.innerHTML; // Add title to the plot in the PDF
    html2 += '<h3>Statistics</h3><ul><li>Minimum: ' + stats2.min2 + '</li><li>Maximum: ' + stats2.max2 + '</li><li>Mean: ' + stats2.mean2 + '</li><li>Standard Deviation: ' + stats2.stdDev2 + '</li></ul>'; // Add statistics to the PDF
    html2pdf().set(opt2).from(html2).save();
}

function calculateStatistics2(data2) {
    var n2 = (data2.length / 100);
    var sum2 = 0;
    var sumSquared2 = 0;
    var min2 = Number.MAX_VALUE;
    var max2 = Number.MIN_VALUE;
    for (var i2 = 0; i2 <= n2; i2++) {
        var x2 = data2[i2];
        sum2 = sum2 + x2;
        sumSquared2 += x2 * x2;
        if (x2 < min2) {
            min2 = x2;
        }
        if (x2 > max2) {
            max2 = x2;
        }
    }
    var mean2 = sum2 / n2;
    var variance2 = sumSquared2 / n2 - mean2 * mean2;
    var stdDev2 = Math.sqrt(variance2);
    return { min2: min2, max2: max2, mean2: mean2, stdDev2: stdDev2 };
}

/*function saveAsPDFtotal() {
    var element2 = document.getElementById('plot2');
    var element = document.getElementById('plot');
    var opt = {
        margin: 1,
        filename: 'First Graph Real-Time Plotting.pdf',
        image: { type: 'pdf', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }; var opt2 = {
        margin: 1,
        filename: 'Second Graph Real-Time Plotting.pdf',
        image: { type: 'pdf', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    var stats = calculateStatistics(y);
    var html = '<h2>Plotted Signal</h2>' + element.innerHTML; // Add title to the plot in the PDF
    html += '<h3>Statistics</h3><ul><li>Minimum: ' + stats.min + '</li><li>Maximum: ' + stats.max + '</li><li>Mean: ' + stats.mean + '</li><li>Standard Deviation: ' + stats.stdDev + '</li></ul>'; // Add statistics to the PDF
    html2pdf().set(opt).from(html).save();

    var stats2 = calculateStatistics2(y2);
    var html2 = '<h2>Plotted Signal</h2>' + element2.innerHTML; // Add title to the plot in the PDF
    html2 += '<h3>Statistics</h3><ul><li>Minimum: ' + stats2.min2 + '</li><li>Maximum: ' + stats2.max2 + '</li><li>Mean: ' + stats2.mean2 + '</li><li>Standard Deviation: ' + stats2.stdDev2 + '</li></ul>'; // Add statistics to the PDF
    html2pdf().set(opt2).from(html2).save();
}*/
function saveAsPDFtotal() {
    var elementTotal=document.getElementById('plot2');
    var element = document.getElementById('plot');
    var opt = {
        margin: 1,
        filename: 'First Graph Real-Time Plotting.pdf',
        image: { type: 'pdf', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }; var opt2 = {
        margin: 1,
        filename: 'Second Graph Real-Time Plotting.pdf',
        image: { type: 'pdf', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    var stats = calculateStatistics(y);
    var stats2 = calculateStatistics(y2);
    var html = '<h2>Plotted Signal</h2>' + element.innerHTML + elementTotal.innerHTML; // Add title to the plot in the PDF
    html += '<h3>Statistics</h3><ul><li>Minimum: ' + stats.min + '</li><li>Maximum: ' + stats.max + '</li><li>Mean: ' + stats.mean + '</li><li>Standard Deviation: ' + stats.stdDev + '</li></ul>'; // Add statistics to the PDF
    html2pdf().set(opt).from(html).save();

    
}