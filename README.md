
# Clean Architecture For NodeJS Modules

This is a boilerplate to build nodejs modules based on **Clean Architecture** pattern.

  There are a number of different application architectures that are all simlar
variations on the same theme which is to have clean separation of concerns and
dependencies that follow the best practices of "the dependency invesion principle":

  **A.** High-level modules should not depend on low-level modules. Both should depend on abstractions.

**B.** Abstractions should not depend on details. Details should depend on abstractions.

Variations of the approach include:

*  [The Clean Architecture](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html) advocated by Robert Martin ('Uncle Bob')

* Ports & Adapters or [Hexagonal Architecture](http://alistair.cockburn.us/Hexagonal+architecture) by Alistair Cockburn

*  [Onion Architecture](http://jeffreypalermo.com/blog/the-onion-architecture-part-1/) by Jeffrey Palermo

  

## Clean Architecture Diagram

![Clean Architecture diagram](https://8thlight.com/blog/assets/posts/2012-08-13-the-clean-architecture/CleanArchitecture-8d1fe066e8f7fa9c7d8e84c1a6b0e2b74b2c670ff8052828f4a7e73fcbbc698c.jpg)

  

## The Dependency Rule

The concentric circles represent different areas of software. In general, the further in you go, the higher level the software becomes. The outer circles are mechanisms. The inner circles are policies.

The overriding rule that makes this architecture work is The Dependency Rule. This rule says that source code dependencies can only point inwards. Nothing in an inner circle can know anything at all about something in an outer circle. In particular, the name of something declared in an outer circle must not be mentioned by the code in an inner circle. That includes, functions, classes. variables, or any other named software entity.

By the same token, data formats used in an outer circle should not be used by an inner circle, especially if those formats are generate by a framework in an outer circle. We don’t want anything in an outer circle to impact the inner circles.

  

## Entities

Entities encapsulate Enterprise wide business rules. An entity can be an object with methods, or it can be a set of data structures and functions. It doesn’t matter so long as the entities could be used by many different applications in the enterprise.

If you don’t have an enterprise, and are just writing a single application, then these entities are the business objects of the application. They encapsulate the most general and high-level rules. They are the least likely to change when something external changes. For example, you would not expect these objects to be affected by a change to page navigation, or security. No operational change to any particular application should affect the entity layer.

## Use Cases

The software in this layer contains application specific business rules. It encapsulates and implements all of the use cases of the system. These use cases orchestrate the flow of data to and from the entities, and direct those entities to use their enterprise wide business rules to achieve the goals of the use case.

We do not expect changes in this layer to affect the entities. We also do not expect this layer to be affected by changes to externalities such as the database, the UI, or any of the common frameworks. This layer is isolated from such concerns.

We do, however, expect that changes to the operation of the application will affect the use-cases and therefore the software in this layer. If the details of a use-case change, then some code in this layer will certainly be affected.

## Interface Adapters

The software in this layer is a set of adapters that convert data from the format most convenient for the use cases and entities, to the format most convenient for some external agency such as the Database or the Web. It is this layer, for example, that will wholly contain the MVC architecture of a GUI. The Presenters, Views, and Controllers all belong in here. The models are likely just data structures that are passed from the controllers to the use cases, and then back from the use cases to the presenters and views.

Similarly, data is converted, in this layer, from the form most convenient for entities and use cases, into the form most convenient for whatever persistence framework is being used. i.e. The Database. No code inward of this circle should know anything at all about the database. If the database is a SQL database, then all the SQL should be restricted to this layer, and in particular to the parts of this layer that have to do with the database.

Also in this layer is any other adapter necessary to convert data from some external form, such as an external service, to the internal form used by the use cases and entities.

## Frameworks and Drivers.

The outermost layer is generally composed of frameworks and tools such as the Database, the Web Framework, etc. Generally you don’t write much code in this layer other than glue code that communicates to the next circle inwards.

This layer is where all the details go. The Web is a detail. The database is a detail. We keep these things on the outside where they can do little harm.

## Only Four Circles?

No, the circles are schematic. You may find that you need more than just these four. There’s no rule that says you must always have just these four. However, The Dependency Rule always applies. Source code dependencies always point inwards. As you move inwards the level of abstraction increases. The outermost circle is low level concrete detail. As you move inwards the software grows more abstract, and encapsulates higher level policies. The inner most circle is the most general.

# Ok, too much theory, how you can use it?

>  **Note:** The first that you need to know is if you need to configurate environment variables you need to modify the **config** folder with the variables that you want to use.

**1.** The **drivers** folder is created to create all external connections like connections to the databases, frameworks implementations. The main idea is create files based on the driver that you need to use. For example
If you need to create a connection with the mongodb database, the first that i need to do is to create a file inside the drivers folder called mongodbConnection.js.

```js
// Libraries
const  mongoose = require('mongoose');
const  Promise = require('bluebird');
// Environemnt variables
const  config = require('./config/database');

// Define system log
const  logger = require('../logger')

// Set up the mongoose promise with bluebird for performance
mongoose.Promise = Promise;

const  db = mongoose.createConnection(config.mongodb.uri, {
	auth: {
		user: config.mongodb.user,
		password: config.mongodb.pass,
	},
	poolSize: 10,
});

// Add event listeners for mongo connection
db.on('error', err => logger.error('connection error: ', err));
db.once('open', () => logger.info('connection opened with DB'));
db.on('connected', () => {
	logger.info("Mongoose connection is open to ", config.mongodb.uri);
});
db.on('disconnected', () => {
	logger.info("Mongoose connection is disconnected");
});

process.on('SIGINT', () => {
	db.close(() => {
		logger.info("Mongoose connection is disconnected due to application termination");
		process.exit(0);
	});
});

// Export db connection
module.exports = db;
```
so, this file returns a mongoDB connection from the pool and this connection should be exported in the index.js file.

**2.**.  The **entities** folder is created to store all entities of the module, for this example we will to create an entity called test. So the first that we need to do is is create the file with the name of the entity in this example we will to use test.js inside the entities folder.
```js
// Libraries
const { Schema } = require('mongoose');
// MongodbConnection
const { mongodbConnection} = require('../drivers');

// test schema definition
const  TestSchema = new  Schema({
	prop1: { type: String, required: true, unique: true },
	prop2: { type: String },
}, {
	timestamps: true,
	toObject: {
		virtuals: true,
	},
});

// Add 'id' field to virtuals
TestSchema.virtual('id').get(function() {
	return  this._id.toString();
});

// Add plugins
TestSchema.plugin(mongooseLeanVirtuals);

// Add indexex
TestSchema.index({ prop1: 1 });

module.exports = connection.model('test', TestSchema);
```
**3.** The **useCases** folder is created to export the methods with the business rules or our implementations, in this example we will to create a use cases called mathCalculator.js and we will to create a method called sum that receives an object with two values **a** and **b** like this:
```js
const sum = ({a, b}) => a + b;

module.exports = { sum };
```
so in the index.js file we will export our use case like this:
```js
const mathOperations = require('./mathCalculator');

module.exports = { mathOperations };
```

**4.** The **interfaces** folder is created to export the methods that we be used of our module  by other users or modules. The idea of the interfaces is to adapt o make the first data manipulation that will be send to our use cases.
For this example we will to create an interface called math.js, this interface will export a function that receives a string with 2 numbers and this numbers will be send to our use cases and return the result of the sum.
>**Note:** The interface methods are the only methods with public access of our module, so our interfaces are the only methods that we export in our main file.
>**"The interfaces they are going to encapsulate our use cases."**
```js
// Use cases
const { mathOperations } = require('../useCases');

// We supose that the user sends a string like this:
// "{ a: 1, b: 2 }"
const sum = (stringNumbers) => {
	const {a, b} = JSON.parse(stringNumbers);
	const result = mathOperations.sum({ a, b });

	return result;
}

module.exports = { sum };
```

**5.** The file called **BusinessError.js** is a extends of the class Error, the idea is to allow the error to store additional information that help us to debug the errors.
In this case BusinessError receive a moduleName and an error and we can use it like this:
```js
const BusinessError = require('../BusinessError');

const test = (a, b) => {
	if(a > b) {
		throw new BusinessError('a must be grather than b', 'testModule')
	}
}
```
**6.** The file called **logger.js** is a logger created with the library winston that is async logger, you can use the logger that do you like.

# References
*  [The Clean Architecture](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html) advocated by Robert Martin ('Uncle Bob')
