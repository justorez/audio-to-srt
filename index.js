import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { program, Option } from 'commander'
import { omit } from 'lodash-es'

const boolstr = () => 'True'

program
    .name('audio2srt')
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
    .version('v0.0.2', '-v, --version', '打印版本号')

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

class App {
    constructor() {
        let opts = program.opts()
        this.service = axios.create({
            baseURL: 'https://openspeech.bytedance.com/api/v1/vc',
            headers: {
                Accept: '*/*',
                Connection: 'keep-alive',
                Authorization: `Bearer; ${opts.token}`
            },
            maxBodyLength: 1024 * 1024 * 1024,
            maxContentLength: 1024 * 1024 * 1024
        })
        this.service.interceptors.response.use(
            (response) => response.data,
            (error) => {
                return error.response.data || {}
            }
        )
        this.options = omit(opts, 'token')
    }

    async run() {
        const { file, url } = this.options

        if (!file && !url) {
            throw new Error('Option -f, --file or -u, --url not specified')
        }

        console.log('正在提交任务...')

        const audio = file ? fs.readFileSync(file) : url
        const res = await this.submit(audio)
        if (res.code == '0') {
            console.log('提交成功，当前任务 ID：', res.id)
            console.log('正在查询结果，请耐心等待...')
            const json = await this.query(res.id)
            const srt = jsonToSrt(json)
            const srtFile = file
                ? `${path.parse(file).name}.srt`
                : `${Date.now()}.srt`
            fs.writeFileSync(srtFile, srt, 'utf8')
            console.log('转换完成，已生成字幕文件：', srtFile)
        } else {
            console.log(`提交失败：[${res.code}] ${res.message}`)
        }
    }

    submit(value) {
        const isFile = Buffer.isBuffer(value)
        const data = isFile ? value : { url: value }
        const contentType = isFile ? 'audio/wav' : 'application/json'
        return this.service.post('/submit', data, {
            params: omit(this.options, 'file', 'url'),
            headers: {
                'Content-Type': contentType
            }
        })
    }
    
    query(submitId) {
        return this.service.get('/query', {
            params: {
                appid: this.options.appid,
                id: submitId
            }
        })
    }
}

const app = new App()
app.run()

export function jsonToSrt({ utterances }) {
    let srt = ''
    const tt = (time) => { // timestamp
        const ms = time % 1000
        const t = Math.floor(time / 1000)
        const h = Math.floor(t / 60 / 60)
        const m = Math.floor(t / 60) % 60
        const s = t % 60
        return String(h).padStart(2, 0) + ':' + 
            String(m).padStart(2, 0) + ':' + 
            String(s).padStart(2, 0) + ',' + 
            String(ms).padStart(3, 0)
    }
    utterances.forEach((item, i) => {
        srt += `${i+1}\n` + 
            `${tt(item.start_time)} --> ${tt(item.end_time)}\n` + 
            `${item.text}\n\n`
    })
    return srt
}
