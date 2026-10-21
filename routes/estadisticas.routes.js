import express from "express";
import { obtenerEstadisticas } from "../controllers/estadisticas.controller.js";
import {
    exportarEstadisticasExcel,
    exportarEstadisticasPDF,
    exportarGatosCSV,
} from "../controllers/exportacion.controller.js";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js";

const router = express.Router();

router.use(capturarInfoSolicitud);

router.get("/estadisticas", obtenerEstadisticas);
router.get("/estadisticas/excel", exportarEstadisticasExcel);
router.get("/estadisticas/pdf", exportarEstadisticasPDF);
router.get("/gatos/csv", exportarGatosCSV);

export default router;