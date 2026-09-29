import express from "express";
import cors from "cors";

import gatoRoutes from "./routes/gato.routes.js";
import climaRoutes from "./routes/clima.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(gatoRoutes);
app.use(climaRoutes);

app.use((req, res) => {
    res.status(404).json({
        mensaje: "Ruta no registrada."
    });
});

export default app;