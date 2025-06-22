import { Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import VideoConvertorService from './vodeo.convertor.service';
import PrismaService from 'src/core/database/prisma.service';
import { UpdateVideoDto } from './dto/upload-video.dto';
@Injectable()
export class VideoService {
  constructor(
    private videoConvertorService: VideoConvertorService,
    private db: PrismaService
  ) {}
  async uploadVideo(file: Express.Multer.File) {
    const fileName = file.filename;
    const videoPath = path.join(process.cwd(), 'uploads', fileName);

    const resolution: any =
      await this.videoConvertorService.getVideoResolution(videoPath);

    const resolutions = [
      { height: 240 },
      { height: 360 },
      { height: 480 },
      { height: 720 },
      { height: 1080 },
    ];

    const validResolutions = resolutions.filter(
      (r) => r.height <= resolution.height + 6,
    );

    if (validResolutions.length > 0) {
      const outputDir = path.join(
        process.cwd(),
        'uploads',
        'videos',
        fileName.split('.')[0],
      );

      fs.mkdir(outputDir, { recursive: true }, (err) => {
        if (err) throw new InternalServerErrorException(err);
      });

      await Promise.all(
        this.videoConvertorService.convertToResolutions(
          videoPath,
          outputDir,
          validResolutions,
        ),
      );

      fs.unlinkSync(videoPath);
      const savedVideo = await this.db.prisma.video.create({
        data: {
          title: fileName,
          videoUrl: outputDir,
          duration: resolution.duration || 0,
          authorId: 'some-user-id',
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          category: "General"
        },
      });

      return {
        message: 'Video uploaded and saved successfully',
        video: savedVideo,
      };
    } else {
      console.log('Video juda past sifatli, convert qilish kerak emas.');
      throw new InternalServerErrorException('Low quality video');
    }
  }
  
  async watchVideo(id: string, quality: string, range: string, res: Response) {
    const fileName = id;
    const baseQuality = `${quality}.mp4`;
    const basePath = path.join(process.cwd(), 'uploads', 'videos');
    const readDir = fs.readdirSync(basePath);
    const videoActivePath = path.join(basePath, fileName, baseQuality);
    if (!readDir.includes(fileName))
      throw new NotFoundException('video not found');
    const innerVideoDir = fs.readdirSync(path.join(basePath, fileName));
    if (!innerVideoDir.includes(baseQuality))
      throw new NotFoundException('video quality not found');
    const { size } = fs.statSync(videoActivePath);
    if (!range) {
      range = `bytes=0-1048575`;
    }

    const { start, end, chunkSize } = this.videoConvertorService.getChunkProps(
      range,
      size,
    );
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });
    const videoStream = fs.createReadStream(videoActivePath, {
      start,
      end,
    });
    let bytes = 0;
    videoStream.on('data', (data) => {
      bytes += data.length / 1024;
    });
    videoStream.on('end', () => {
      console.log(bytes);
    });
    videoStream.on('error', (err) => {
      console.log(err);
    });
    videoStream.pipe(res);
  }
  async getVideoStatus(videoId: string) {
    const video = await this.db.prisma.video.findUnique({
      where: { id: videoId },
    });
  
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const outputDir = path.join(process.cwd(), 'uploads', 'videos', videoId);
    let availableQualities: string[] = [];
  
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      availableQualities = files
        .filter((f) => f.endsWith('.mp4'))
        .map((f) => f.replace('.mp4', 'p'));
    }
  
    const totalQualities = [240, 360, 480, 720, 1080];
    const doneCount = availableQualities.length;
    const processingProgress = Math.floor((doneCount / totalQualities.length) * 100);

    const estimatedTimeRemaining =
      processingProgress === 100 ? '0 minutes' : `${2 * (5 - doneCount)} minutes`;
  
    return {
      success: true,
      data: {
        id: videoId,
        status: video.status,
        processingProgress,
        availableQualities,
        estimatedTimeRemaining,
      },
    };
  }

  async getVideoById(id: string) {
    const video = await this.db.prisma.video.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            subscribers: true,
          },
        },
        comments: true,
        likes: true,
      },
    });
  
    if (!video) throw new NotFoundException('Video not found');

    const videoDir = path.join(process.cwd(), 'uploads', 'videos', video.id);
    let availableQualities: string[] = [];
  
    if (fs.existsSync(videoDir)) {
      const files = fs.readdirSync(videoDir);
      availableQualities = files
        .filter((f) => f.endsWith('.mp4'))
        .map((f) => f.replace('.mp4', 'p'));
    }
  
    const author = video.author;
    const subscribersCount = author.subscribers.length;
  
    return {
      success: true,
      data: {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail || null,
        videoUrl: video.videoUrl,
        availableQualities,
        duration: video.duration,
        viewsCount: Number(video.viewsCount),
        likesCount: video.likes.filter((l) => l.type === 'LIKE').length,
        dislikesCount: video.likes.filter((l) => l.type === 'DISLIKE').length,
        commentsCount: video.comments.length,
        publishedAt: video.createdAt.toISOString(),
        author: {
          id: author.id,
          username: author.username,
          channelName: `${author.firstName} ${author.lastName}`,
          avatar: author.avatar || null,
          subscribersCount,
          isVerified: true,
        },
        tags: [],
        category: video.category || 'Uncategorized',
      },
    };
  }

  async updateVideo(id: string, dto: UpdateVideoDto) {
    const existingVideo = await this.db.prisma.video.findUnique({
      where: { id },
    });
  
    if (!existingVideo) {
      throw new NotFoundException('Video not found');
    }
  
    const updatedVideo = await this.db.prisma.video.update({
      where: { id },
      data: dto,
    });
  
    return {
      message: 'Video updated successfully',
      video: updatedVideo,
    };
  }
  async deleteVideo(id: string) {
    const video = await this.db.prisma.video.findUnique({
      where: { id },
    });
  
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const videoDir = path.join(process.cwd(), 'uploads', 'videos', id);
    if (fs.existsSync(videoDir)) {
      fs.rmSync(videoDir, { recursive: true, force: true });
    }
    
    await this.db.prisma.video.delete({
      where: { id },
    });
  
    return {
      message: 'Video deleted successfully',
    };
  }
}