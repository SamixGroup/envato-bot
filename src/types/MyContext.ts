import { Context, SessionFlavor } from "grammy";

export type ContextData = {
    state: string | undefined
}
export type MyContext = SessionFlavor<ContextData> & Context;


