const cloudinary = require('cloudinary').v2;

// Netlify tomará estos datos automáticamente de las "Environment Variables" que configures en su panel
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async (event) => {
  // Obtenemos el tag (historietas o dibujos) desde la URL
  const tag = event.queryStringParameters.tag || 'dibujos';
  
  try {
    const { resources } = await cloudinary.search
      .expression(`tags:${tag}`)
      .with_field('context') // Esto es para traer el título
      .sort_by('created_at', 'desc') // Las más nuevas primero
      .execute();

    const images = resources.map(res => ({
      url: res.secure_url,
      titulo: (res.context && res.context.caption) ? res.context.caption : 'Sin título'
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(images)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al conectar con Cloudinary' })
    };
  }
};