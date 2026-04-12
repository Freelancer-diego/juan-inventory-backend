import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    // cloudinary.config({ cloudinary_url }) no parsea la URL en SDK v2.
    // Hay que extraer cloud_name, api_key y api_secret manualmente.
    // Formato: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const raw = this.configService.getOrThrow<string>('CLOUDINARY_URL');
    const parsed = new URL(raw);
    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: parsed.username,
      api_secret: decodeURIComponent(parsed.password),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se aceptan: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `El archivo supera el tamaño máximo de 5 MB.`,
      );
    }

    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'inventory/products',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new BadRequestException('Error al subir la imagen a Cloudinary.'),
            );
          }
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
