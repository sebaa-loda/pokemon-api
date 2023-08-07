require("dotenv").config();
const axios = require("axios");
const { URL } = process.env;
const { Pokemon, Type } = require("../db");
const { validateUuid } = require("../helpers/validateUUID");
const { UUID, Op } = require("sequelize");
const { getPokeDb } = require("../helpers/pokeDb");

const getPokemons = async (req, res) => {
  try {
    let { data } = await axios.get(`${URL}?limit=30`);
    let pokemons = data.results;
    let pokes = [];
    for (const poke of pokemons) {
      let url = await axios.get(poke.url);
      pokes.push(url.data);
    }
    let apiPokes = pokes.map((poke) => {
      return {
        id: poke.id,
        name: poke.name,
        image: poke.sprites.other.home.front_default,
        HP: poke.stats[0].base_stat,
        attack: poke.stats[1].base_stat,
        defense: poke.stats[2].base_stat,
        speed: poke.stats[5].base_stat,
        heigth: poke.height,
        weigth: poke.weigth,
        type: poke.types.map((e) => {
          return e.type.name;
        }),
      };
    });
    const pokesDb = await getPokeDb();
    return res.status(200).json([...pokesDb, ...apiPokes]);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getPokemonsByName = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    getPokemons(req, res);
  } else {
    try {
      let pokes = await Pokemon.findOne({
        where: { name: { [Op.iRegexp]: `${name}` } },
      });
      if (!pokes) {
        const { data } = await axios.get(`${URL}/${name.toLowerCase()}`);
        if (data.name) {
          const poke = {
            name: data.name,
            image: data.sprites.other.home.front_default,
            healthPoints: data.stats[0].base_stat,
            attack: data.stats[1].base_stat,
            defense: data.stats[2].base_stat,
            speed: data.stats[5].base_stat,
            height: data.height,
            weight: data.weight,
            type: data.types.map((e) => {
              return e.type.name;
            }),
          };
          return res.status(200).json(poke);
        }
      }
      return res.status(200).json(pokes);
    } catch (error) {
      res.status(404).send("there is no pokemon by that name");
    }
  }
};

const getPokemonsById = async (req, res) => {
  const { id } = req.params;

  try {
    if (validateUuid(id)) {
      const pokemon = await Pokemon.findByPk(id);
      return res.status(200).json(pokemon);
    } else {
      const { data } = await axios.get(`${URL}/${id}`);
      const poke = {
        name: data.name,
        image: data.sprites.other.home.front_default,
        healthPoints: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        speed: data.stats[5].base_stat,
        height: data.height,
        weight: data.weight,
        type: data.types.map((e) => {
          return e.type.name;
        }),
      };
      return res.status(200).json(poke);
    }
  } catch (error) {
    res.status(500).json({ error: "ID invalid" });
  }
};

const postPokemons = async (req, res) => {
  try {
    const {
      name,
      image,
      healthPoints,
      attack,
      defense,
      speed,
      height,
      weight,
      types,
    } = req.body;

    if (!name || !image || !healthPoints || !attack || !defense || !types)
      return res.status(400).send("more pokeinfo is required");

    if (!types.length)
      return res.status(400).send("must have at least one type of pokemon");

    const existPokemon = await Pokemon.findOne({ where: { name } });
    if (existPokemon) {
      return res.status(200).send("this pokemon already exists");
    }

    const typeOfPokemon = await Type.findAll({ where: { name: types } });
    const newPokemon = await Pokemon.create({
      name,
      image,
      healthPoints,
      attack,
      defense,
    });

    await newPokemon.addType(typeOfPokemon);
    return res.status(200).json(newPokemon);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getPokemonsById,
  getPokemonsByName,
  postPokemons,
};
