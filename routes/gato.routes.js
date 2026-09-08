import express from "express";
import multer from "multer";

import {
    registrarGato,
    obtenerGatos
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

// Obtener todos los gatos
router.get("/gatos", obtenerGatos);

export default router;