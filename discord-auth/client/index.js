import * as alt from "@altv/client"
import * as native from "@altv/natives"

// Discord APP ID is a public facing identifier for your application.
// Change this value at any time by making a new Discord Application.
const DISCORD_APP_ID = "1090747667317010532";

async function handleAuthentication() {
    alt.Gxt.add("warning_error", "Login with Discord");
    alt.Gxt.add("warning_text", " Tab Out, and check your Discord Application");
    alt.Gxt.add("warning_text2", "Declining will immediately kick you.");

    const interval = alt.Timers.everyTick(() => {
        native.setWarningMessageWithHeader(
            "warning_error",
            "warning_text",
            0,
            "warning_text2",
            false,
            -1,
            null,
            null,
            true,
            0
        );
    });

    let bearerToken = null;
    try {
        bearerToken = await alt.Discord.requestOAuth2Token(DISCORD_APP_ID);
    } 
    catch (e) { }

    interval.destroy();
    alt.Events.emitServer("server:event:finish:authenticate", bearerToken);
}

alt.Events.onServer("client:event:authenticate", handleAuthentication);
