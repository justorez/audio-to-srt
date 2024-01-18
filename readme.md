# audio-to-srt

<p>
    <a href="https://www.npmjs.com/package/audio-to-srt"><img src="https://badgen.net/npm/v/audio-to-srt"></a>
    <a href="https://github.com/justorez/audio-to-srt/actions/workflows/publish.yml"><img src="https://github.com/justorez/audio-to-srt/actions/workflows/publish.yml/badge.svg"></a>
</p>

🎙通过[火山引擎](https://www.volcengine.com/)服务将本地或在线音频文件转换为 SRT 字幕文件。

## 安装

```bash
pnpm add audio-to-srt -g
```

## 用法

1. 首先去[官网](https://console.volcengine.com/speech/app)搜索`语音技术`，创建应用选择`音视频字幕生成`，第一次开通有 20 小时的免费试用包。
2. 左侧导航进入`音视频字幕生成`，记住自己的 `appid` 和 `token`。
3. 可以将 `appid` 和 `token` 配置到环境变量，`ATS_APPID` 和 `ATS_TOKEN`，就不用每次都通过命令行传入了。
4. 准备好音频文件，程序通过文件后缀名判断类型，所以请规范文件命名。使用 `ffmpeg` 或者格式工厂转换很方便。
    ```bash
    # 以 wav 格式为例：将视频转为 wav
    ffmpeg -i 1.mp4 -f wav -vn -acodec pcm_s16le -ar 16000 -ac 1 1.wav
    ```

使用本地音频文件：

```bash
ats -a your_appid -t your_token -l en-US -f your.wav

正在提交任务...
提交成功，当前任务编号: xxxxxx-xxxx-xxxx-xxxx-xxxxxx
正在查询结果，请耐心等待...
转换完成，已生成字幕文件: your.srt
```

使用在线音频文件：

```bash
ats -a your_appid -t your_token -l en-US -u http://xxx.com/your.wav
```

生成的字幕文件会保存在执行命令的当前目录。

查看帮助信息：

```bash
ats --help

Usage: ats [options]

Options:
  -a, --appid <value>            应用标识 (env: ATS_APPID)
  -t, --token <value>            鉴权 Token (env: ATS_TOKEN)
  -l, --language <code>          字幕语言类型 (default: "zh-CN")
  -w, --words_per_line <number>  每行最多展示字数 (default: 46)
  -m, --max_lines <number>       每屏最多展示行数 (default: 1)
  -c, --caption_type <type>      字幕识别类型 (choices: "auto", "speech", "singing", default: "auto")
  -f, --file <path>              音频文件路径
  -u, --url <link>               音频链接
  --use_itn                      使用数字转换功能
  --use_punc                     增加标点
  --use_ddc                      使用顺滑标注水词
  --with_speaker_info            返回说话人信息
  -v, --version                  打印版本号
  -h, --help                     打印帮助信息

Supported languages:
  +--------------+---------------+----------------+
  | 语言         | Language Code | 分句长度推荐值 |
  +--------------+---------------+----------------+
  | 中文普通话   | zh-CN         | 15             |
  | 粤语         | yue           | 15             |
  | 吴语-上海话  | wuu           | 15             |
  | 闽南语       | nan           | 15             |
  | 西南官话     | xghu          | 15             |
  | 中原官话     | zgyu          | 15             |
  | 维语         | ug            | 55             |
  | 英语（美国） | en-US         | 55             |
  | 日语         | ja-JP         | 32             |
  | 韩语         | ko-KR         | 32             |
  | 西班牙语     | es-MX         | 55             |
  | 俄语         | ru-RU         | 55             |
  | 法语         | fr-FR         | 55             |
  +--------------+---------------+----------------+

更多信息请查看官网文档：https://www.volcengine.com/docs/6561/80909
```