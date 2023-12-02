import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { omit } from 'lodash-es'

export class App {
    constructor(opts) {
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
            console.log(`任务提交失败：[${res.code}] ${res.message}`)
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
