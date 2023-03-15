
import { Bot, InlineKeyboard, session } from 'grammy'
import fs from 'fs'
import { MyContext, FileInfo, ContextData } from './types'
import { saveUser, onlyAdmin } from './middleware'
import { saveFile } from './handlers'
const inlineKeyboard = new InlineKeyboard()

const admin = process.env.ADMIN as unknown as number

function initial() {
    return {
        state: ""
    } as ContextData
}



const bot = new Bot<MyContext>(process.env.TOKEN as string);

bot.use(session({ initial }))
bot.use(saveUser)


bot.on(':document', saveFile);

// Запуск бота
bot.command('start', async (ctx) => {
    ctx.session.state = ''
    ctx.reply("Assalomu alaykum. Bu bot envatodan premium materiallarni yarim avtomat rejimda yuklab olish uchun chiqarilgan. Yuklashga ariza yuborish uchun /download komandasini yuboring")
})

bot.command('download', async (ctx: MyContext) => {
    ctx.reply("Yuklab olmoqchi bo'lgan materialingiz linkini yuboring: ")
    ctx.session.state = "link"
})

bot.hears(/http|https/, async (ctx: MyContext) => {
    if (ctx.session.state !== 'link') return
    const from = ctx.from
    fs.readFile('./data.json', (err, data) => {
        if (err) return ctx.reply(`Something went wrong ${err}`)
        const fileData = JSON.parse(data.toString()) as FileInfo
        if (fileData[ctx.message?.text + '']) ctx.replyWithDocument(fileData[ctx.message?.text + ''])
        else {
            ctx.reply("Siz yuborgan link bo'yicha yuklangan material topilmadi. Biz uni ruchnoy yuklashimiz bilan uni sizga yuboramiz. Iltimos kuting")
            ctx.api.sendMessage(
                admin,
                `Yangi zayavka\nLink: ${ctx.message?.text}\nFoydalanuvchi: ${from?.first_name}\nID: ${from?.id}` + (`\nUsername: @${from?.username}` ?? ''),
                {
                    reply_markup: inlineKeyboard.text('Yuborish', `send_${from?.id}`)
                }
            )
        }
        ctx.session.state = ''
    })

})


bot.callbackQuery(/send_(.+)/, onlyAdmin, async (ctx) => {
    ctx.session.state = ctx.match[1]
    ctx.reply("Faylni yuboring. Opisaniyada linkni yozishni unutmang!")
    ctx.answerCallbackQuery("")
})


export default bot