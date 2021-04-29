const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { logger } = require('../helpers/logger');

exports.autenticarUsuario = async (req, res) => {
    // revisar si hay errores
    const errores = validationResult(req);
    if( !errores.isEmpty() ) {
        return res.status(400).json({errores: errores.array() })
    }

    // extraer el email y password
    const { email, password, ip } = req.body;

    try {
        // Revisar que sea un usuario registrado
        let usuario = await Usuario.findOne({ email });
        if(!usuario) {
            logger.alert({message: 'INTENTO DE LOGIN', level: 'info', status: '406', ip, req});
            return res.status(406).json({msg: 'El usuario no existe'});
        }

        // Revisar el password
        const passCorrecto = await bcryptjs.compare(password, usuario.password);
        if(!passCorrecto) {
            logger.alert({message: 'INTENTO DE LOGIN', level: 'info', status: '401', ip, req});
            return res.status(401).json({msg: 'Password Incorrecto' })
        }

        // Si todo es correcto Crear y firmar el JWT
         const payload = {
            usuario: {
                id: usuario.id
            }
        };

        // firmar el JWT
        jwt.sign(payload, process.env.SECRETA, {
            expiresIn: 3600 // 1 hora
        }, (error, token) => {
            if(error) throw error;

            // Mensaje de confirmación
            res.json({ token });
        });

        logger.info({message: 'INGRESO USUARIO', status: '202', ip, req});

    } catch (error) {
        console.log(error);
    }
}


// Obtiene que usuario esta autenticado
exports.usuarioAutenticado = async (req, res) => {

    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-password');
        res.json({usuario});

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Hubo un error'});
        logger.info({message: 'ERROR INTERNO', status: '500', req});
    }
}