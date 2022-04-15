import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LocalAuthGuard } from '../auth/guard/local-auth.guard';
import { NotLoggedInGuard } from '../../common/guards/not-logged-in.guard';
import { LoggedInGuard } from '../../common/guards/logged-in.guard';
import { User } from '../../common/decorators/user.decorator';
import { UsersService } from './users.service';
import { Users } from './entities/users.entity';
import { NoPasswordUserDto } from './dto/no-password-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('USERS')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '내 정보 가져오기' })
  @ApiOkResponse({
    description: '성공',
    type: NoPasswordUserDto,
  })
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getProfile(@User() user: Users) {
    return user;
  }

  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ description: '로그인', type: NoPasswordUserDto })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@User() user: Users, @Body() data: LoginUserDto) {
    return user;
  }

  @ApiOperation({ summary: '회원가입' })
  @UseGuards(NotLoggedInGuard)
  @ApiCreatedResponse({ description: '회원가입', type: NoPasswordUserDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async join(@Body() data: SignupUserDto) {
    const user = this.usersService.findByEmail(data.email);
    if (!user) {
      throw new NotFoundException();
    }
    const result = await this.usersService.join(
      data.email,
      data.name,
      data.password,
    );
    const { password, ...userWithoutPassword } = result;
    if (result) {
      return userWithoutPassword;
    } else {
      throw new ForbiddenException();
    }
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({ description: '로그아웃' })
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Response() res) {
    res.clearCookie('connect.sid', { httpOnly: true });
    return res.send('ok');
  }
}
