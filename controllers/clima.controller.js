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

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return res.status(400).json({
                mensaje: "lat y lon deben ser números válidos."
            });
        }

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&hourly=temperature_2m,precipitation_probability` +
            `&forecast_hours=12` +
            `&timezone=auto`;

        console.log("URL Open-Meteo:", url);

        const respuesta = await fetch(url);

        const texto = await respuesta.text();

        console.log("Respuesta Open-Meteo:", texto);

        if (!respuesta.ok) {
            return res.status(500).json({
                mensaje: "Error al obtener el clima de Open-Meteo.",
                estado: respuesta.status,
                detalle: texto
            });
        }

        const data = JSON.parse(texto);

        if (!data.hourly) {
            return res.status(500).json({
                mensaje: "Open-Meteo no devolvió información horaria.",
                detalle: data
            });
        }

        const pronostico = data.hourly.time.map((hora, index) => ({
            hora: hora,
            temperatura: data.hourly.temperature_2m[index],
            probabilidadLluvia:
                data.hourly.precipitation_probability[index]
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
            mensaje: "Error al obtener el pronóstico del clima.",
            error: error.message
        });
    }
};