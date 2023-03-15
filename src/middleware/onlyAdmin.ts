import { MyContext } from "../types/MyContext";
const admin = process.env.ADMIN as unknown as number


export default async (ctx: MyContext, next: CallableFunction) => {
    if (ctx.from && ctx.from.id == admin)
        await next()
    else if (ctx.from) console.log(ctx.from);

}