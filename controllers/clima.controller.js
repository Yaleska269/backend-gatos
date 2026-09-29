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

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability&timezone=auto`;

        const respuesta = await fetch(url);
        const data = await respuesta.json();

        if (!respuesta.ok) {
            return res.status(respuesta.status).json({
                mensaje: "Open-Meteo rechazó la solicitud.",
                error: data.reason || "Error desconocido",
                estado: respuesta.status
            });
        }

        const pronostico = data.hourly.time.slice(0, 12).map((hora, index) => ({
            hora: hora,
            temperatura: data.hourly.temperature_2m[index],
            probabilidadLluvia: data.hourly.precipitation_probability[index]
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