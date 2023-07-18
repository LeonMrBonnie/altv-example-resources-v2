import * as alt from "@altv/client"

const view = alt.WebView.create({ url: "http://resource/client/html/index.html" });
let opened = false;

// *** Exports

/**
 * @param {string} name 
 * @param {string} text 
 */
export function pushMessage(name, text) {
    if (name) view.emit("addMessage", name, text);
    else view.emit("addString", text);
}

/**
 * @param {string} text 
 */
export function pushLine(text) {
    pushMessage(null, text);
}

// *** Events

view.on("chatmessage", (text) => {
    alt.Events.emitServer("chat:message", text);

    opened = false;
    alt.setGameControlsActive(true);
    view.focused = false;
});

alt.Events.onKeyUp(({ key }) => {
    if (!opened && key === 0x54 && alt.areGameControlsActive()) {
        opened = true;
        view.emit("openChat", false);
        alt.setGameControlsActive(false);
        view.focused = true;
    } 
    else if (!opened && key === 0xbf && alt.areGameControlsActive()) {
        opened = true;
        view.emit("openChat", true);
        alt.setGameControlsActive(false);
        view.focused = true;
    } 
    else if (opened && key == 0x1b) {
        opened = false;
        view.emit("closeChat");
        alt.setGameControlsActive(true);
        view.focused = false;
    }
});

alt.Events.onServer("chat:message", ({ args: [ name, text ] }) => {
    pushMessage(name, text);
});

pushLine("<b>alt:V Multiplayer has started</b>");
