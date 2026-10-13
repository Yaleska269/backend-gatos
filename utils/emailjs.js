
import emailjs from "@emailjs/nodejs";

export const enviarListadoGatos = async (gatos) => {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    // Comprobar que las variables estén configuradas
    if (!serviceId || !templateId || !publicKey || !privateKey) {
        throw new Error(
            "Faltan variables de entorno de EmailJS en la configuración del backend."
        );
    }

    const message = gatos
        .map(
            (g, i) =>
                `${i + 1}. ${g.nombre} | Edad: ${g.edad} años | Peso: ${g.peso} kg | Raza: ${g.raza} | ID: ${g.id}`
        )
        .join("\n");

    const templateParams = {
        total: gatos.length,
        message: message || "No hay gatos registrados.",
        fecha: new Date().toLocaleString("es-NI"),
    };

    try {
        const response = await emailjs.send(
            serviceId,
            templateId,
            templateParams,
            {
                publicKey,
                privateKey,
            }
        );

        console.log("Email enviado con éxito:", response.status, response.text);

        return response;
    } catch (error) {
        console.error("Error al enviar email con EmailJS:", error);
        throw error;
    }
};
