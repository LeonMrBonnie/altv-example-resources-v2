import * as alt from "@altv/server"

const commandHandlers = new Map();
const mutedPlayers = new Set();

// *** Exports

/**
 * @param {string} cmd 
 * @param {() => void} callback 
 */
export function registerCmd(cmd, callback) {
    alt.Utils.assert(typeof cmd === "string", `Command ${cmd} is not a string`);
    alt.Utils.assert(typeof callback === "function", `Callback for command ${cmd} is not a function`);

    cmd = cmd.toLowerCase();
    alt.Utils.assert(!commandHandlers.has(cmd), `Command ${cmd} already registered`);

    commandHandlers.set(cmd, callback);
}

/**
 * @param {alt.Player} player 
 * @param {boolean} state 
 */
export function mutePlayer(player, state) {
    if(state) mutedPlayers.add(player);
    else mutedPlayers.delete(player);
}

/**
 * @param {alt.Player} player 
 * @param {string} msg 
 */
export function send(player, msg) {
    if(!player || !player.valid) return;
    player.emit("chat:message", null, msg);
}

/**
 * @param {string} msg 
 */
export function broadcast(msg) {
    alt.Events.emitAllPlayers("chat:message", null, msg);
}

// *** Events

function invokeCmd(player, cmd, args) {
    cmd = cmd.toLowerCase();
    const handler = commandHandlers.get(cmd);
    if(!handler) return send(player, `{FF0000}Unknown command /${cmd}`);
    handler(player, args);
}

function sanitizeMsg(msg) {
    return msg.replace(/</g, "&lt;").replace(/'/g, "&#39").replace(/"/g, "&#34");
}

alt.Events.onPlayer("chat:message", ({ player, args: [ msg ] }) => {
    alt.Utils.assert(typeof msg === "string", `Message is not a string`);
    msg = msg.trim();
    if(msg.length === 0) return;

    if(msg[0] === "/") {
        const commandMsg = msg.slice(1);
        if(commandMsg.length === 0) return;

        const args = commandMsg.split(" ");
        const cmd = args.shift();
        invokeCmd(player, cmd, args);
        alt.log(`[chat:cmd] ${player.name}: /${commandMsg}`);
    }
    else {
        if(mutedPlayers.has(player)) return send(player, `{FF0000}You are currently muted.`);

        alt.Events.emitAllPlayers("chat:message", player.name, sanitizeMsg(msg));
        alt.log(`[chat:msg] ${player.name}: ${msg}`);
    }
});
