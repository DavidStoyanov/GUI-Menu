//https://bl.ocks.org/mbostock/4341417 // For transitions
window.onload = (event) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const translateWidth = Math.ceil(width / 2);
    const translateHeight = Math.ceil((height / 2) - 50);

    class MenuGUI {
        constructor() {
            this.level = 0;
            this.levelStack = [];
            this.selectedStack = [];

            this.mainRadius = 90;
            this.levelPad = 10;
            this.levelRadius = 70;
            this.borderRadius = 5;

            this.initMainArc();
            this.createLevel(data);
        }

        getLevelRadius(level) {
            const innerRadiusLevel = this.mainRadius
                + (this.levelPad * level)
                + (this.levelRadius * (level - 1))
                + (this.borderRadius * (level - 1));

            const outerRadiusLevel = innerRadiusLevel + this.levelRadius;
            const outerRadiusBorder = outerRadiusLevel + this.borderRadius;

            return  {
                level: {
                    innerRadius: innerRadiusLevel,
                    outerRadius: outerRadiusLevel
                },
                border: {
                    innerRadius: outerRadiusLevel,
                    outerRadius: outerRadiusBorder
                }
            }
        }

        initMainArc() {
            createMainArc("main", 0, this.mainRadius, "rgba(0, 0, 0, 0.7)", [1]);
        }

        createLevel(data, element) {
            while (this.level !== 0 && this.level >= data[0].level) {
                this.removeLevel();
            }

            this.level++;

            const levelRadius = this.getLevelRadius(this.level).level;
            const borderRadius =  this.getLevelRadius(this.level).border;

            const lvlId = "level" + ("0" + this.level).slice(-2);
            const levelId = createLevelArc(lvlId, levelRadius.innerRadius, levelRadius.outerRadius, 0.05, "rgba(0, 0, 0, 0.5)", data);
            const borderId = createLevelBorderArc(lvlId + "Border", borderRadius.innerRadius, borderRadius.outerRadius, 0.05,  "rgba(0, 0, 0, 0.8)", data);

            this.levelStack.push([levelId, borderId]);

            if(element) {
                const selected = element.getElementsByTagName("path")[0];
                selected.classList.add("selected");
                this.selectedStack.push(selected);
            }

            if(this.border) this.removeElementById(this.border);
            this.createSide(borderRadius.outerRadius, data);
        }

        createSide(innerRadius, data) {
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
            this.selectedStack.pop().classList.remove("selected");

            if(this.border) this.removeElementById(this.border);
            this.createSide(this.getLevelRadius(this.level).border.outerRadius, data);
        }
    }

    const svg = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Function for main arc
    function createMainArc(id, innerRadius, outerRadius, rgba, data) {
        const padAngle = 0.00;
        const dataObj = createArc(id, innerRadius, outerRadius, padAngle, rgba, data);
        dataObj.innerSection.on('click', menuBack);

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
            .attr("data-data", function(d) { return d.data.data });

        addEvents(dataObj);

        return dataObj.id;
    }

    // Function for level border arc
    function createLevelBorderArc(id, innerRadius, outerRadius, padAngle, rgba, data) {
        const classes = "border";
        const dataObj = createArc(id, innerRadius, outerRadius, padAngle, rgba, data, classes);
        addEvents(dataObj);

        return dataObj.id;
    }

    // Function form side arc
    function createSideArc(id, innerRadius, outerRadius, padAngle, rgba, data) {
        const dataObj = createArc(id, innerRadius, outerRadius, padAngle, rgba, data);
        addEvents(dataObj);

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

    // #Helper function
    // ######################################
    function getDataByVariable(data) {
        switch (data) {
            case "refuel": return refuelData;
            case "speedometer": return speedometerData;
            case "dance": return danceData;
        }
    }

    function getGroupList(element) {
        const classes = $(element).find('path').attr('class').split(/\s+/);

        for (const x of classes) {
            if(x.startsWith('level') && x.includes('index')) {
                return $('.'.concat(x));
            }
        }

        return null;
    }

    // #Events
    // ######################################

    function addEvents(dataObj) {
        dataObj.innerSection.on('click', menuNext);
        dataObj.innerSection.on('mouseenter', onMouseEnter);
        dataObj.innerSection.on('mouseleave', onMouseLeave);
    }

    function onMouseEnter() {
        // Apply styles for the class
        const groupList = getGroupList(this);
        if(!groupList) return;

        groupList.filter('.level').removeClass('idle');
        groupList.filter('.border').removeClass('idle');

        groupList.filter('.level').addClass('active');
        groupList.filter('.border').addClass('active');
    }

    function onMouseLeave() {
        // Apply styles for the class
        const groupList = getGroupList(this);
        if(!groupList) return;

        groupList.filter('.level').removeClass('active');
        groupList.filter('.border').removeClass('active');

        groupList.filter('.level').addClass('idle');
        groupList.filter('.border').addClass('idle');
    }

    // #Menu
    // ######################################

    const menu = new MenuGUI();

    function menuNext(event) {
        const aData = getDataByVariable(event.data.data);
        menu.createLevel(aData, this);
    }

    function menuBack() {
        menu.removeLevel();
    }
};