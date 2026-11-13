import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
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

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('ADMIN')
@Controller('admin/uploads')
export class UploadsController {
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_BYTES, files: 1 } }))
  async upload(@UploadedFile() file: { buffer: Buffer } | undefined, @Req() req: Request) {
    if (!file) throw new BadRequestException('Thiếu file ảnh (field "file")');
    const ext = sniffExtension(file.buffer);
    if (!ext) throw new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP');

    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await writeFile(join(UPLOAD_DIR, name), file.buffer);

    const base = process.env.PUBLIC_API_URL ?? `${req.protocol}://${req.get('host')}`;
    return { url: `${base}/uploads/${name}` };
  }
}
