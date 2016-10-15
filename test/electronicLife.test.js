describe("the vector class", function() {
    var first = new Vector(5,5);
    var second = new Vector(2,3);

    it("can add two vectors", function() {
        var result = first.plus(second);
        expect(result).toEqual(new Vector(7, 8));
    });

    it("can subtract two vectors", function() {
        var result = first.minus(second);
        expect(result).toEqual(new Vector(3, 2));
    });

    it("doesn't change on adding or subtracting", function() {
        first.plus(second);
        expect(first).toEqual(new Vector(5, 5));
        second.minus(first);
        expect(second).toEqual(new Vector(2, 3));
    });

    it("has length", function () {
        expect(first.length()).toBeCloseTo(7, 0);
        expect(second.length()).toBeCloseTo(3.6, 1);
    });
});

describe("the grid class", function() {
    var grid = new Grid(5,5);

    it("gets an undefined grid space right after initialization", function() {
        expect(grid.get(new Vector(1, 1))).toBe(undefined);
    });

    it("can set and object to a space and then get it", function() {
        grid.set(new Vector(1, 1), "x");
        expect(grid.get(new Vector(1, 1))).toBe("x");
    });

    it("can check if a vector is located inside of it", function () {
        expect(grid.isInside(new Vector(1, 2))).toBe(true);
        expect(grid.isInside(new Vector(0, 0))).toBe(true);
        expect(grid.isInside(new Vector(6, 8))).toBe(false);
        expect(grid.isInside(new Vector(5, 6))).toBe(false);
    });

    it("has a forEach function invoking a given method with an argument and a position vector", function () {
        grid.set(new Vector(1, 1), new Vector(1, 1));
        grid.set(new Vector(2, 2), new Vector(2, 2));
        grid.set(new Vector(3, 3), new Vector(3, 3));
        var agent = {
            test: function (vector, position) {}
        };
        spyOn(agent, 'test');

        grid.forEach(agent.test, this);

        expect(agent.test).toHaveBeenCalled();
        expect(agent.test).toHaveBeenCalledTimes(3);
        expect(agent.test).toHaveBeenCalledWith(new Vector(1, 1), new Vector(1, 1));
        expect(agent.test).toHaveBeenCalledWith(new Vector(2, 2), new Vector(2, 2));
        expect(agent.test).toHaveBeenCalledWith(new Vector(3, 3), new Vector(3, 3));
        expect(agent.test).not.toHaveBeenCalledWith(new Vector(2, 1), new Vector(3, 1));
    });
});

describe("the random element function", function () {
    var array = "n ne e se s sw w nw".split(" ");

    it("gets a random element from an array", function () {
        var element = randomElement(array);
        expect(array).toContain(element);
    });
});

describe("the element functions", function () {
    var legend = {"v": Vector, "n": Number, "w": Wall};

    it("creates an object if the char is part of the legend", function () {
        var element = elementFromChar(legend, "w");
        expect(element).toBeDefined();
    });

    it("returns null if empty space", function () {
        var element = elementFromChar(legend, " ");
        expect(element).toBeNull();
    });

    it("creates an object using the constructor from the legend", function () {
        var element = elementFromChar(legend, "v");
        expect(element).toEqual(jasmine.any(Vector));
    });

    it("throws an error when the character is unknown to the legend", function () {
        expect(function(){elementFromChar(legend, "a")}).toThrowError("Legend doesn't contain the character a");
    });

    it("preserves the original character in the element", function () {
        var element = elementFromChar(legend, "n");
        var char = charFromElement(element);
        expect(char).toEqual("n");
    });

    it("returns empty space in the case of null", function () {
        var element = null;
        var char = charFromElement(element);
        expect(char).toEqual(" ");
    });
});

describe("the World class", function () {
    var room = new World(["####","#  #", "####"], {"#": Wall});

    it("has a grid and a legend", function () {
        expect(room.legend).toBeDefined();
        expect(room.grid).toBeDefined();
    });

    it("the grid elements are objects from the legend", function () {
        expect(room.grid.get(new Vector(0, 0))).toEqual(jasmine.any(Wall));
        expect(room.grid.get(new Vector(1, 1))).toBeNull();
    });

    it("prints out the map", function () {
        expect(room.toString()).toEqual("\n####\n#  #\n####\n");
    });

    it("can check if a destination is inside the map", function () {
        var movement = {
            direction: "e"
        };
        var dest = room.checkDestination(movement, new Vector(0,1));
        expect(dest).toEqual(new Vector(1, 1));
        var wrong = room.checkDestination(movement, new Vector(3,0));
        expect(wrong).toBeUndefined();
    });

    it("lets the heroes act", function () {
        var hero = {
            act: function () {}
        };
        spyOn(hero, "act");
        room.letAct(hero, new Vector(1,0));
        expect(hero.act).toHaveBeenCalled();
    });
});

describe("the view class", function () {
    var room = new World(["#####","#   #", "#####"], {"#": Wall});
    var view = new View(room, new Vector(2, 1));

    it("takes a world and a position in it", function () {
        expect(view).toBeDefined();
    });

    it("can look in a direction", function () {
        var iSee = view.look("e");
        expect(iSee).toEqual(" ");
        iSee = view.look("s");
        expect(iSee).toEqual("#");
    });

    it("can find where to go from the current position", function () {
        var iCanMoveTo = view.findAll(" ");
        expect(iCanMoveTo).toEqual(["e", "w"]);
        var iDesidedToMoveTo = view.find(" ");
        expect(iDesidedToMoveTo).toMatch(/e|w/);
    });
});

describe("the bouncing critter class", function () {
    var critter = new BouncingCritter();
    var room = new World(["####","#  #", "####"], {"#": Wall});

    it("gives information where will it move to", function () {
        var eyes = new View(room, new Vector(1, 1));
        var whatToDo = critter.act(eyes);
        expect(whatToDo).toEqual({type: "move", direction: "e"});
    });
});

describe("the action types", function () {
    var room;
    var plant;
    var plantEater;
    var plantPosition;
    var plantEaterPosition;

    beforeEach(function() {
        room = new World(["#####",
                          "#  *#",
                          "#  O#",
                          "#####"],
            {"#": Wall, "O": PlantEater, "*": Plant});
        plantPosition = new Vector(3, 1);
        plantEaterPosition = new Vector(3, 2);
        plant = room.grid.get(plantPosition);
        plantEater = room.grid.get(plantEaterPosition);
    });

    it("has several action types defined", function () {
        expect(actionTypes.grow).toEqual(jasmine.any(Function));
        expect(actionTypes.move).toEqual(jasmine.any(Function));
        expect(actionTypes.eat).toEqual(jasmine.any(Function));
        expect(actionTypes.reproduce).toEqual(jasmine.any(Function));
    });

    it("grow makes the critters get more energy", function () {
        var plantBornWithEnergy = plant.energy;
        var eaterBornWithEnergy = plantEater.energy;
        var action = {type: "grow", direction: 'e'};

        var result = actionTypes[action.type].call(room, plant, plantPosition, action);
        expect(result).toBe(true);
        expect(plant.energy).toBeGreaterThan(plantBornWithEnergy);

        result = actionTypes[action.type].call(room, plantEater, plantEaterPosition, action);
        expect(result).toBe(true);
        expect(plantEater.energy).toBeGreaterThan(eaterBornWithEnergy);
    });

    it("move allows the critters to move, they lose energy doing so", function () {
        var eaterBornWithEnergy = plantEater.energy;
        var action = {type: "move", direction: 'w'};
        var result = actionTypes[action.type].call(room, plantEater, plantEaterPosition, action);

        expect(result).toBe(true);
        expect(plantEater.energy).toBeLessThan(eaterBornWithEnergy);
        expect(room.toString()).toEqual("\n#####\n#  *#\n# O #\n#####\n")
    });

    it("doesn't allow critters to move at walls or when energy is under 1", function () {
        var action = {type: "move", direction: 's'};
        var result = actionTypes[action.type].call(room, plantEater, plantEaterPosition, action);

        expect(result).toBe(false);
        expect(room.toString()).toEqual("\n#####\n#  *#\n#  O#\n#####\n");

        plantEater.energy = 0.5;
        result = actionTypes[action.type].call(room, plantEater, plantEaterPosition, action);
        expect(result).toBe(false);
        expect(room.toString()).toEqual("\n#####\n#  *#\n#  O#\n#####\n");
    });

    it("critters can eat other creaters", function () {
        var plantBornWithEnergy = plant.energy;
        var eaterBornWithEnergy = plantEater.energy;
        var action = {type: "eat", direction: 'n'};
        var result = actionTypes[action.type].call(room, plantEater, plantEaterPosition, action);

        expect(result).toBe(true);
        expect(room.toString()).toEqual("\n#####\n#   #\n#  O#\n#####\n");
        expect(plantEater.energy).toEqual(eaterBornWithEnergy + plantBornWithEnergy);
    });

    it("eating should fail if is not pointed at an eatable critter", function () {
        var action = {type: "eat", direction: 'w'};
        var result = actionTypes[action.type].call(room, plantEater, plantEaterPosition, action);

        expect(result).toBe(false);
        expect(room.toString()).toEqual("\n#####\n#  *#\n#  O#\n#####\n");
    });

    it("critters can reproduce when having enough energy", function () {
        var neededEnergy = 16;
        plant.energy = neededEnergy;
        var action = {type: "reproduce", direction: 'w'};
        var result = actionTypes[action.type].call(room, plant, plantPosition, action);

        expect(result).toBe(true);
        expect(plant.energy).toBeLessThan(neededEnergy);
        expect(room.toString()).toEqual("\n#####\n# **#\n#  O#\n#####\n");

    });
});

describe("the plant class", function () {
    var plant;
    var plantPosition;
    var view;

    beforeEach(function() {
        var room = new World(["#####",
                "#  *#",
                "#   #",
                "#####"],
            {"#": Wall, "*": Plant});
        plantPosition = new Vector(3, 1);
        plant = room.grid.get(plantPosition);
        view = new View(room, plantPosition);
    });

    it("starts with energy", function () {
        expect(plant).toBeDefined();
        expect(plant.energy).toBeLessThanOrEqual(7);
        expect(plant.energy).toBeGreaterThanOrEqual(3);
    });

    it("will grow constantly until reaching energy 20", function () {
        var action = plant.act(view);
        expect(action).toEqual({type: "grow"});
        plant.energy = 20;
        action = plant.act(view);
        expect(action).not.toEqual({type: "grow"});
    });

    it("will reproduce if there is free space and energy", function () {
        plant.energy = 20;
        var action = plant.act(view);
        expect(action.type).toEqual("reproduce");
        expect(action.direction).toMatch(/w|s|sw/);
    });
});

describe("the plant eater class", function () {
    var view;
    var plantEater;
    var plantEaterPosition;

    beforeEach(function() {
        var room = new World(["#####",
                "#  *#",
                "#  O#",
                "#####"],
            {"#": Wall, "O": PlantEater, "*": Plant});
        plantEaterPosition = new Vector(3, 2);
        plantEater = room.grid.get(plantEaterPosition);
        view = new View(room, plantEaterPosition);
    });

    it("starts with energy", function () {
        expect(plantEater).toBeDefined();
        expect(plantEater.energy).toEqual(20);
    });

    it("will move or eat if its energy is less than 60", function () {
        var action = plantEater.act(view);
        expect(action.type).toMatch(/eat|move/);
        if (action.type === "eat") {
            expect(action.direction).toEqual("n");
        }
        else {
            expect(action.direction).toMatch(/w|nw/);
        }
        plantEater.energy = 61;
        action = plantEater.act(view);
        expect(action.type).not.toMatch(/eat|move/);
    });

    it("will reproduce if there is free space and energy", function () {
        plantEater.energy = 61;
        var action = plantEater.act(view);
        expect(action.type).toEqual("reproduce");
        expect(action.direction).toMatch(/w|nw/);
    });
});