import * as alt from "@altv/server"

/** @type {{ [id: number]: number }} */
let kickPlayerIn = {};

function handleAuthenticate({ player }) {
    for(const id in kickPlayerIn) {
        if (kickPlayerIn[id] > Date.now()) return;

        const ply = alt.Player.all.find((x) => x.id === parseInt(id));
        if (!ply) {
            delete kickPlayerIn[id];
            return;
        }

        ply.kick("Failed to login");
    }

    kickPlayerIn[player.id] = Date.now() + 60000 * 3;
    player.emit("client:event:authenticate");
}

async function handleFinishAuthenticate({ player, args: [ bearerToken ] }) {
    if (bearerToken === null) return player.kick("Open Discord, and Rejoin the Server");

    /** @type {Response} */
    let request;
    try {
        request = await fetch("https://discordapp.com/api/users/@me", {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${bearerToken}`,
            },
        })
    }
    catch(err) {
        alt.log(err);
        return undefined;
    }

    if (!request || request.status !== 200) {
        player.kick("Open Discord, and Rejoin the Server");
        return;
    }

    /** @type {undefined | { id: string, username: string, discriminator: string, avatar: string, verified: boolean, email: string }} */
    const data = await request.json();
    if (!data) {
        player.kick("Failed to obtain discord name or discriminator.");
        return;
    }

    // Setup General Player Information
    const name = `${data.username}#${data.discriminator}`;
    player.streamSyncedMeta.authenticated = true;
    player.streamSyncedMeta.name = name;
    player.streamSyncedMeta.discord = data.id;
    alt.log(`${name} has authenticated!`);
}

alt.Events.onPlayerConnect(handleAuthenticate);
alt.Events.onPlayer("server:event:finish:authenticate", handleFinishAuthenticate);
