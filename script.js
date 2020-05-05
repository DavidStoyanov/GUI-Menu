window.onload = (event) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const translateWidth = Math.ceil(width / 2);
    const translateHeight = Math.ceil((height / 2) - 50);

    const svg = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Function for main arc
    function createMainArc(id, innerRadius, outerRadius, rgba, data) {
        const padAngle = 0.00;
        const dataObj = createArc(id, innerRadius, outerRadius, padAngle, rgba, data);
        return dataObj.id;
    }

    // Function for level arc
    function createLevelArc(id, innerRadius, outerRadius, padAngle, rgba, data) {
        const classes = "level";
        const dataObj = createArc(id, innerRadius, outerRadius, padAngle, rgba, data, classes);

        dataObj.innerSection.append("g")
            .attr("transform", function(d) {
                const centroidXY = dataObj.arc.centroid(d);
                const translate = `translate(${centroidXY[0]}, ${centroidXY[1]})`;
                return `rotate(${dataObj.rotate}) ` + translate;
            })
            .attr("class", "inner-image")
            .append("svg:image")
            .attr("xlink:href",function(d) {return d.data.svg;})
            .attr("width", "32")
            .attr("height", "32")
            .attr("transform", function(d) {
                const translate = "translate(-10, -20)";
                const rot = `rotate(${-dataObj.rotate})`;
                const scale = `scale(${d.data.scale ? d.data.scale : 1.0})`;
                return [rot, scale, translate].join(' ');
            })
            .attr("class", function(d) { return `level-${d.data.level}-index-${d.data.index}` });

        return dataObj.id;
    }

    // Function for level border arc
    function createLevelBorderArc(id, innerRadius, outerRadius, padAngle, rgba, data) {
        const classes = "border";
        const dataObj = createArc(id, innerRadius, outerRadius, padAngle, rgba, data, classes);
        return dataObj.id;
    }

    // Function form side arc
    function createSideArc(id, innerRadius, outerRadius, padAngle, rgba, data) {
        const dataObj = createArc(id, innerRadius, outerRadius, padAngle, rgba, data);
        return dataObj.id;
    }

    // Crate base arc
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

        return { id, pie, rotate, arc, innerSection };
    }


    createMainArc("main", 0, 90, "rgba(0, 0, 0, 0.7)", [1]);

    createLevelArc("level01", 100, 170, 0.05, "rgba(0, 0, 0, 0.5)", data);
    createLevelBorderArc("level01Border", 170, 175, 0.05,  "rgba(0, 0, 0, 0.8)", data);

    createLevelArc("level01", 185, 255, 0.05, "rgba(0, 0, 0, 0.5)", refuelData);
    createLevelBorderArc("level01Border", 255, 260, 0.05,  "rgba(0, 0, 0, 0.8)", refuelData);

    createSideArc("side", 260, translateWidth, 0.05,  "rgba(0, 0, 0, 0.0)", refuelData);



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

        groupList.filter('.level').removeClass('idle');
        groupList.filter('.border').removeClass('idle');
        groupList.filter('.level').addClass('active');
        groupList.filter('.border').addClass('active');
    }

    function onMouseLeave() {
        // Apply styles for the class
        const classes = $(this).attr('class').split(/\s+/);
        const groupList = getGroupList(classes);
        if(!groupList) return;

        groupList.filter('.level').removeClass('active');
        groupList.filter('.border').removeClass('active');
        groupList.filter('.level').addClass('idle');
        groupList.filter('.border').addClass('idle');
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