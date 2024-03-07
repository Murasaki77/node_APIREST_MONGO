const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

//MIDDLEWARE
const getBook = async (req, res, next) => {
  let book;
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({
      messege: "El ID del libro no es valido",
    });
  }

  try {
    book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        messege: "El libro no fue encontrado",
      });
    }
  } catch (error) {
    return res.status(500).json({
      messege: error.messege,
    });
  }

  res.book = book;
  next();
};

//Obtener todos los libros [GET ALL]
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    console.log("GET ALL", books);
    if (books.length === 0) {
      return res.status(204).json([]);
    }
    res.json(books);
  } catch (error) {
    res.status(500).json({ messege: error.messege });
  }
});

//Crear un nuevo libre (recurso) [POST]

router.post("/", async (req, res) => {
  const { title, author, genre, publication_date } = req?.body;
  if (!title || !author || !genre || !publication_date) {
    return res.status(400).json({
      messege: "Los campos titulo, autor, genero y fecha son obligatorios",
    });
  }
  const book = new Book({
    title,
    author,
    genre,
    publication_date,
  });
 
  try {
    const newBook = await book.save();
    console.log(newBook);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({
      messege: error.messege,
    });
  }
});

//esto es para buscar luego los libros por id [PROBAR EN POSTMAN CON GET]
router.get("/:id", getBook, async (req, res) => {
  res.json(res.book);
});

//Actualiza un dato concreto de un libro
router.put("/:id", getBook, async (req, res) => {
  try {
    const book = res.book;
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({
      messege: error.messege,
    });
  }
});

//Aplica cambios parciales en el libro
router.patch("/:id", getBook, async (req, res) => {
    
    if(!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date){
        res.status(400).json({
            messege: 'Al menos uno de estos campos debe ser enviado : Titulo, Autor, Genero, Año de Publicacion'
        })
    }
    
    try {
      const book = res.book;
      book.title = req.body.title || book.title;
      book.author = req.body.author || book.author;
      book.genre = req.body.genre || book.genre;
      book.publication_date = req.body.publication_date || book.publication_date;
  
      const updatedBook = await book.save();
      res.json(updatedBook);
    } catch (error) {
      res.status(400).json({
        messege: error.messege,
      });
    }
  });

//Metodo para Eliminar un libro
  router.delete('/:id', getBook, async (req, res ) => {
    try{
        const book = res.book
        await book.deleteOne({
            _id: book._id
        })
        res.json({
            messege: `El libro ${book.title} fue eliminado`
        })
    }catch(error){
        res.status(500).json({
            messege: error.messege
        })
    }
  })


module.exports = router;
