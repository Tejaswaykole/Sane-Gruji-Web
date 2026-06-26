import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { 
        role: { include: { permissions: { include: { permission: true } } } },
        teacherProfile: true 
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role.name,
      permissions: user.role.permissions.map(rp => rp.permission.name)
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, { 
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh',
        expiresIn: '7d' 
      }),
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role.name,
        teacherProfile: user.teacherProfile
      }
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh'
      });
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { 
          role: { include: { permissions: { include: { permission: true } } } },
          teacherProfile: true 
        }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException();
      }

      const newPayload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role.name,
        permissions: user.role.permissions.map(rp => rp.permission.name)
      };

      return {
        access_token: await this.jwtService.signAsync(newPayload),
      };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
