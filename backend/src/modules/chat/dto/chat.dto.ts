// send-message.dto.ts
export class SendMessageDto {
    chatId: string;
    content: string;
  }
  
  // create-chat.dto.ts
  export class CreatePrivateChatDto {
    destinationId: string;
  }
  
  // edit-message.dto.ts
  export class EditMessageDto {
    content: string;
  }