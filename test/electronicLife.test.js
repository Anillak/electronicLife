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

describe("the wall flower class", function () {

});