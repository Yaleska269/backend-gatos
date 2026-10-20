import ExcelJS from "exceljs";
import { calcularEstadisticas } from "./estadisticas.controller.js";

export async function exportarEstadisticasExcel(req, res) {
    try {
        const estadisticas = await calcularEstadisticas();
        const workbook = new ExcelJS.Workbook();

        workbook.creator = "Backend Gatos";
        workbook.created = new Date();

        // Hoja 1: Resumen
        const resumen = workbook.addWorksheet("Resumen");

        resumen.columns = [
            { header: "Indicador", key: "indicador", width: 28 },
            { header: "Valor", key: "valor", width: 20 },
        ];

        resumen.addRows([
            { indicador: "Total de gatos", valor: estadisticas.total },
            { indicador: "Edad promedio", valor: estadisticas.promedioEdad },
            { indicador: "Peso promedio", valor: estadisticas.promedioPeso },
            { indicador: "Edad mínima", valor: estadisticas.edadMinima ?? "N/A" },
            { indicador: "Edad máxima", valor: estadisticas.edadMaxima ?? "N/A" },
            { indicador: "Peso mínimo", valor: estadisticas.pesoMinimo ?? "N/A" },
            { indicador: "Peso máximo", valor: estadisticas.pesoMaximo ?? "N/A" },
        ]);

        // Hoja 2: Por Raza
        const porRaza = workbook.addWorksheet("Por Raza");

        porRaza.columns = [
            { header: "Raza", key: "raza", width: 25 },
            { header: "Cantidad", key: "cantidad", width: 15 },
            { header: "Porcentaje", key: "porcentaje", width: 18 },
        ];

        Object.entries(estadisticas.porRaza).forEach(([raza, cantidad]) => {
            porRaza.addRow({
                raza,
                cantidad,
                porcentaje:
                    estadisticas.total > 0
                        ? Number(
                            ((cantidad / estadisticas.total) * 100).toFixed(2)
                        )
                        : 0,
            });
        });

        // Hoja 3: Por Mes
        const porMes = workbook.addWorksheet("Por Mes");

        porMes.columns = [
            { header: "Mes", key: "mes", width: 20 },
            { header: "Cantidad de gatos", key: "cantidad", width: 22 },
        ];

        Object.entries(estadisticas.porMes)
            .sort(([mesA], [mesB]) => mesA.localeCompare(mesB))
            .forEach(([mes, cantidad]) => {
                porMes.addRow({ mes, cantidad });
            });

        // Hoja 4: Listado de Gatos
        const listado = workbook.addWorksheet("Listado de Gatos");

        listado.columns = [
            { header: "ID", key: "id", width: 30 },
            { header: "Nombre", key: "nombre", width: 22 },
            { header: "Edad", key: "edad", width: 12 },
            { header: "Peso", key: "peso", width: 12 },
            { header: "Raza", key: "raza", width: 22 },
            { header: "Fecha de registro", key: "fecha", width: 25 },
        ];

        estadisticas.gatos.forEach((gato) => {
            listado.addRow({
                id: gato.id,
                nombre: gato.nombre || "",
                edad: gato.edad ?? "",
                peso: gato.peso ?? "",
                raza: gato.raza || "",
                fecha: gato.fecha || "",
            });
        });

        // Dar estilo a los encabezados de todas las hojas
        workbook.worksheets.forEach((hoja) => {
            const encabezado = hoja.getRow(1);

            encabezado.font = {
                bold: true,
                color: { argb: "FFFFFFFF" },
            };

            encabezado.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD31A24" },
            };

            encabezado.alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            encabezado.height = 22;
            hoja.views = [{ state: "frozen", ySplit: 1 }];
            hoja.autoFilter = {
                from: "A1",
                to: `${String.fromCharCode(64 + hoja.columns.length)}1`,
            };
        });

        const fechaActual = new Date().toISOString().slice(0, 10);
        const nombreArchivo = `estadisticas-gatos-${fechaActual}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nombreArchivo}"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error al exportar estadísticas:", error.message);

        if (!res.headersSent) {
            return res.status(500).json({
                mensaje: "Error al exportar las estadísticas a Excel",
                error: error.message,
            });
        }

        res.end();
    }
}