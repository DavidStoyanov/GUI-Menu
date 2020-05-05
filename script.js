window.onload = (event) => {
    const dimension = window.innerHeight;
    const translateWidth = Math.ceil(dimension / 2);
    const translateHeight = Math.ceil((dimension / 2) - 50);

    const svg = d3.select("#container").append("svg")
        .attr("width", dimension)
        .attr("height", dimension);

    const data = [
        {
            name: "Refuel",
            id: "refuel",
            level: "01",
            index: "00",
            svg: "./svg/refuel.png"
        },
        {
            name: "Vehicle",
            id: "vehicle",
            level: "01",
            index: "01",
            svg: "./svg/vehicle.png"
        },
        {
            name: "Speedometer",
            id: "speedometer",
            level: "01",
            index: "02",
            svg: "./svg/speedometer.png"
        },
        {
            name: "House",
            id: "house",
            level: "01",
            index: "03",
            svg: "./svg/house.png"
        }
    ];

    const pie = d3.pie().value(function(d) { return 1 })(data);

    const arc = d3.arc()
        .innerRadius(100)
        .outerRadius(170)
        .padAngle(0.05)
        .padRadius(75);

    const arc2 = d3.arc()
        .innerRadius(170)
        .outerRadius(175)
        .padAngle(0.05)
        .padRadius(75);

    const section = svg.append("g")
        .attr("transform", `translate(${translateWidth},${translateHeight})`)
        .selectAll("path").data(pie);

    const section2 = svg.append("g")
        .attr("transform", `translate(${translateWidth},${translateHeight})`)
        .selectAll("path").data(pie);

    section.enter().append("path")
        .attr("d", arc)
        .attr("fill", "rgba(0, 0, 0, 0.5)")
        .attr("transform", "rotate(45)")
        .attr("class", function(d) { return `arc level-${d.data.level}-index-${d.data.index}` });


    section2.enter().append("path")
        .attr("d", arc2)
        .attr("fill", "rgba(0, 0, 0, 0.8)")
        .attr("transform", "rotate(45)")
        .attr("class", function(d) { return `border level-${d.data.level}-index-${d.data.index}` });


    if (jQuery === undefined) {
        console.warn('jQuery did not load!');
        return;
    }

    const container = $('#container');
    const path = $('svg path');
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