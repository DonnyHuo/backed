import { Controller, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle follow/unfollow a user' })
  async toggleFollow(
    @CurrentUser() user: { id: string },
    @Param('userId') userId: string,
  ) {
    return this.followsService.toggleFollow(user.id, userId);
  }

  @Get('check/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user is following a user' })
  async checkFollowing(
    @CurrentUser() user: { id: string },
    @Param('userId') userId: string,
  ) {
    const isFollowing = await this.followsService.isFollowing(user.id, userId);
    return { isFollowing };
  }

  @Get('followers/:userId')
  @ApiOperation({ summary: 'Get followers of a user' })
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.followsService.getFollowers(userId, Number(page) || 1, Number(limit) || 20);
  }

  @Get('following/:userId')
  @ApiOperation({ summary: 'Get users that a user is following' })
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.followsService.getFollowing(userId, Number(page) || 1, Number(limit) || 20);
  }

  @Get('my/followers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my followers' })
  async getMyFollowers(
    @CurrentUser() user: { id: string },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.followsService.getFollowers(user.id, Number(page) || 1, Number(limit) || 20);
  }

  @Get('my/following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users I am following' })
  async getMyFollowing(
    @CurrentUser() user: { id: string },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.followsService.getFollowing(user.id, Number(page) || 1, Number(limit) || 20);
  }

  @Get('counts/:userId')
  @ApiOperation({ summary: 'Get follow counts for a user' })
  async getFollowCounts(@Param('userId') userId: string) {
    return this.followsService.getFollowCounts(userId);
  }
}

