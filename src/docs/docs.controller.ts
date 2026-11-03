import { BadRequestException, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocsService } from './docs.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { authMidd } from '../common/auth.guard.js';
import { ApiKeyGuard } from '../common/apiKey.guard.js';

@Controller('docs')
@UseGuards(authMidd,ApiKeyGuard)
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file',{
      storage: diskStorage({
        destination:'./uploads',
        filename: (req,file,callback)=>{
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      })
    })
  )
  uploadDocs(@UploadedFile(
      new ParseFilePipe({
        validators: [
          // new FileTypeValidator({ 
          //     fileType: /(application\/pdf|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|text\/plain|text\/markdown|text\/x-markdown)/,
          // }),
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB limit
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request & {user:any, apiKey:string}
){
  console.log('--- DEBUG FILE UPLOAD ---');
  console.log('File Object:', file);
  const tenantId = req.user.tenantId;
  const apiKey = req.apiKey;

  if (!tenantId) {
    throw new BadRequestException('Authenticated user payload does not contain a tenant ID');
  }
  
  return this.docsService.uploadDocs(file,tenantId,apiKey);
}  
}