import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import db from "../firebase.js";
import { calcularEstadisticas } from "./estadisticas.controller.js";

// =====================================================
// EXPORTAR ESTADÍSTICAS A EXCEL
// =====================================================

export const exportarEstadisticasExcel = async (req, res) => {
    try {
        const stats = await calcularEstadisticas();
        const workbook = new ExcelJS.Workbook();

        workbook.creator = "Sistema de Gatos";
        workbook.created = new Date();

        const estiloTitulo = {
            font: { bold: true, size: 16, color: { argb: "FFFFFFFF" } },
            fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF4472C4" },
            },
            alignment: { horizontal: "center", vertical: "middle" },
        };

        const estiloEncabezado = {
            font: { bold: true, color: { argb: "FFFFFFFF" } },
            fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF5B9BD5" },
            },
            alignment: { horizontal: "center" },
        };

        const estiloLabel = {
            font: { bold: true },
            fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD6EAF8" },
            },
        };

        // HOJA 1: RESUMEN
        const hojaResumen = workbook.addWorksheet("Resumen", {
            properties: { tabColor: { argb: "FF4472C4" } },
        });

        hojaResumen.mergeCells("A1:B1");
        hojaResumen.getCell("A1").value = "ESTADÍSTICAS DE GATOS";
        hojaResumen.getCell("A1").style = estiloTitulo;
        hojaResumen.getRow(1).height = 30;
        hojaResumen.addRow([]);

        hojaResumen.addRow(["Métrica", "Valor"]).eachCell((cell) => {
            cell.style = estiloEncabezado;
        });

        const datosResumen = [
            ["Total de gatos", stats.total],
            ["Promedio de edad (años)", stats.promedioEdad],
            ["Promedio de peso (kg)", stats.promedioPeso],
            ["Edad mínima", stats.edadMinima ?? "—"],
            ["Edad máxima", stats.edadMaxima ?? "—"],
            ["Peso mínimo (kg)", stats.pesoMinimo ?? "—"],
            ["Peso máximo (kg)", stats.pesoMaximo ?? "—"],
            ["Fecha de generación", new Date().toLocaleString("es-ES")],
        ];

        datosResumen.forEach(([label, valor]) => {
            const row = hojaResumen.addRow([label, valor]);
            row.getCell(1).style = estiloLabel;
        });

        hojaResumen.getColumn(1).width = 28;
        hojaResumen.getColumn(2).width = 25;

        // HOJA 2: DISTRIBUCIÓN POR RAZA
        const hojaRazas = workbook.addWorksheet("Por Raza", {
            properties: { tabColor: { argb: "FF70AD47" } },
        });

        hojaRazas.mergeCells("A1:C1");
        hojaRazas.getCell("A1").value = "Distribución por Raza";
        hojaRazas.getCell("A1").style = {
            ...estiloTitulo,
            fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF70AD47" },
            },
        };

        hojaRazas.getRow(1).height = 28;
        hojaRazas.addRow([]);

        hojaRazas.addRow(["Raza", "Cantidad", "Porcentaje (%)"]).eachCell((cell) => {
            cell.style = {
                ...estiloEncabezado,
                fill: {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF70AD47" },
                },
            };
        });

        Object.entries(stats.porRaza || {})
            .sort((a, b) => b[1] - a[1])
            .forEach(([raza, cantidad]) => {
                const porcentaje = stats.total > 0
                    ? Number(((cantidad / stats.total) * 100).toFixed(1))
                    : 0;

                hojaRazas.addRow([raza, cantidad, porcentaje]);
            });

        hojaRazas.getColumn(1).width = 25;
        hojaRazas.getColumn(2).width = 12;
        hojaRazas.getColumn(3).width = 16;

        // HOJA 3: REGISTROS POR MES
        const hojaMeses = workbook.addWorksheet("Por Mes", {
            properties: { tabColor: { argb: "FFED7D31" } },
        });

        hojaMeses.mergeCells("A1:B1");
        hojaMeses.getCell("A1").value = "Gatos registrados por mes";
        hojaMeses.getCell("A1").style = {
            ...estiloTitulo,
            fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFED7D31" },
            },
        };

        hojaMeses.getRow(1).height = 28;
        hojaMeses.addRow([]);

        hojaMeses.addRow(["Mes (YYYY-MM)", "Cantidad"]).eachCell((cell) => {
            cell.style = {
                ...estiloEncabezado,
                fill: {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFED7D31" },
                },
            };
        });

        Object.entries(stats.porMes || {})
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([mes, cantidad]) => {
                hojaMeses.addRow([mes, cantidad]);
            });

        hojaMeses.getColumn(1).width = 18;
        hojaMeses.getColumn(2).width = 12;

        // HOJA 4: LISTADO DE GATOS
        const hojaGatos = workbook.addWorksheet("Listado de Gatos", {
            properties: { tabColor: { argb: "FF7030A0" } },
        });

        hojaGatos.mergeCells("A1:F1");
        hojaGatos.getCell("A1").value = "Listado completo de gatos";
        hojaGatos.getCell("A1").style = {
            ...estiloTitulo,
            fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF7030A0" },
            },
        };

        hojaGatos.getRow(1).height = 28;
        hojaGatos.addRow([]);

        hojaGatos.addRow([
            "ID",
            "Nombre",
            "Edad",
            "Peso (kg)",
            "Raza",
            "Fecha de registro",
        ]).eachCell((cell) => {
            cell.style = {
                ...estiloEncabezado,
                fill: {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF7030A0" },
                },
            };
        });

        (stats.gatos || []).forEach((gato) => {
            let fechaRegistro = "—";

            if (gato.fecha) {
                const fecha = new Date(gato.fecha);
                fechaRegistro = Number.isNaN(fecha.getTime())
                    ? String(gato.fecha)
                    : fecha.toLocaleString("es-ES");
            }

            hojaGatos.addRow([
                gato.id,
                gato.nombre || "",
                gato.edad ?? "",
                gato.peso ?? "",
                gato.raza || "",
                fechaRegistro,
            ]);
        });

        hojaGatos.getColumn(1).width = 28;
        hojaGatos.getColumn(2).width = 18;
        hojaGatos.getColumn(3).width = 10;
        hojaGatos.getColumn(4).width = 12;
        hojaGatos.getColumn(5).width = 18;
        hojaGatos.getColumn(6).width = 25;

        const nombreArchivoExcel =
            `estadisticas-gatos-${new Date().toISOString().slice(0, 10)}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nombreArchivoExcel}"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error al generar Excel:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                mensaje: "Error al generar el archivo Excel.",
                error: error.message,
            });
        }

        if (!res.writableEnded) res.end();
    }
};

// =====================================================
// EXPORTAR ESTADÍSTICAS A PDF
// =====================================================

export const exportarEstadisticasPDF = async (req, res) => {
    try {
        const stats = await calcularEstadisticas();

        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
            bufferPages: true,
            info: {
                Title: "Estadísticas de Gatos",
                Author: "Sistema de Gatos",
            },
        });

        const nombreArchivoPDF =
            `estadisticas-gatos-${new Date().toISOString().slice(0, 10)}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nombreArchivoPDF}"`
        );

        doc.pipe(res);

        const colorPrincipal = "#4472C4";
        const colorSecundario = "#5B9BD5";
        const colorTexto = "#333333";

        // TÍTULO
        doc
            .fontSize(22)
            .fillColor(colorPrincipal)
            .font("Helvetica-Bold")
            .text("Estadísticas de Gatos", { align: "center" });

        doc.moveDown(0.3);

        doc
            .fontSize(10)
            .fillColor("#666666")
            .font("Helvetica")
            .text(`Generado el: ${new Date().toLocaleString("es-ES")}`, {
                align: "center",
            });

        doc.moveDown(1.5);

        // RESUMEN GENERAL
        doc
            .fontSize(14)
            .fillColor(colorPrincipal)
            .font("Helvetica-Bold")
            .text("Resumen General");

        doc
            .moveTo(50, doc.y + 5)
            .lineTo(545, doc.y + 5)
            .strokeColor(colorPrincipal)
            .lineWidth(1.5)
            .stroke();

        doc.moveDown(0.8);

        const resumen = [
            ["Total de gatos", stats.total],
            ["Promedio de edad", `${stats.promedioEdad} años`],
            ["Promedio de peso", `${stats.promedioPeso} kg`],
            ["Edad mínima", stats.edadMinima != null ? `${stats.edadMinima} años` : "—"],
            ["Edad máxima", stats.edadMaxima != null ? `${stats.edadMaxima} años` : "—"],
            ["Peso mínimo", stats.pesoMinimo != null ? `${stats.pesoMinimo} kg` : "—"],
            ["Peso máximo", stats.pesoMaximo != null ? `${stats.pesoMaximo} kg` : "—"],
        ];

        resumen.forEach(([label, valor]) => {
            doc
                .fontSize(11)
                .fillColor(colorTexto)
                .font("Helvetica-Bold")
                .text(`${label}: `, { continued: true })
                .font("Helvetica")
                .text(String(valor));

            doc.moveDown(0.3);
        });

        doc.moveDown(1);

        // DISTRIBUCIÓN POR RAZA
        doc
            .fontSize(14)
            .fillColor(colorPrincipal)
            .font("Helvetica-Bold")
            .text("Distribución por Raza");

        doc
            .moveTo(50, doc.y + 5)
            .lineTo(545, doc.y + 5)
            .strokeColor(colorPrincipal)
            .lineWidth(1.5)
            .stroke();

        doc.moveDown(0.8);

        const razasOrdenadas = Object.entries(stats.porRaza || {})
            .sort((a, b) => b[1] - a[1]);

        if (razasOrdenadas.length === 0) {
            doc.fontSize(11).fillColor("#666666").text("No hay datos de razas.");
        } else {
            const startY = doc.y;

            doc
                .fontSize(10)
                .fillColor("#FFFFFF")
                .rect(50, startY, 495, 22)
                .fill(colorSecundario);

            doc
                .fillColor("#FFFFFF")
                .font("Helvetica-Bold")
                .text("Raza", 60, startY + 6)
                .text("Cantidad", 300, startY + 6)
                .text("Porcentaje", 420, startY + 6);

            doc.y = startY + 28;

            razasOrdenadas.forEach(([raza, cantidad], index) => {
                if (doc.y > doc.page.height - 80) {
                    doc.addPage();
                }

                const porcentaje = stats.total > 0
                    ? ((cantidad / stats.total) * 100).toFixed(1)
                    : "0.0";

                const filaY = doc.y;

                if (index % 2 === 0) {
                    doc.rect(50, filaY - 4, 495, 20).fill("#F2F2F2");
                }

                doc
                    .fillColor(colorTexto)
                    .font("Helvetica")
                    .fontSize(10)
                    .text(String(raza), 60, filaY)
                    .text(String(cantidad), 300, filaY)
                    .text(`${porcentaje}%`, 420, filaY);

                doc.y = filaY + 20;
            });
        }

        doc.moveDown(1.2);

        // REGISTROS POR MES
        if (doc.y > doc.page.height - 100) {
            doc.addPage();
        }

        doc
            .fontSize(14)
            .fillColor(colorPrincipal)
            .font("Helvetica-Bold")
            .text("Gatos registrados por mes");

        doc
            .moveTo(50, doc.y + 5)
            .lineTo(545, doc.y + 5)
            .strokeColor(colorPrincipal)
            .lineWidth(1.5)
            .stroke();

        doc.moveDown(0.8);

        const mesesOrdenados = Object.entries(stats.porMes || {})
            .sort((a, b) => a[0].localeCompare(b[0]));

        if (mesesOrdenados.length === 0) {
            doc.fontSize(11).fillColor("#666666").text("No hay datos por mes.");
        } else {
            mesesOrdenados.forEach(([mes, cantidad]) => {
                if (doc.y > doc.page.height - 70) {
                    doc.addPage();
                }

                doc
                    .fontSize(11)
                    .fillColor(colorTexto)
                    .font("Helvetica-Bold")
                    .text(`${mes}: `, { continued: true })
                    .font("Helvetica")
                    .text(`${cantidad} gato(s)`);

                doc.moveDown(0.3);
            });
        }

        // PIE DE PÁGINA
        const rangoPaginas = doc.bufferedPageRange();

        for (let i = 0; i < rangoPaginas.count; i++) {
            doc.switchToPage(i);

            doc
                .fontSize(8)
                .fillColor("#999999")
                .text(
                    `Página ${i + 1} de ${rangoPaginas.count} | Sistema de Gatos`,
                    50,
                    doc.page.height - 40,
                    { align: "center", width: 495 }
                );
        }

        doc.end();
    } catch (error) {
        console.error("Error al generar PDF:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                mensaje: "Error al generar el archivo PDF.",
                error: error.message,
            });
        }

        if (!res.writableEnded) res.end();
    }
};

// =====================================================
// EXPORTAR LISTADO DE GATOS A CSV
// =====================================================

export const exportarGatosCSV = async (req, res) => {
    try {
        const snapshot = await db
            .collection("gatos")
            .orderBy("fecha", "desc")
            .get();

        const gatos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Escapar correctamente los valores CSV
        const escapar = (valor) => {
            if (valor === null || valor === undefined) {
                return "";
            }

            const str = String(valor);

            if (
                str.includes(",") ||
                str.includes('"') ||
                str.includes("\n") ||
                str.includes("\r")
            ) {
                return `"${str.replace(/"/g, '""')}"`;
            }

            return str;
        };

        const encabezados = [
            "ID",
            "Nombre",
            "Edad",
            "Peso (kg)",
            "Raza",
            "URL Imagen",
            "Fecha de registro",
        ];

        const lineas = [encabezados.join(",")];

        gatos.forEach((gato) => {
            let fecha = "";

            if (gato.fecha) {
                const fechaConvertida =
                    typeof gato.fecha.toDate === "function"
                        ? gato.fecha.toDate()
                        : new Date(gato.fecha);

                fecha = Number.isNaN(fechaConvertida.getTime())
                    ? String(gato.fecha)
                    : fechaConvertida.toLocaleString("es-ES");
            }

            const fila = [
                escapar(gato.id),
                escapar(gato.nombre),
                escapar(gato.edad ?? ""),
                escapar(gato.peso ?? ""),
                escapar(gato.raza),
                escapar(gato.imagenUrl),
                escapar(fecha),
            ];

            lineas.push(fila.join(","));
        });

        const csvContent = lineas.join("\n");

        const nombreArchivo =
            `gatos-${new Date().toISOString().slice(0, 10)}.csv`;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nombreArchivo}"`
        );

        // BOM UTF-8 para mostrar correctamente los acentos en Excel
        res.write("\uFEFF");
        res.end(csvContent);
    } catch (error) {
        console.error("Error al exportar gatos a CSV:", error);

        res.status(500).json({
            mensaje: "Error al generar el archivo CSV de gatos.",
            error: error.message,
        });
    }
};