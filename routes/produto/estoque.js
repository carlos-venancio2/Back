// URL base da controle: http://localhost:3000/estoque/
/*
Modelo de inserção de dados para teste no postman: 

{
    "fk_solicId":1
}
*/

const express = require('express');

const router = express.Router();

const createDBConnection = require('../../db')
const db = createDBConnection()

router.post('/', (req, res) => {
    const {
        qtdeTotal,
        fk_categoriaId,
        fk_cadItemId,
        fk_qtdItemId,
        precoMedio
    } = req.body

    if (!qtdeTotal || !fk_categoriaId || !fk_cadItemId || !fk_qtdItemId || !precoMedio) {
        return res.status(400).json({
            message: 'Todos os campos são obrigatórios!'
        })
    }

    const validationCategoria = "SELECT COUNT(*) AS count FROM categoria WHERE cateId = ?";
    db.query(validationCategoria, [fk_categoriaId], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        const categoriaExists = result[0].count > 0;
        if (!categoriaExists) {
            return res.status(400).json({
                message: 'Categoria Inválida'
            });
        }

        const validationCadItem = "SELECT COUNT(*) AS count FROM cadastroitem WHERE cadItemId = ?";
        db.query(validationCadItem, [fk_cadItemId], (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            const cadItemExists = result[0].count > 0;
            if (!cadItemExists) {
                return res.status(400).json({
                    message: 'Item inválido (cadastro)'
                });
            }

            const validationQtdItem = "SELECT COUNT(*) AS count FROM qtdItem WHERE qtdItemId = ?";
            db.query(validationQtdItem, [fk_qtdItemId], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }
                const qtdItemExists = result[0].count > 0;
                if (!qtdItemExists) {
                    return res.status(400).json({
                        message: 'Item inválido (qtd)'
                    });
                }

                const sql = "INSERT INTO estoque (`qtdeTotal`, `fk_categoriaId`, `fk_cadItemId`, `fk_qtdItemId`, `precoMedio`, ) VALUES (?, ?, ?, ?, ?)";
                const values = [
                    qtdeTotal,
                    fk_categoriaId,
                    fk_cadItemId,
                    fk_qtdItemId,
                    precoMedio
                ];

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
                });
            });
        });
    });
});


router.get('/', (req, res) => {
    const sql = "SELECT * FROM view_estoque";
    const values = [req.estoqueId, req.body.qtdeTotal, req.body.fk_categoriaId, req.body.fk_cadItemId,
        req.body.fk_qtdItemId, req.body.precoMedio
    ];

    db.query(sql, values, (err, data) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        } else {
            res.status(201).json(data);
        }
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT qtdeTotal, fk_categoriaId, fk_cadItemId, fk_qtdItemId, precoMedio FROM view_estoque WHERE estoqueId = ?";
    const values = [id];

    db.query(sql, values, (err, data) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: 'Estoque não encontrado'
            });
        }
        res.status(200).json(data[0]);
    });
});

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const {
        qtdeTotal,
        fk_categoriaId,
        fk_cadItemId,
        fk_qtdItemId,
        precoMedio
    } = req.body

    if (!qtdeTotal || !fk_categoriaId || !fk_cadItemId || !fk_qtdItemId || !precoMedio) {
        return res.status(400).json({
            message: 'Todos os campos são obrigatórios!'
        })
    }

    const validationCategoria = "SELECT COUNT(*) AS count FROM categoria WHERE cateId = ?";
    db.query(validationCategoria, [fk_categoriaId], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        const categoriaExists = result[0].count > 0;
        if (!categoriaExists) {
            return res.status(400).json({
                message: 'Categoria Inválida'
            });
        }

        const validationCadItem = "SELECT COUNT(*) AS count FROM cadastroitem WHERE cadItemId = ?";
        db.query(validationCadItem, [fk_cadItemId], (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            const cadItemExists = result[0].count > 0;
            if (!cadItemExists) {
                return res.status(400).json({
                    message: 'Item inválido (cadastro)'
                });
            }

            const validationQtdItem = "SELECT COUNT(*) AS count FROM qtdItem WHERE qtdItemId = ?";
            db.query(validationQtdItem, [fk_qtdItemId], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }
                const qtdItemExists = result[0].count > 0;
                if (!qtdItemExists) {
                    return res.status(400).json({
                        message: 'Item inválido (qtd)'
                    });
                }


                const sql = "UPDATE estoque SET qtdeTotal = ?, fk_categoriaId = ?, fk_cadItemId = ?, fk_qtdItemId = ?, precoMedio = ?  WHERE estoqueId = ? ";
                const values = [qtdeTotal,
                    fk_categoriaId,
                    fk_cadItemId,
                    fk_qtdItemId,
                    precoMedio,
                    id
                ];

                db.query(sql, values, (err, data) => {
                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }
                    if (data.length === 0) {
                        return res.status(404).json({
                            message: 'Estoque não encontrado'
                        });
                    }
                    res.status(200).json({
                        message: 'Dados atualizados do sistema com sucesso'
                    });
                });
            });
        });
    });
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM estoque WHERE estoqueId = ?";
    const values = [id];

    db.query(sql, values, (err, data) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: 'Estoque não encontrado'
            });
        }
        res.status(200).json({
            message: 'Dados deletados do sistema com sucesso'
        });
    });
});

module.exports = router;