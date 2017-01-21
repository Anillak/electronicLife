function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.plus = function (other) {
    return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.minus = function (other) {
    return new Vector(this.x - other.x, this.y - other.y);
};

Object.defineProperty(Vector.prototype, "length", {
    get: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
});

function Grid(width, height) {
    this.space = new Array(width * height);
    this.width = width;
    this.height = height;
}

Grid.prototype.isInside = function (vector) {
    return vector.x >= 0 && vector.x < this.width && vector.y >= 0 && vector.y < this.height;
};

Grid.prototype.get = function (vector) {
    return this.space[vector.x + vector.y * this.width];
};

Grid.prototype.set = function (vector, value) {
    this.space[vector.x + vector.y * this.width] = value;
};

Grid.prototype.forEach = function (f, context) {
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            var value = this.space[x + y * this.width];
            if (value != null) {
                f.call(context, value, new Vector(x, y));
            }
        }
    }
};

var directions = {
    "n": new Vector(0, -1),
    "ne": new Vector(1, -1),
    "e": new Vector(1, 0),
    "se": new Vector(1, 1),
    "s": new Vector(0, 1),
    "sw": new Vector(-1, 1),
    "w": new Vector(-1, 0),
    "nw": new Vector(-1, -1)
};

var directionNames = "n ne e se s sw w nw".split(" ");

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function elementFromChar(legend, ch) {
    if (ch == " ") {
        return null;
    }
    if (legend[ch] == null)
    {
        throw new Error("Legend doesn't contain the character " + ch);
    }
    var element = new legend[ch]();
    element.originChar = ch;
    return element;
}

function charFromElement(element) {
    if (element == null) {
        return " ";
    }
    else {
        return element.originChar;
    }
}

function World(map, legend) {
    var grid = new Grid(map[0].length, map.length);
    this.grid = grid;
    this.legend = legend;

    map.forEach(function(line, y) {
        for (var x = 0; x < line.length; x++)
        {
            grid.set(new Vector(x, y), elementFromChar(legend, line[x]));
        }
    });
}

World.prototype.toString = function() {
    var output = "\n";
    for (var y = 0; y < this.grid.height; y++) {
        for (var x = 0; x < this.grid.width; x++) {
            var element = this.grid.get(new Vector(x, y));
            output += charFromElement(element);
        }
        output += "\n";
    }
    return output;
};

World.prototype.checkDestination = function (action, vector) {
    if (directions.hasOwnProperty(action.direction)) {
        var dest = vector.plus(directions[action.direction]);
        if (this.grid.isInside(dest))
        {
            return dest;
        }
    }
};

World.prototype.letAct = function(critter, vector) {
    var action  = critter.act(new View(this, vector));
    if (action && action.type == "move") {
        var dest = this.checkDestination(action, vector);
        if (dest && this.grid.get(dest) == null) {
            this.grid.set(vector, null);
            this.grid.set(dest, critter);
        }
    }
};

World.prototype.turn = function() {
    var acted = [];
    this.grid.forEach(function(critter, vector) {
        if (critter.act && acted.indexOf(critter) == -1) {
            acted.push(critter);
            this.letAct(critter, vector);
        }
    }, this);
};

function Wall() {}

function View(world, vector) {
    this.world = world;
    this.vector = vector;
}

View.prototype.look = function(dir) {
    var target = this.vector.plus(directions[dir]);
    if (this.world.grid.isInside(target)) {
        return charFromElement(this.world.grid.get(target));
    }
    else {
        return "#";
    }
};

View.prototype.findAll = function(char) {
    var found = [];
    for (var dir in directions) {
        if (this.look(dir) == char) {
            found.push(dir);
        }
    }
    return found;
};

View.prototype.find = function(char) {
    var found = this.findAll(char);
    if (found.length == 0) return null;
    return randomElement(found);
};

function BouncingCritter() {
    this.direction = randomElement(directionNames);
}

BouncingCritter.prototype.act = function (view) {
    if (view.look(this.direction) != " ") {
        this.direction = view.find(" ") || "s";
    }
    return {type: "move", direction: this.direction};
};

function directionPlus(direction, n) {
    var index = directionNames.indexOf(direction);
    return directionNames[(index + n + 8) % 8];
}

function WallFlower() {
    this.direction = "s";
}

WallFlower.prototype.act = function (view) {
    var start = this.direction;
    if (view.look(directionPlus(this.direction, -3)) != " ") {
        start = this.direction = directionPlus(this.direction, -2);
    }
    while (view.look(this.direction) != " ") {
        this.direction = directionPlus(this.direction, 1);
        if (this.direction == start) break;
    }
    return {type: "move", direction: this.direction};
};

function LifelikeWorld(map, legend) {
    World.call(this, map, legend);
}

LifelikeWorld.prototype = Object.create(World.prototype);

var actionTypes = Object.create(null);
actionTypes.grow = function(critter) {
    critter.energy += 0.5;
    return true;
};
actionTypes.move = function(critter, vector, action) {
    var dest = this.checkDestination(action, vector);
    if (dest == null || critter.energy <= 1 || this.grid.get(dest) != null) {
        return false;
    }
    critter.energy -= 1;
    this.grid.set(vector, null);
    this.grid.set(dest, critter);
    return true;
};
actionTypes.eat = function (critter, vector, action) {
    var dest = this.checkDestination(action, vector);
    var atDest = dest != null && this.grid.get(dest);
    if (!atDest || atDest.energy == null)
        return false;
    critter.energy += atDest.energy;
    this.grid.set(dest, null);
    return true;
};

actionTypes.reproduce = function (critter, vector, action) {
    var baby = elementFromChar(this.legend, critter.originChar);
    var dest = this.checkDestination(action, vector);
    if (dest == null || critter.energy <= 2*baby.energy || this.grid.get(dest) != null) {
        return false;
    }
    critter.energy -= baby.energy;
    this.grid.set(dest, baby);
    return true;
};

LifelikeWorld.prototype.letAct = function (critter, vector) {
    var action = critter.act(new View(this, vector));
    var handled = action && action.type in actionTypes && actionTypes[action.type].call(this, critter, vector, action);
    if (!handled) {
        critter.energy -= 0.2;
        if (critter.energy <= 0) {
            this.grid.set(vector, null);
        }
    }
};

function Plant() {
    this.energy = 3 + Math.random() * 4;
}
Plant.prototype.act = function(view) {
    if (this.energy > 15) {
        var space = view.find(" ");
        if (space)
            return {type: "reproduce", direction: space};
    }
    if (this.energy < 20)
        return {type: "grow"};
};

function PlantEater() {
    this.energy = 20;
}
PlantEater.prototype.act = function(view) {
    var space = view.find(" ");
    if (this.energy > 60 && space)
        return {type: "reproduce", direction: space};
    var plant = view.find("*");
    if (plant)
        return {type: "eat", direction: plant};
    if (space)
        return {type: "move", direction: space};
};

function Zebra() {
    this.energy = 30;
    this.migration = "e";
}

Zebra.prototype.act = function (view) {
    var space = view.find(" ");
    if (space && this.energy > 90) {
        return {type: "reproduce", direction: space};
    }
    var plants = view.findAll("*");
    if (plants.length > 1)
        return {type: "eat", direction: randomElement(plants)};
    if (view.look(this.migration) != " " && space)
        this.migration = space;
    return {type: "move", direction: this.migration};
};

function Tiger() {
    this.energy = 100;
    this.direction = "w";
    this.preySeen = [];
}

Tiger.prototype.act = function(view) {
    var seenPerTurn = this.preySeen.reduce(function(a, b) {
            return a + b;
        }, 0) / this.preySeen.length;
    var prey = view.findAll("O");
    this.preySeen.push(prey.length);
    if (this.preySeen.length > 6) {
        this.preySeen.shift();
    }
    if (prey.length && seenPerTurn > 0.25) {
        return {type: "eat", direction: randomElement(prey)};
    }

    var space = view.find(" ");
    if (this.energy > 400 && space)
        return {type: "reproduce", direction: space};
    if (view.look(this.direction) != " " && space)
        this.direction = space;
    return {type: "move", direction: this.direction};
};