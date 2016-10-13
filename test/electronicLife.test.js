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

    it("can set 'x' to a space and then get it", function() {
        grid.set(new Vector(1, 1), "x");
        expect(grid.get(new Vector(1, 1))).toBe("x");
    });

    it("can check if a vector is located inside of it", function () {
        expect(grid.isInside(new Vector(1, 2))).toBe(true);
        expect(grid.isInside(new Vector(0, 0))).toBe(true);
        expect(grid.isInside(new Vector(6, 8))).toBe(false);
        expect(grid.isInside(new Vector(5, 6))).toBe(false);
    });
});

describe("the random element function", function () {
    var array = "n ne e se s sw w nw".split(" ");

    it("gets a random element from an array ", function () {
        var element = randomElement(array);
        expect(array).toContain(element);
    });

    it("doesn't get an element that is not in the array ", function () {
        var element = 'aw';
        expect(array).not.toContain(element);
    });

});

describe("the bouncing critter class", function () {
    
});

describe("the World class", function () {

});