import {
  BadGatewayException,
  BadRequestException,
  Controller,
  Post,
  Req,
  ServiceUnavailableException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Request } from 'express';
import { AuthGuard, Roles } from '../auth/auth.guard.js';

export const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_BYTES = 5 * 1024 * 1024;

/** Xác định loại ảnh theo magic bytes, không tin MIME do client gửi. */
function sniffExtension(b: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (
    b.length > 8 &&
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return 'png';
  if (b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP')
    return 'webp';
  return null;
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/** CLOUDINARY_URL có dạng cloudinary://<api_key>:<api_secret>@<cloud_name>. */
function parseCloudinaryUrl(raw?: string): CloudinaryConfig | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^["']|["']$/g, '');
  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'cloudinary:') return null;
    const cloudName = u.hostname;
    const apiKey = decodeURIComponent(u.username);
    const apiSecret = decodeURIComponent(u.password);
    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}

function cloudinaryFromEnv(): CloudinaryConfig | null {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  if (fromUrl) return fromUrl;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  return null;
}

async function uploadToCloudinary(c: CloudinaryConfig, buffer: Buffer): Promise<string> {
  const folder = 'tennis';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${c.apiSecret}`)
    .digest('hex');

  const body = new FormData();
  body.set('file', new Blob([new Uint8Array(buffer)]));
  body.set('api_key', c.apiKey);
  body.set('timestamp', timestamp);
  body.set('folder', folder);
  body.set('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloudName}/image/upload`, {
    method: 'POST',
    body,
  });
  const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !data.secure_url) {
    throw new BadGatewayException(data.error?.message ?? 'Không thể tải ảnh lên Cloudinary');
  }
  return data.secure_url;
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('ADMIN')
@Controller('admin/uploads')
export class UploadsController {
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_BYTES, files: 1 } }),
  )
  async upload(@UploadedFile() file: { buffer?: Buffer } | undefined, @Req() req: Request) {
    if (!file?.buffer?.length) throw new BadRequestException('Thiếu file ảnh (field "file")');
    const buffer = Buffer.from(file.buffer);
    const ext = sniffExtension(buffer);
    if (!ext) throw new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP');

    const cloud = cloudinaryFromEnv();
    if (cloud) return { url: await uploadToCloudinary(cloud, buffer) };
    if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException(
        'Chưa cấu hình Cloudinary trên Render. Đặt CLOUDINARY_URL hoặc CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET.',
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await writeFile(join(UPLOAD_DIR, name), buffer);

    const base = process.env.PUBLIC_API_URL ?? `${req.protocol}://${req.get('host')}`;
    return { url: `${base}/uploads/${name}` };
  }
}
