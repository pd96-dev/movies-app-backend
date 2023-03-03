const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
// const movies = require("./movieList");
const app = express();
const PORT = process.env.PORT || 8000;
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.ELEPHANT_SQL_CONNECTION_STRING,
});
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("<h1>MOVIE APP</h1>");
});

app.get("/api/search/:keyword", (req, res) => {
  const keyword = req.params.keyword;

  pool
    .query(
      "SELECT * FROM movies WHERE lower(title) LIKE lower('%' || $1 || '%') OR lower(genre) LIKE lower('%' || $1 || '%');",
      [keyword]
    )
    .then((data) => {
      //   console.log(data);
      if (data.rowCount === 0) {
        res.status(404).json({ message: "movies not found" });
      }
      res.json(data.rows);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

app.get("/api/movies", (req, res) => {
  pool
    .query("SELECT * FROM movies;")
    .then((data) => {
      console.log(data);
      res.json(data.rows);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

app.get("/api/movies/:id", (req, res) => {
  const id = req.params.id;
  pool
    .query("SELECT * FROM movies WHERE id=$1;", [id])
    .then((data) => {
      //   console.log(data);
      if (data.rowCount === 0) {
        res.status(404).json({ message: "movies not found" });
      }
      res.json(data.rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});
app.post("/api/movies", (req, res) => {
  const { title, director, year, rating, genre, poster, movie_duration } =
    req.body; // form data from body
  pool
    .query(
      "INSERT INTO movies (title	,director,	year,	rating,	genre	,poster,	movie_duration) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;",
      [title, director, year, rating, genre, poster, movie_duration]
    )
    .then((data) => {
      console.log(data);
      res.status(201).json(data.rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

app.put("/api/movies/:id", (req, res) => {
  const id = req.params.id;
  const {title, director, year, rating, genre, poster, movie_duration } =
    req.body; // form data from body
  pool
    .query(
      "UPDATE movies SET title=$1,director=$2,year=$3 ,rating=$4,genre=$5,poster=$6,movie_duration=$7 WHERE id=$8 RETURNING *;",
      [title, director, year, rating, genre, poster, movie_duration, id]
    )
    .then((data) => {
      console.log(data);
      res.status(201).json(data.rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});
app.delete("/api/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  pool
    .query("DELETE FROM movies WHERE id=$1 RETURNING *;", [id])
    .then((data) => {
      console.log(data);
      res.json(data.rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});
app.listen(PORT, () => console.log(`server is up on port ${PORT}`));

// Import the movieList.js module
// const movieList = require("./movieList");

// app.get("/", (req, res) => {
// res.send('<h1>Movies</h1><li><a href="/api/movies/">Movies List </a></li>');
//   const id = req.params.id;
//   let movieListHtml = "";
//   for (let i = 0; i < movieList.length; i++) {
//     let movieID = i;
//     movieListHtml += `<a href="/api/movies/${movieID}">
//       <img src=${movieList[movieID].poster} width=250 height=350/>
//       </a>`;
//   }
//   res.send(movieListHtml);
// });

// API
// GET ALL Movies
// app.get("/api/movies", (req, res) => {
//   const id = req.params.id;
//   let movieListHtml = "";
//   for (let i = 0; i < movieList.length; i++) {
//     let movieID = i;
//     movieListHtml += `<a href="/api/movies/${movieID}">
//       <img src=${movieList[movieID].poster} width=250 height=350/>
//       </a>`;
//   }
//   res.send(movieListHtml);
// res.json(movies);
// });

// GET A SPECIFIC MOVIE WITH ID
// app.get("/api/movies/:id", (req, res) => {
//   const id = req.params.id;
//   let movieHtml = "";
//   const movie = movieList.find((b) => b.id === Number(id));
//   if (!movie) {
//     res.status(404).json({ error: `movie with id ${id} Not Found` });
//   }

// prepare movie html
// movieHtml += `<h1>${movie.title}</h1>
// <img src=${movie.poster} width=250 height=350/>`;
// res.send(movieHtml);
// res.json(movie);
// });

// post movies
// app.post("/api/movies", (req, res) => {
//   console.log(req.body);
//   const movie = {
//     id: movieList.length + 1,
//     title: req.body.title,
//     director: req.body.director,
//     year: req.body.year,
//     rating: req.body.rating,
//     genre: req.body.genre,
//     poster: req.body.url,
//     movie_duration: req.body.movie_duration,
//   };
//   movieList.push(movie);
//   res.json(movie);
// });
// app.put("/api/movies/:id", (req, res) => {
//   const id = req.params.id;
//   const movie = movieList.find((b) => b.id === Number(id));
//   if (!movie) {
//     res.status(404).json({ error: `movie with id ${id} Not Found` });
//   }
//   movie.title = req.body.title;
//   movie.director = req.body.director;
//     movie.year = req.body.year;
//     movie.rating= req.body.rating;
//     movie.genre= req.body.genre;
//     movie.poster= req.body.url;
//     movie.movie_duration= req.body.movie_duration,;
//   res.json(movie);
// });
// app.delete("/api/movies/:id", (req, res) => {
//   const id = Number(req.params.id);
//   const movie = movieList.find((b) => b.id === id);
//   if (!movie) {
//     res.status(404).json({ error: `movie with id ${id} Not Found` });
//   }
//   movieList = books.filter((movie) => movie.id !== id);
//   res.json(movie);
// });
