import { BadRequestException, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocsService } from './docs.service.js';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { authMidd, Public } from '../common/auth.guard.js';
import { ApiKeyGuard } from '../common/apiKey.guard.js';
import { FileProcessService } from './file.process.js';

@Controller('docs')
@UseGuards(authMidd,ApiKeyGuard)
export class DocsController {
  constructor(private readonly docsService: DocsService,private readonly test:FileProcessService) {}

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
  
  return this.docsService.uploadDocs(file,tenantId);
}  

@Public()
@Post('extract')
// @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
async uploadFile() {
  // 1. File is already saved to local folder via Multer ({ dest: './uploads' })
  // 2. Extract text from the saved path
  const filepath = 'uploads/file-1793722630894-578316616.docx'; // Example path, replace with actual file path
  // if(!file) {
  //   throw new BadRequestException('No file uploaded');
  // }
  const extractedText = await this.test.extractText(filepath);
  const chunks = await this.test.splitText(extractedText);
  const tenanId = '4d0c33d4-4f92-40e9-8849-cf5f5c41252c';
  const docId = "947a340f-5dcc-4956-b599-c2a7432500a2";
  
  const embedContent = await this.test.genEmbedding(chunks,docId,tenanId);
  // 3. Send extractedText to your chunking/embedding logic next...
  return { message: 'Text extracted successfully', 
    textLength: extractedText.length, textPreview: extractedText.slice(0, 200), chunkCount: chunks.length, chunkPreview: chunks.slice(0, 3) ,embed: embedContent};
}

}