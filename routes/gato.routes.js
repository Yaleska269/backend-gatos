import express from "express";
import multer from "multer";

import {
    registrarGato,
    obtenerGatos,
    actualizarGato,
    eliminarGato
} from "../controllers/gato.controller.js";

const router = express.Router();

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

// Eliminar un gato
router.delete(
    "/gato/:id",
    eliminarGato
);

export default router;