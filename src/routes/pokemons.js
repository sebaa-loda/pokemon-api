const router = require("express").Router();
const {
  getPokemonsById,
  getPokemonsByName,
  postPokemons,
} = require("../controllers/Pokemons");

router.get("/", getPokemonsByName);
router.get("/:id", getPokemonsById);
router.post("/", postPokemons);

module.exports = router;
