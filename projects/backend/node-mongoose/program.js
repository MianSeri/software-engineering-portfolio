const connect = require("./db");


const runDatabaseQueries = async () => {
  
  const db = await connect();

  const movies = db.collection('movies');
  const users = db.collection('users');
  const comments = db.collection('comments');
  const { ObjectId } = require("mongodb");



  // Run this query, should get top 5 best rated movies on IMDB
  const topMovies = await movies.find({ "imdb.rating": { $gt: 8.0 } })
    .project({ title: 1, year: 1, "imdb.rating": 1 })
    .sort({ "imdb.rating": -1 })
    .limit(5)
    .toArray();

  console.log('Top Rated Movies:', topMovies);

  // CREATE: Insert a new user
  const newUser = {name: "Rosey", email: `rosey${Date.now()}@example.com`}; //faced an error here because email ran everytime it ran the code 
  // with `rosey${Date.now()}@example.com` every run will insert a new user or I can just comment out this section
  const inserted = await users.insertOne(newUser);
  console.log("Inserted new user:", inserted.insertedId);

  // Read #1: Movies directed by Christopher Nolan
  const nolan = await movies
    .find({ directors: "Christopher Nolan" })
    .project({ title: 1, year: 1, directors: 1 })
    .limit(10)
    .toArray();

  console.log("Nolan movies (first 10):", nolan);

  // Read #2: Action movies sorted by year (desc)
  const actionMovies = await movies
    .find({ genres: "Action" })
    .project({ title: 1, year: 1, genres: 1 })
    .sort({ year: -1 })
    .limit(10)
    .toArray();

  console.log("Action movies (newest first):", actionMovies);

  // Read #3: IMDb rating > 8, (with only title + imdb)
  const imdbAbove8 = await movies
    .find({"imdb.rating": { $gt:8 } })
    .project({ _id: 0, title: 1, imdb: 1 })
    .limit(10)
    .toArray();
    
  console.log("IMDb > 8:", imdbAbove8);

  // Read #4: Movies with Tom Hanks AND Tim Allen
  const hanksAllen = await movies
    .find({ cast: { $all: ["Tom Hanks", "Tim Allen"] } })
    .project({ title: 1, year: 1, cast: 1 })
    .limit(10)
    .toArray();

  console.log("Tom Hanks + Tim Allen:", hanksAllen);

  // Read #5: Movies with ONLY Tom Hanks and Tim Allen
  const onlyHanksAllen = await movies
    .find({
      cast: { $all: ["Tom Hanks", "Tim Allen"] },
      $expr: { $eq: [{ $size: "$cast" }, 2] },
    })
    .project({ title: 1, year: 1, cast: 1 })
    .limit(10)
    .toArray();

  console.log("ONLY Tom Hanks + Tim Allen:", onlyHanksAllen);

  // Read #6: Spielberg comedies
  const spielbergComedy = await movies
    .find({ directors: "Steven Spielberg", genres: "Comedy" })
    .project({ title: 1, year: 1, directors: 1, genres: 1 })
    .limit(10)
    .toArray();

  console.log("Spielberg comedies:", spielbergComedy);


  // Update #1: Add available_on: "Sflix" to “The Matrix”
  const u1 = await movies.updateOne(
    { title: "The Matrix" },
    { $set: { available_on: "Sflix" } }
  );
  console.log("Update #1 modified:", u1.modifiedCount);
  
  // Update #2: Increment metacritic of “The Matrix” by 1
  const u2 = await movies.updateOne(
    { title: "The Matrix" },
    { $inc: { metacritic: 1 } }
  );
  console.log("Update #2 modified:", u2.modifiedCount);

  // Update #3: Add genre “Gen Z” to all movies released in 1997
  const u3 = await movies.updateMany (
    { year: 1997 },
    { $addToSet: { genres: "Gen Z" } }
  );
  console.log("Update #3 modified:", u3.modifiedCount);

  // Update #4: Increase IMDb rating by 1 for all movies with rating < 5
const u4 = await movies.updateMany(
  { "imdb.rating": { $lt: 5 } },
  { $inc: { "imdb.rating": 1 } }
);
console.log("Update #4 modified:", u4.modifiedCount);


  // Delete #1: Delete a comment with a specific ID
  const oneComment = await comments.findOne({}, { projection: { _id: 1, name: 1 } });
  console.log("Sample comment to delete:", oneComment);

  const d1 = await comments.deleteOne({ _id: new ObjectId("573a1390f29313caabcd446f") });
  console.log("Delete #1 deleted:", d1.deletedCount);

  //Delete #2: Delete all comments made for “The Matrix”
  const matrix = await movies.findOne({ title: "The Matrix" }, { projection: { _id: 1 } });

  if (matrix) {
    const d2 = await comments.deleteMany({ movie_id: matrix._id });
    console.log("Delete #2 deleted:", d2.deletedCount);
  } else {
    console.log("The Matrix not found for Delete #2");
  }

  // Delete #3: Delete all movies that do not have any genres
  const d3 = await movies.deleteMany({
    $or: [{ genres: { $exists: false } }, { genres: { $size: 0 } }],
  });
  console.log("Delete #3 deleted:", d3.deletedCount);

  //Aggregate #1: Count movies released per year (earliest → latest)
  const a1 = await movies
  .aggregate([
    { $match: { year: { $type: "int" } } },
    { $group: { _id: "$year", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])
  .toArray();

  console.log("Aggregate #1 (first 15 years):", a1.slice(0, 15));

  //Aggregate #2: Average IMDb rating grouped by director (highest → lowest)
  const a2 = await movies
  .aggregate([
    { $match: { "imdb.rating": { $type: "double" } } },
    { $unwind: "$directors" }, //Directors is an array, so we “unpack” it with $unwind.
    { $group: { _id: "$directors", avgRating: { $avg: "$imdb.rating" }, movieCount: { $sum: 1 } } },
    { $sort: { avgRating: -1 } },
  ])
  .toArray();

  console.log("Aggregate #2 (top 10 directors):", a2.slice(0, 10));


  process.exit(0);
};

  
runDatabaseQueries();