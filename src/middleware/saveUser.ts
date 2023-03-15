import * as fs from 'fs';
import { MyContext } from '../types/MyContext';


const jsonFilePath = 'data.json';

async function addUserMiddleware(ctx: MyContext, next: CallableFunction) {
    const json = loadJsonFromFile();
    const userId = ctx.from?.id ?? 1;
    if (!hasUserId(json.users, userId)) {
        json.users.push(userId);
        saveJsonToFile(json);
    }
    await next();
}

function loadJsonFromFile() {
    const jsonString = fs.readFileSync(jsonFilePath, 'utf-8');
    return JSON.parse(jsonString);
}

function saveJsonToFile(json: Array<number>) {
    const jsonString = JSON.stringify(json);
    fs.writeFileSync(jsonFilePath, jsonString, 'utf-8');
}

function hasUserId(json: Array<number>, userId: number): boolean {

    return typeof json.find((n) => n === userId) === "number";
}

export default addUserMiddleware