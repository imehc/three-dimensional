---
title: 'Nestjs基础介绍与文件说明'
date: '2021-08-07'
tags: ['Nestjs']
draft: false
summary: 'nest入门'
# images: ['/static/images/canada/mountains.jpg', '/static/images/canada/toronto.jpg']
---

### 什么是NestJs

```
NestJS 是一个用于构建高效、可扩展的服务器端应用程序的框架。它基于 TypeScript 构建，并受到 Angular 的启发，提供了一种模块化和装饰器驱动的编程模型。NestJS 结合了面向对象编程 (OOP)、函数式编程 (FP) 和函数式反应编程 (FRP) 的元素，旨在创建稳定且可维护的服务器端应用程序。
```

<!-- truncate -->

### NestJs和Node Js的关系

```
NestJS 是一个基于 Node.js 构建的框架。具体来说，Node.js 提供了运行时环境，而 NestJS 提供了结构和工具。
相当于：vue和js的关系
```

### 安装起步

##### 1.下载Node.js 

```js
网址：https://nodejs.org/zh-cn
查看是否成功：node -v
```

##### 2.安装Nestjs 

```js
pnpm i -g @nestjs/cli
查看是否成功：nest -v
```

##### 3.创建Nestjs项目

```js
cd 到你要存放的文件夹下，默认为桌面
创建名字为project-name的项目
nest new project-name
```

### nestjs目录结构简介

```
src
 ├── app.controller.spec.ts //对于基本控制器的单元测试样例
 ├── app.controller.ts //单个路由的基本控制器示例
 ├── app.module.ts //应用程序的根模块
 ├── app.service.ts //单个方法的基本服务
 └── main.ts //应用程序入口文件。它使用 NestFactory 用来创建 Nest 应用实例
```

#### main.ts 文件讲解

```js
main.ts 包含一个异步函数，它负责引导我们的应用程序
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//bootstrap负责启动 NestJS 应用
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

#### 代码分析

```js
import { NestFactory } from '@nestjs/core';
//NestFactory：这是 NestJS 提供的用于创建应用实例的工厂类。
//它提供了静态方法 create，用于创建 NestJS 应用。
类似于vue中的createApp()
```

```js
import { AppModule } from './app.module';
//AppModule：这是应用的根模块，定义了应用的主要结构和依赖。
```

```js
const app = await NestFactory.create(AppModule);
//1.这里调用了 NestFactory.create 方法，传入 AppModule 作为参数。
//2.NestFactory.create 方法会返回一个 INestApplication 实例，这个实例代表了 NestJS 应用。
//3.AppModule 是应用的根模块，包含了应用的所有模块、控制器和服务。
```

```js
await app.listen(3000)
//app.listen 方法启动 HTTP 服务器，并监听指定的端口（此处为 3000）。
可以进行更改
//当服务器启动后，它将开始接受来自客户端的 HTTP 请求。
```

##### <u>注意：nestjs 内置两套不同的框架，express和Fastify，默认express。</u>

无论使用哪种平台，它都会暴露自己的 API。 它们分别是 `NestExpressApplication` 和 `NestFastifyApplication`。

将类型传递给 NestFactory.create() 函数时，如下例所示，app 对象将具有专用于该特定平台的函数。 但是，请注意，除非您确实要访问底层平台 API，否则无需指定类型。

```js
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

### 运行应用

```js
npm run start
此命令启动 HTTP 服务监听定义在 src/main.ts 文件中定义的端口号。在应用程序运行后, 打开浏览器并访问 http://localhost:3000/

npm run start:dev （推荐使用）
持续监听文件是否有改动，有改动会立马更新页面
```

### 文件说明介绍

#### app.module

```js
import { Module } from '@nestjs/common';
//Module：这是从 @nestjs/common 包中导入的装饰器，用于定义模块。
import { AppController } from './app.controller';
//AppController应用程序的控制器
import { AppService } from './app.service';
// AppService应用程序的服务

//@Module 装饰器用于定义模块
// 装饰器类似于一个方法
@Module({ 
  imports: [], //imports用于导入其他模块。当前示例中没有导入任何模块。
  controllers: [AppController], 
  //controllers：用于注册控制器。控制器负责处理传入的请求并返回响应。
  providers: [AppService],
 //providers：用于处理业务逻辑，并可以注入到控制器或其他服务中
})
export class AppModule {}
```

#### app.controller

##### 这个文件有点类似于路由文件

```js
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
//@Controller()：装饰器定义了一个控制器类。可以在括号内指定路径，例如 @Controller('cats')，那么这个控制器将处理所有以 /cats 开头的请求。
 相当于最外层的路由路径
export class AppController {
  //private:私有修饰符只能在类里面可以访问,
  constructor(private readonly appService: AppService) {}
 
  @Get()
  //@Get()：装饰器将此方法标识为处理 GET 请求的处理器。
  //相当于一打开http://localhost:3000 的时候直接就匹配下面的方法
  相当于最里层的路由
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('name')
  //路由为 name http://localhost:3000/name
  getHello(): string {
    return this.appService.getHello();
  }
}
```

#### 举例说明：@Controller('item')

```js
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('item')
 相当于最外层的路由路径
export class AppController {
  @Get('name')
  //路由为 name http://localhost:3000/name
  getHello(): string {
    return '嘻嘻哈哈'
  }
}
网址输入：http://localhost:3000/item/name 
Controller：相当于第一层过滤
Get()：相当于第二层过滤
```

### app.service文件

方法文件

```js
import { Injectable } from '@nestjs/common';
//Injectable 这个装饰器将 AppService 类标识为一个可以被 NestJS 依赖注入系统管理的服务。这样，NestJS 可以在需要的地方（如控制器中）自动注入这个服务类的实例。
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```



#### nestjs中文网址

```
https://docs.nestjs.cn/10/firststeps
```

##### 
