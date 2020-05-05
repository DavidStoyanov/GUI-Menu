window.onload = (event) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const translateWidth = Math.ceil(width / 2);
    const translateHeight = Math.ceil((height / 2) - 50);

    const svg = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height);

    const data = [
        {
            name: "Refuel",
            id: "refuel",
            level: "01",
            index: "00",
            svg: "./svg/refuel.svg"
        },
        {
            name: "Vehicle",
            id: "vehicle",
            level: "01",
            index: "01",
            svg: "./svg/vehicle.svg"
        },
        {
            name: "Speedometer",
            id: "speedometer",
            level: "01",
            index: "02",
            svg: "./svg/speedometer.svg"
        },
        {
            name: "Dance",
            id: "dance",
            level: "01",
            index: "03",
            svg: "./svg/dance.svg"
        }
    ];

    // createArc("main", 0, 90, 0.00, "rgba(0, 0, 0, 0.8)", [1]);
    createArc("level01", 100, 170, 0.05, "rgba(0, 0, 0, 0.5)", data, "arc");
    // createArc("level01Border", 170, 175, 0.05,  "rgba(0, 0, 0, 0.8)", data, "border");
    // createArc("side", 175, translateWidth, 0.05,  "rgba(0, 0, 0, 0.0)", data);

    function createArc(id, innerRadius, outerRadius, padAngle, rgba, data, classes) {
        const pie = d3.pie().value(function(d) { return 1 })(data);
        const rotate = -(360 / (data.length * 2));

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .padAngle(padAngle)
            .padRadius(75);

        const section = svg.append("g")
            .attr("transform", `translate(${translateWidth},${translateHeight})`)
            .attr('id', id)
            .selectAll("path").data(pie);

        classes = classes ? (" " + classes) : "";

        const innerSection = section.enter().append("g");

        innerSection.append("path")
            .attr("d", arc)
            .attr("fill", rgba)
            .attr("transform", `rotate(${rotate})`)
            .attr("class", function(d) { return `level-${d.data.level}-index-${d.data.index}${classes}` });

        innerSection.append("g")
            .attr("transform", function(d) {
                const centroidXY = arc.centroid(d);
                const translate = `translate(${centroidXY[0]}, ${centroidXY[1]})`;
                return `rotate(${rotate}) ` + translate;
            })
            .attr("class", "inner-image")
            .append("svg:image")
                .attr("xlink:href",function(d) {return d.data.svg;})
                .attr("width", "32")
                .attr("height", "32")
                .attr("transform", function(d) {
                    const translate = "translate(-10, -20)";
                    return `rotate(${-rotate}) ` + translate;
                })
                .attr("class", function(d) { return `level-${d.data.level}-index-${d.data.index}` });

    }



    if (jQuery === undefined) {
        console.warn('jQuery did not load!');
        return;
    }

    //$("#side").remove();

    const container = $('#container');
    const path = $('svg g path, svg g image');
    path.on('mouseenter', onMouseEnter);
    path.on('mouseleave', onMouseLeave);

    function onMouseEnter() {
        // Apply styles for the class
        const classes = $(this).attr('class').split(/\s+/);
        const groupList = getGroupList(classes);
        if(!groupList) return;

        groupList.filter('.arc').css('fill', 'rgba(103, 180, 211, 0.5)');
        groupList.filter('.border').css('fill', 'rgba(103, 180, 211, 0.8)');
    }

    function onMouseLeave() {
        // Apply styles for the class
        const classes = $(this).attr('class').split(/\s+/);
        const clazz = getGroupList(classes);
        if(!clazz) return;

        clazz.filter('.arc').css('fill', 'rgba(0, 0, 0, 0.5)');
        clazz.filter('.border').css('fill', 'rgba(0, 0, 0, 0.8)');
    }

    function getGroupList(arr) {
        for (const x of arr) {
            if(x.startsWith('level') && x.includes('index')) {
                return $('.'.concat(x));
            }
        }

        return null;
    }

};