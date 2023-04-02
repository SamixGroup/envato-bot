import { Bot, InlineKeyboard, session } from 'grammy'
import fs from 'fs'
import { MyContext, FileInfo, ContextData } from './types'
import { saveUser, onlyAdmin } from './middleware'
import { saveFile, saveVideo } from './handlers'


const admin = process.env.ADMIN as unknown as number

function initial() {
    return {
        state: ""
    } as ContextData
}


const bot = new Bot<MyContext>(process.env.TOKEN as string);

bot.use(session({ initial }))
bot.use(saveUser)


bot.on(':document', onlyAdmin, saveFile);
bot.on(':video', onlyAdmin, saveVideo);

// Запуск бота
bot.command('start', async (ctx) => {
    ctx.session.state = ''
    let inlineKeyboard = new InlineKeyboard()

    ctx.reply("Assalomu alaykum. Bu bot Envato va Freepik saytlaridan premium materiallarni yarim avtomat rejimda yuklab olish uchun chiqarilgan. Yuklashga ariza yuborish uchun ⬇️ Yuklash ⬇️ tugmasini bosing",
        {
            reply_markup: inlineKeyboard.text('⬇️ Yuklash ⬇️', `download`)
        })
})

bot.callbackQuery('download', async (ctx: MyContext) => {
    ctx.reply("Yuklab olmoqchi bo'lgan materialingiz linkini yuboring: ")
    ctx.session.state = "link"
})

bot.hears(/http|https/, async (ctx: MyContext) => {
    let inlineKeyboard = new InlineKeyboard()

    if (ctx.session.state !== 'link') return ctx.reply("Agar fayl yuklamoqchi bo'lsangiz Yuklash tugmasini bosing", {
        reply_markup: inlineKeyboard.text('⬇️ Yuklash ⬇️', `download`)
    }).catch(() => { })
    const from = ctx.from
    fs.readFile('./data.json', (err, data) => {
        if (err) return ctx.reply(`Something went wrong ${err}`)
        const fileData = JSON.parse(data.toString()) as FileInfo
        if (fileData[ctx.message?.text + '']) ctx.replyWithDocument(fileData[ctx.message?.text + ''])
        else {
            ctx.reply("Siz yuborgan link bo'yicha yuklangan material topilmadi. Biz uni ruchnoy yuklashimiz bilan uni sizga yuboramiz. Iltimos kuting")
            ctx.api.sendMessage(
                admin,
                `❗️Yangi zakaz\nLink: ${ctx.message?.text}\nFoydalanuvchi: ${from?.first_name}\nID: ${from?.id}` + (`\nUsername: @${from?.username}` ?? ''),
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
bot.command('donate', async (ctx) => {
    let donateButton = new InlineKeyboard()

    donateButton.url("Click Up orqali o'tkazish", process.env.CLICK_DONATE as string)
    donateButton.row()
    donateButton.url("PayMe orqali o'tkazish", process.env.PAYME_DONATE as string)
    ctx.reply("Agar bot sizga yoqqan bo'lsa bechora adminni pechenki va coffeesiga donat qiling. Siz ssilka tashaganizda erinmasdan tortib berishi 🥲 va albatta botni davomiy ishlashi uchun 🫶",
        {
            reply_markup: donateButton
        })
})

bot.on(':text', async (ctx) => {
    let inlineKeyboard = new InlineKeyboard()
    ctx.reply("Agar fayl yuklamoqchi bo'lsangiz Yuklash tugmasini bosing", {
        reply_markup: inlineKeyboard.text('⬇️ Yuklash ⬇️', `download`)
    }).catch(() => { })
})




bot.catch(err => {
    console.log(err.message);
})
export default bot
