import { FileInfo, MyContext } from "../types";
import fs from 'fs'
const backupChannel = process.env.CHANNEL as unknown as number



export default async (ctx: MyContext) => {
    let fileId = ''
    if (ctx.message && ctx.message.video)
        fileId = ctx.message.video.file_id;
    else return ctx.reply("You must send video!")
    const link = ctx.message?.caption ?? ''
    if (ctx.session.state?.match(/\d+/))
        ctx.api.sendVideo(`${ctx.session.state}`, fileId, {
            caption: `Sizning buyurtmangiz: ${link} \nBot sizga yoqqan bo'lsa, uni davomiy ishlashi uchun o'z hissangizni /donate orqali qo'shishiz mumkin 🥹`
        })

    fs.readFile('./data.json', (err, data: any) => {
        const parsedData = JSON.parse(data.toString()) as FileInfo
        if (parsedData[link]) ctx.reply("Ushbu fayl oldin ham saqlangan")
        else {
            parsedData[link] = fileId
            fs.writeFileSync('./data.json', JSON.stringify(parsedData))
            ctx.reply(`'${link}' bazaga qo'shildi!`);
            ctx.api.sendDocument(`${backupChannel}`, fileId, { caption: link })

        }
    })
}
