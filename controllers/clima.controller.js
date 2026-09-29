export const obtenerClima = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                mensaje: "Se requieren los parámetros lat y lon."
            });
        }

        const latitude = Number(lat);
        const longitude = Number(lon);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return res.status(400).json({
                mensaje: "Las coordenadas no son válidas."
            });
        }

        // Primera opción
        let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability&timezone=auto`;

        let respuesta = await fetch(url);

        // Si falla, hacemos una segunda petición más sencilla
        if (!respuesta.ok) {
            console.log("Primera petición falló. Intentando nuevamente...");

            url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability`;

            respuesta = await fetch(url);
        }

        const data = await respuesta.json();

        console.log("Open-Meteo:", data);

        if (!respuesta.ok) {
            return res.status(500).json({
                mensaje: "Open-Meteo rechazó la solicitud.",
                error: data.reason || "Error desconocido",
                estado: respuesta.status
            });
        }

        if (
            !data.hourly ||
            !data.hourly.time ||
            !data.hourly.temperature_2m
        ) {
            return res.status(500).json({
                mensaje: "Open-Meteo no devolvió los datos esperados."
            });
        }

        const pronostico = data.hourly.time
            .slice(0, 12)
            .map((hora, index) => ({
                hora: hora,
                temperatura: data.hourly.temperature_2m[index],
                probabilidadLluvia:
                    data.hourly.precipitation_probability
                        ? data.hourly.precipitation_probability[index]
                        : 0
            }));

        return res.status(200).json({
            ubicacion: {
                latitud: latitude,
                longitud: longitude
            },
            pronostico: pronostico
        });

    } catch (error) {
        console.error("ERROR CLIMA:", error);

        return res.status(500).json({
            mensaje: "No se pudo conectar con Open-Meteo.",
            error: error.message
        });
    }
};