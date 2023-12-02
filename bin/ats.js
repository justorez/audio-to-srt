import { program, Option } from 'commander'
import { App } from '../index.js'

const boolstr = () => 'True'

program
    .name('ats')
    .requiredOption('-a, --appid <value>', '应用标识')
    .requiredOption('-t, --token <value>', '鉴权 Token')
    .option('-l, --language <code>', '字幕语言类型', 'zh-CN')
    .option('-w, --words_per_line <number>', '每行最多展示字数', 46)
    .option('-m, --max_lines <number>', '每屏最多展示行数', 1)
    .addOption(
        new Option('-c, --caption_type <type>', '字幕识别类型')
            .choices([ 'auto', 'speech', 'singing'])
            .default('auto')
    )
    .option('-f, --file <path>', '音频文件路径')
    .addOption(
        new Option('-u, --url <link>', '音频链接')
            .conflicts('file')
    )
    .option('--use_itn', '使用数字转换功能', boolstr)
    .option('--use_punc', '增加标点', boolstr)
    .option('--use_ddc', '使用顺滑标注水词', boolstr)
    .option('--with_speaker_info', '返回说话人信息', boolstr)
    .helpOption('-h, --help', '打印帮助信息')
    .version('v0.0.1', '-v, --version', '打印版本号')

program.addHelpText('after', `

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
  
更多信息请查看官网文档：https://www.volcengine.com/docs/6561/80909`);

program.parse(process.argv)

new App(program.opts()).run()
