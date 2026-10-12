import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import db from "./firebase.js";

import gatoRoutes from "./routes/gato.routes.js";
import climaRoutes from "./routes/clima.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

// Rate limit para gatos
const limiterGatos = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        mensaje: "Demasiadas peticiones desde esta IP. Intenta de nuevo más tarde.",
    },
    handler: async (req, res, next, options) => {
        try {
            await db.collection("auditoria_gatos").add({
                accion: "rate_limit_bloqueado",
                fecha: new Date().toISOString(),
                ip: req.ip,
                userAgent: req.headers["user-agent"] || "desconocido",
                ruta: req.originalUrl,
                metodo: req.method,
            });
        } catch (error) {
            console.error("Error al guardar auditoría:", error.message);
        }

        return res.status(options.statusCode).json(options.message);
    },
});


// Aplicar el limitador antes de las rutas de gatos
app.use("/gato", limiterGatos);
app.use("/gatos", limiterGatos);

// Rutas del proyecto
app.use(gatoRoutes);
app.use(climaRoutes);

// Ruta no registrada
app.use((req, res) => {
    res.status(404).json({
        mensaje: "Ruta no registrada.",
    });
});

export default app;