import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name);
  private pusher: Pusher | null = null;

  constructor(private configService: ConfigService) {
    const appId = this.configService.get<string>('PUSHER_APP_ID');
    const key = this.configService.get<string>('PUSHER_KEY');
    const secret = this.configService.get<string>('PUSHER_SECRET');
    const cluster = this.configService.get<string>('PUSHER_CLUSTER');

    if (appId && key && secret && cluster) {
      this.pusher = new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      });
      this.logger.log('Pusher initialized successfully');
    } else {
      this.logger.warn('Pusher not configured - real-time features disabled');
    }
  }

  /**
   * Trigger an event on a channel
   */
  async trigger(channel: string, event: string, data: any): Promise<void> {
    if (!this.pusher) {
      this.logger.warn('Pusher not configured, skipping event trigger');
      return;
    }

    try {
      await this.pusher.trigger(channel, event, data);
      this.logger.debug(`Triggered event "${event}" on channel "${channel}"`);
    } catch (error) {
      this.logger.error(`Failed to trigger Pusher event: ${error.message}`);
    }
  }

  /**
   * Trigger an event on multiple channels
   */
  async triggerBatch(
    events: Array<{ channel: string; name: string; data: any }>,
  ): Promise<void> {
    if (!this.pusher) {
      this.logger.warn('Pusher not configured, skipping batch trigger');
      return;
    }

    try {
      await this.pusher.triggerBatch(events);
      this.logger.debug(`Triggered batch of ${events.length} events`);
    } catch (error) {
      this.logger.error(`Failed to trigger Pusher batch: ${error.message}`);
    }
  }

  /**
   * Send a new message notification to conversation members
   */
  async sendMessageNotification(
    conversationId: string,
    message: {
      id: string;
      content: string;
      type: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      createdAt: Date;
    },
  ): Promise<void> {
    await this.trigger(`conversation-${conversationId}`, 'new-message', message);
  }

  /**
   * Notify about conversation updates (new member, member left, etc.)
   */
  async sendConversationUpdate(
    conversationId: string,
    event: string,
    data: any,
  ): Promise<void> {
    await this.trigger(`conversation-${conversationId}`, event, data);
  }

  /**
   * Send notification to a specific user
   */
  async sendUserNotification(userId: string, event: string, data: any): Promise<void> {
    await this.trigger(`user-${userId}`, event, data);
  }
}

