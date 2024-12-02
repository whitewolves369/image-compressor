# Image Compressor

一个基于浏览器的图片批量压缩工具，使用纯前端技术实现，无需后端服务器。

## 功能特点

- 支持批量上传图片（PNG、JPG 格式）
- 支持拖放上传
- 实时预览压缩前后的效果
- 可调节压缩质量
- 显示压缩前后文件大小
- 支持批量下载压缩后的图片
- 纯浏览器端处理，保护隐私

## 技术栈

- HTML5
- CSS3 (Grid Layout)
- Vanilla JavaScript
- Canvas API
- File API

## 使用方法

1. 打开网页
2. 点击上传区域或将图片拖放到上传区域
3. 选择一张或多张图片
4. 调节压缩质量（可选）
5. 点击"压缩所有图片"按钮
6. 等待压缩完成
7. 点击"下载所有图片"获取压缩后的图片

## 本地运行

1. 克隆仓库：
```bash
git clone https://github.com/[你的用户名]/image-compressor.git
```

2. 进入项目目录：
```bash
cd image-compressor
```

3. 使用任意 Web 服务器运行，例如：
```bash
# 使用 Python 3
python -m http.server

# 或使用 Node.js 的 http-server
npx http-server
```

4. 在浏览器中访问 `http://localhost:8000`

## 浏览器兼容性

需要现代浏览器支持以下特性：
- FileReader API
- Canvas API
- ES6+ JavaScript
- CSS Grid Layout

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License