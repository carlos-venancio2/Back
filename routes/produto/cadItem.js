// URL base do item: http://localhost:3000/item/
/*
Modelo de inserção de dados para teste no postman: 

{
    "nome": "Monitor Dell",
    "qtd": 3,
    "valor": 10.2,
    "qtdMinima": 2,
    "categoria": "Tela",
    "foto":
  }
*/

const express = require('express');

const router = express.Router();

const createDBConnection = require('../../db')
const db = createDBConnection()

//  const verifyjwt = require('../../middleware/jwt_autorization')

const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'img')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

router.post('/upload', upload.single('foto'), (req, res) => {
    console.log(req.file)
    const foto = req.file.filename
    const sql = "UPDATE itens SET foto=?"
    db.query(sql, [foto], (err, result) => {
        if (err) return res.json({
            Messge: "Error"
        })
        return res.json({
            Status: "Sucess"
        })
    })
})

// router.get('/', verifyjwt, (req,res) => {
//     return res.json({Status: "Sucesso", usuarioId: req.usuarioId})
// })

router.post('/', upload.single('foto'), (req, res) => {
    const {
        cadItemId,
        nome,
        qtdMinima,
        fk_categoriaId
    } = req.body
    const foto = req.file

    if (!nome || !qtdMinima || !fk_categoriaId || !foto) {
        return res.status(400).json({
            message: 'Todos os itens são obrigatórios'
        })
    }

    if (qtdMinima < 0) {
        return res.status(400).json({
            message: 'A quantidade minima não pode ser menor do que 0'
        })
    }
  
    const itemPattern = /^[A-Z][a-zà-ú ]*$/; // regex para que apenas a primeira letra da sentença seja maiuscula


    if (!nome.match(itemPattern)) {
        return res.status(400).json({
            message: 'O nome do item deve ter apenas a primeira letra da sentença maiuscula'
        })
    }
    console.log(typeof fk_categoriaId) 

    const new_fk_categoriaId = parseInt(fk_categoriaId)
    console.log(typeof new_fk_categoriaId) 
    console.log(new_fk_categoriaId) 

    if (!Number.isInteger(new_fk_categoriaId)) {
        return res.status(400).json({
            message: 'Insira o id da categoria como um número inteiro'
        });
    }
    // if (!Number.isInteger(fk_categoriaId)) {
    //     return res.status(400).json({
    //         message: 'Insira o id da categoria como um número inteiro'
    //     });
    // }

    // if (!String(fk_categoriaId).match(itemPattern)) {
    //     return res.status(400).json({
    //         message: 'Insira o id do item'
    //     })
    // }


    const validationItem = "SELECT COUNT(*) AS count FROM cadastroitem WHERE nome = ?"
    db.query(validationItem, [nome], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        const itemExists = result[0].count > 0;
        if (itemExists) {
            return res.status(400).json({
                message: 'Este item já está cadastrado'
            });
        }

        const validationCategoria = "SELECT categoriaId FROM categoria WHERE nome = ?";
        // db.query(validationCategoria, [fk_categoriaId], (err, result) => {
        db.query(validationCategoria, [new_fk_categoriaId], (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            if (result.length === 0) {
                return res.status(400).json({
                    message: 'A categoria especificada não existe'
                });
            }
            
            const categoriaId = result[0].categoriaId;

            const sql = "INSERT INTO cadastroitem (`foto`, `nome`, `qtdMinima`, `fk_categoriaId`) VALUES (?, ?, ?, ?)";
            // const values = [foto.filename, nome, qtdMinima, fk_categoriaId];
            const values = [foto.filename, nome, qtdMinima, categoriaId];

            db.query(sql, values, (err, data) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                } else {
                    res.status(201).json({
                        message: 'Dados inseridos no sistema com sucesso'
                    })
                }
                // res.status(201).json(data);
            });
        });
    });
});

router.get('/', (req, res) => {
    const sql = "SELECT cadItemId, foto, nome, qtdMinima, fk_categoriaId FROM cadastroitem";
    const values = [req.body.cadItemId, req.body.foto, req.body.nome, req.body.qtdMinima, req.body.fk_categoriaId];

    db.query(sql, values, (err, data) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        } else {
            res.status(201).json(data);
        }
        // res.status(201).json(data);
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT cadItemId, foto, nome, qtdMinima, fk_categoriaId FROM cadastroitem WHERE cadItemId = ?";
    const values = [id];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                error: err.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: 'Item não encontrado'
            });
        }
        res.status(200).json(data[0]);
    });
});

router.put('/:id', upload.single('foto'), (req, res) => {
    const id = req.params.id;
    const {
        nome,
        qtdMinima,
        fk_categoriaId
    } = req.body
    const foto = req.file

    if (!nome || !qtdMinima || !fk_categoriaId || !foto) {
        return res.status(400).json({
            message: 'Todos os itens são obrigatórios'
        })
    }

    if (qtdMinima < 0) {
        return res.status(400).json({
            message: 'A quantidade minima não pode ser menor do que 0'
        })
    }
    if (!Number.isInteger(fk_categoriaId)) {
        return res.status(400).json({
            message: 'Insira o id doa categoria como um número inteiro'
        });
    }

    const itemPattern = /^[A-Z][a-zà-ú ]*$/; // regex para que apenas a primeira letra da sentença seja maiuscula

    if (!nome.match(itemPattern)) {
        return res.status(400).json({
            message: 'O nome do item deve ter apenas a primeira letra da sentença maiuscula'
        })
    }
    const validationCategoria = "SELECT fk_categoriaId FROM categoria WHERE nome = ?";
    db.query(validationCategoria, [fk_categoriaId], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (result.length === 0) {
            return res.status(400).json({
                message: 'A categoria especificada não existe'
            });
        }
        const fk_categoriaId = result[0].fk_categoriaId;

        const sql = "UPDATE cadastroitem SET foto =?, nome = ?, qtdMinima = ?, fk_categoriaId = ? WHERE itemId = ?";
        const values = [foto.filename, nome, qtdMinima, fk_categoriaId, id];

        db.query(sql, values, (err, data) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            if (data.length === 0) {
                return res.status(404).json({
                    message: 'Item não encontrado'
                });
            }
            res.status(200).json({
                message: 'Dados atualizados do sistema com sucesso'
            });
        });
    });
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM cadastroitem WHERE itemId = ?";
    const values = [id];

    db.query(sql, values, (err, data) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: 'Item não encontrado'
            });
        }
        res.status(200).json({
            message: 'Dados deletados do sistema com sucesso'
        });
    });
});

module.exports = router;