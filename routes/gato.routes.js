import express from "express";
import multer from "multer";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js"; 
import {
    registrarGato,
    obtenerGatos,
    actualizarGato,
    eliminarGato,
    buscarGatos,
    enviarGatosPorEmail,   
} from '../controllers/gato.controller.js';

const router = express.Router();

router.use(capturarInfoSolicitud); 

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

// Registrar un gato
router.post(
    "/gato",
    upload.single("imagen"),
    registrarGato
);

// Actualizar un gato
router.put(
    "/gato/:id",
    upload.single("imagen"),
    actualizarGato
);

// Obtener todos los gatos
router.get(
    "/gatos",
    obtenerGatos
);

// Buscar gatos
router.get(
    "/gatos/buscar",
    buscarGatos
);

// Eliminar un gato
router.delete(
    "/gato/:id",
    eliminarGato
);

router.get('/gatos/enviar-email', enviarGatosPorEmail);



export default router;