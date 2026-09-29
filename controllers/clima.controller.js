export const obtenerClima = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                mensaje: "Se requieren los parámetros lat y lon."
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                mensaje: "lat y lon deben ser números válidos."
            });
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability&forecast_days=1&timezone=auto`;

        console.log("Consultando:", url);

        const respuesta = await fetch(url);

        const data = await respuesta.json();

        console.log("Respuesta Open-Meteo:", data);

        if (!respuesta.ok) {
            return res.status(500).json({
                mensaje: "Error al obtener el clima de Open-Meteo.",
                estado: respuesta.status,
                detalle: data
            });
        }

        if (!data.hourly || !data.hourly.time) {
            return res.status(500).json({
                mensaje: "Open-Meteo no devolvió datos horarios.",
                detalle: data
            });
        }

        const pronostico = data.hourly.time
            .slice(0, 12)
            .map((hora, index) => ({
                hora: hora,
                temperatura: data.hourly.temperature_2m[index],
                probabilidadLluvia:
                    data.hourly.precipitation_probability[index]
            }));

        res.status(200).json({
            ubicacion: {
                latitud: latitude,
                longitud: longitude
            },
            pronostico: pronostico
        });

    } catch (error) {
        console.error("ERROR CLIMA:", error);

        res.status(500).json({
            mensaje: "Error al obtener el pronóstico del clima.",
            error: error.message
        });
    }
};