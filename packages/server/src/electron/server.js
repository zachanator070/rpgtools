// Internal Dependencies
const { ipcRenderer } = require("electron");
const _ = require("lodash");
const os = require("os");
const path = require("path");
const child_process = require("child_process");
const {app} = require("@electron/remote");

// Elements ID
const serverLog = document.getElementById("serverLog");
const expressApp = document.getElementById("expressApp");
const loading = document.getElementById("loading");

const node = child_process.fork(
    `${app.getAppPath()}/dist/server/src/index.js`,
    [],
    {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
        execArgv: ["--experimental-specifier-resolution=node"],
        env: {
            SQLITE_DIRECTORY_PATH: process.env.SQLITE_DIRECTORY_PATH || path.join(`${os.homedir()}`, '.rpgtools'),
            UNLOCK_CODE: "unlock_me"
        }
    }
);

/**
 * ==============================
 *      GLOBAL EVENTS
 * ==============================
 */

ipcRenderer.on("stop-server", (event, data) => {
    if(node.kill()) {
        process.exit(1);
    } else {
        process.exit(0);
    }
});

ipcRenderer.on("show-server-log", (event, data) => {
    if (serverLog.style.display === "none") {
        console.log("1");
        serverLog.style.display = "block";
        expressApp.classList.add("expressAppHide");
    } else {
        console.log("2");
        expressApp.classList.remove("expressAppHide");
        serverLog.style.display = "none";
    }
});

/* XXXXXXXXXX END OF GLOBAL EVENTS XXXXXXXXXX */


/**
 * ========================================
 *              FUNCTIONS
 * ========================================
 */

function strip(s) {
    // regex from: http://stackoverflow.com/a/29497680/170217
    // REGEX to Remove all ANSI colors/styles from strings
    return s.replace(
        // eslint-disable-next-line no-control-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
    );
}

function redirectOutput(x) {
    let lineBuffer = "";
    x.on("data", function (data) {
        loading.style.display = "none";
        serverLog.style.display = "block";
        lineBuffer += data.toString();

        let lines = lineBuffer.split("\n");
        _.forEach(lines, (l) => {
            if (l !== "") {
                let infoSpan = document.createElement("span");
                infoSpan.textContent = strip(l);
                serverLog.append(infoSpan);
                serverLog.append(document.createElement("br"));
            }
        });
        lineBuffer = lines[lines.length - 1];
    });
}

/* XXXXXXXXXX END OF FUNCTIONS XXXXXXXXXXX */

redirectOutput(node.stdout);
redirectOutput(node.stderr);
