const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async (event) => {
  const tag = event.queryStringParameters.tag || 'historietas';

  try {
    // Usamos el método más directo de Cloudinary para traer por tag
    const result = await cloudinary.api.resources_by_tag(tag, {
      context: true,
      max_results: 50
    });

    const images = result.resources.map(res => ({
      url: res.secure_url,
      // Intentamos sacar el título del contexto, si no ponemos uno por defecto
      titulo: (res.context && res.context.caption) ? res.context.caption : "Obra Artística"
    }));

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify(images),
    };
  } catch (error) {
    console.error("Error en la función:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Fallo en Cloudinary", detalle: error.message }),
    };
  }
};