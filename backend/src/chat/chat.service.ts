import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  createMessage(data: any) {
    
    return "message"
  }

}
