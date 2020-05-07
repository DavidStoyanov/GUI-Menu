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

        dataObj.innerSection.on('click', closeMenu);

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
            .attr("class", function(d) { return `level-${d.data.level}-index-${d.data.index}` })
            .attr("data-data", function(d) { return d.data.data })
            .on('click', function(ev) {
                console.log(ev.data.data);
                menuEnter(ev.data.data);
            });

        dataObj.innerSection.on('click', openMenu);
        dataObj.innerSection.on('mouseenter', onMouseEnter);
        dataObj.innerSection.on('mouseleave', onMouseLeave);

        return dataObj.id;
    }

    // Function for level border arc
    function createLevelBorderArc(id, innerRadius, outerRadius, padAngle, rgba, data) {
        const classes = "border";
        const dataObj = createArc(id, innerRadius, outerRadius, padAngle, rgba, data, classes);

        dataObj.innerSection.on('click', openMenu);
        dataObj.innerSection.on('mouseenter', onMouseEnter);
        dataObj.innerSection.on('mouseleave', onMouseLeave);

        return dataObj.id;
    }

    // Function form side arc
    function createSideArc(id, innerRadius, outerRadius, padAngle, rgba, data) {
        const dataObj = createArc(id, innerRadius, outerRadius, padAngle, rgba, data);

        dataObj.innerSection.on('click', openMenu);
        dataObj.innerSection.on('mouseenter', onMouseEnter);
        dataObj.innerSection.on('mouseleave', onMouseLeave);

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
            .attr("class", function(d) { return `level-${d.data.level}-index-${d.data.index}${classes}` })
            .attr("data-data", function(d) { return d.data.data });

        return { id, pie, rotate, arc, innerSection };
    }


    function openMenu(event) {
        menuEnter(event.data.data);
    }

    function closeMenu() {
        menuLeave();
    }

    function onMouseEnter() {
        // Apply styles for the class
        const classes = $(this).find('path').attr('class').split(/\s+/);
        const groupList = getGroupList(classes);
        if(!groupList) return;

        groupList.filter('.level').removeClass('idle');
        groupList.filter('.border').removeClass('idle');
        groupList.filter('.level').addClass('active');
        groupList.filter('.border').addClass('active');
    }

    function onMouseLeave() {
        // Apply styles for the class
        const classes = $(this).find('path').attr('class').split(/\s+/);
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





    class MenuGUI {
        constructor() {
            this.level = 0;
            this.levelStack = [];
            this.initLevelRadius();
            this.initMainArc();
            this.createLevel(data);
        }

        initLevelRadius() {
            this.radius = {
                1: {
                    level: {
                        innerRadius: 100,
                        outerRadius: 170
                    },
                    border: {
                        innerRadius: 170,
                        outerRadius: 175
                    }
                },
                2: {
                    level: {
                        innerRadius: 185,
                        outerRadius: 255
                    },
                    border: {
                        innerRadius: 255,
                        outerRadius: 260
                    }
                }
            }
        }

        initMainArc() {
            createMainArc("main", 0, 90, "rgba(0, 0, 0, 0.7)", [1]);
        }

        createLevel(data) {
            this.level++;
            const lvlId = "level" + ("0" + this.level).slice(-2);
            const levelRadius = this.radius[this.level].level, borderRadius =  this.radius[this.level].border;
            const levelId = createLevelArc(lvlId, levelRadius.innerRadius, levelRadius.outerRadius, 0.05, "rgba(0, 0, 0, 0.5)", data);
            const borderId = createLevelBorderArc(lvlId + "Border", borderRadius.innerRadius, borderRadius.outerRadius, 0.05,  "rgba(0, 0, 0, 0.8)", data);
            this.levelStack.push([levelId, borderId]);

            if(this.border) this.removeElementById(this.border);
            this.createBorder(borderRadius.outerRadius, data);
        }

        createBorder(innerRadius, data) {
            this.border = createSideArc("side", innerRadius, translateWidth, 0.05,  "rgba(0, 0, 0, 0.0)", data);
        }

        removeElementById(elementId) {
            const element = document.getElementById(elementId);
            element.parentNode.removeChild(element);
        }

        removeLevel() {
            if (this.level <= 1) return;
            this.level--;

            this.levelStack.pop().forEach(x => this.removeElementById(x));

            if(this.border) this.removeElementById(this.border);
            this.createBorder(this.radius[this.level].outerRadius, data);
        }
    }

    const menu = new MenuGUI();

    function menuEnter(dataName) {
        menu.createLevel(getDataByVariable(dataName));
    }

    function menuLeave() {
        menu.removeLevel();
    }

    function getDataByVariable(data) {
        switch (data) {
            case "refuel": return refuelData;
            case "speedometer": return speedometerData;
        }
    }
};