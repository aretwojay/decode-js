function Person(name, age) {
  let state = Person.STATES.DEFAULT;

  this.getName = function () {
    return name;
  };
  this.getAge = function () {
    return age;
  };

  this.getState = function () {
    return state;
  };

  this.handUp = function () {
    state = Person.STATES.HAND_UP;
  };
  this.handDown = function () {
    state = Person.STATES.DEFAULT;
  };
}

Person.STATES = {
  DEFAULT: "_()_",
  RIGHT_HAND: "_()/",
  HAND_UP: "\\()/",
  LEFT_HAND: "\\()_",
};

function Hola(maxPerson = 20) {
  const persons = [];
  let currentIndex = 0;
  this.addPerson = function (person) {
    if (person instanceof Person) {
      if (persons.length < maxPerson) {
        persons.push(person);
      } else {
        console.error("Max person reached");
      }
    } else {
      console.error("Must be a Person object", person);
    }
  };

  this.loop = function () {
    setInterval(function () {
      update();
      display();
    }, 500);
  };

  function update() {
    currentIndex++;
    persons[(currentIndex - 1) % persons.length]?.handDown();
    persons[currentIndex % persons.length]?.handUp();
  }
  function display() {
    console.log(
      persons
        .map(function (person) {
          return person.getState();
        })
        .join(""),
    );
  }
}

const hola = new Hola();
hola.addPerson(new Person("Alice", 30));
hola.addPerson(new Person("Bob", 25));
hola.addPerson(new Person("Charlie", 35));
hola.addPerson(new Person("David", 28));
hola.addPerson(new Person("Eve", 22));
hola.addPerson(new Person("Alice", 30));
hola.addPerson(new Person("Bob", 25));
hola.addPerson(new Person("Charlie", 35));
hola.addPerson(new Person("David", 28));
hola.addPerson(new Person("Eve", 22));
hola.addPerson({
  name: "Fake Person",
  age: 100,
});
hola.addPerson(new Person("Alice", 30));
hola.addPerson(new Person("Bob", 25));
hola.addPerson(new Person("Charlie", 35));
hola.addPerson(new Person("David", 28));
hola.addPerson(new Person("Eve", 22));
hola.addPerson(new Person("Alice", 30));
hola.addPerson(new Person("Bob", 25));
hola.addPerson(new Person("Charlie", 35));
hola.addPerson(new Person("David", 28));
hola.addPerson(new Person("Eve", 22));
hola.addPerson(new Person("Alice", 30));
hola.addPerson(new Person("Bob", 25));
hola.addPerson(new Person("Charlie", 35));
hola.addPerson(new Person("David", 28));
hola.addPerson(new Person("Eve", 22));

Hola.prototype.start = function () {
  this.loop();
};
hola.getPersons();
hola.start();
