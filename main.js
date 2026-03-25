const { app, BrowserWindow, shell } = require("electron");
const fs = require("fs");
const path = require("path");

let win;

function getSuporteIconDataUrl() {
  try {
    const iconPath = path.join(__dirname, "suporte.png");
    const iconBuffer = fs.readFileSync(iconPath);
    return `data:image/png;base64,${iconBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Erro ao carregar suporte.png:", error);
    return "";
  }
}

function criarJanela() {
  const suporteIconDataUrl = getSuporteIconDataUrl();

  win = new BrowserWindow({
    width: 900,
    height: 500,
    resizable: true,
    maximizable: true,
    fullscreenable: true,
    autoHideMenuBar: true,
    title: "Uniplus - Acesso",
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false
    }
  });

  win.loadFile("index.html");

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes("wa.me")) {
      shell.openExternal(url);
      return { action: "deny" };
    }

    win.loadURL(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    const currentUrl = win.webContents.getURL();

    if (url !== currentUrl) {
      event.preventDefault();

      if (url.includes("wa.me")) {
        shell.openExternal(url);
      } else {
        win.loadURL(url);
      }
    }
  });

  win.webContents.on("did-finish-load", async () => {
    const currentUrl = win.webContents.getURL();

    const isTelaInicial =
      currentUrl.startsWith("file://") || currentUrl.endsWith("/index.html");

    if (isTelaInicial) {
      return;
    }

    try {
      await win.webContents.executeJavaScript(`
        (() => {
          if (document.getElementById("fab-ajuda-uniplus")) return;

          const suporteIconDataUrl = ${JSON.stringify(suporteIconDataUrl)};

          const style = document.createElement("style");
          style.id = "fab-ajuda-uniplus-style";
          style.textContent = \`
            #fab-ajuda-uniplus {
              position: fixed;
              right: 18px;
              bottom: 18px;
              z-index: 999999;
              font-family: Arial, sans-serif;
            }

            #fab-ajuda-uniplus .fab-menu {
              display: flex;
              flex-direction: column;
              gap: 10px;
              margin-bottom: 10px;
              opacity: 0;
              pointer-events: none;
              transform: translateY(10px);
              transition: .25s;
              align-items: center;
            }

            #fab-ajuda-uniplus .fab-menu.open {
              opacity: 1;
              pointer-events: auto;
              transform: translateY(0);
            }

            #fab-ajuda-uniplus .fab-main {
              width: 46px;
              height: 46px;
              border-radius: 50%;
              border: none;
              background: #c53030;
              color: white;
              font-size: 24px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 6px 14px rgba(0,0,0,0.25);
            }

            #fab-ajuda-uniplus .fab-item {
              width: 46px;
              height: 46px;
              border-radius: 50%;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 6px 14px rgba(0,0,0,0.20);
              padding: 0;
            }

            #fab-ajuda-uniplus .fab-suporte {
              background: #ffffff;
            }

            #fab-ajuda-uniplus .fab-whatsapp {
              background: #22c55e;
            }

            #fab-ajuda-uniplus .fab-whatsapp svg {
              width: 22px;
              height: 22px;
              fill: white;
              display: block;
            }

            #fab-ajuda-uniplus .fab-suporte img {
              width: 24px;
              height: 24px;
              object-fit: contain;
              display: block;
            }
          \`;
          document.head.appendChild(style);

          const fab = document.createElement("div");
          fab.id = "fab-ajuda-uniplus";
          fab.innerHTML = \`
            <div class="fab-menu" id="fab-ajuda-menu">
              <button class="fab-item fab-suporte" id="fab-suporte-btn" title="Acesso Remoto">
                <img src="\${suporteIconDataUrl}" alt="Suporte">
              </button>

              <button class="fab-item fab-whatsapp" id="fab-whatsapp-btn" title="WhatsApp">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 3.5A11.8 11.8 0 0 0 12 .5a11.5 11.5 0 0 0-9.9 17.3L.5 23.5l5.9-1.5A11.5 11.5 0 1 0 20 3.5zM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-3.5.9.9-3.4-.2-.3A9 9 0 1 1 12 21zm4.9-6.7c-.3-.2-1.8-.9-2-.9s-.4-.2-.6.2-.7.9-.9 1.1-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.4-.5.2-.4c.1-.2 0-.4 0-.5l-.6-1.6c-.2-.4-.3-.3-.5-.3h-.4a.8.8 0 0 0-.6.3 2.5 2.5 0 0 0-.8 1.9 4.4 4.4 0 0 0 .9 2.4 10.2 10.2 0 0 0 3.9 3.4c.5.2 1 .3 1.3.4a3 3 0 0 0 1.4.1c.4-.1 1.3-.5 1.5-1 .2-.4.2-.9.1-1-.1-.1-.3-.2-.6-.4z"/>
                </svg>
              </button>
            </div>

            <button class="fab-main" id="fab-ajuda-main" title="Ajuda">?</button>
          \`;

          document.body.appendChild(fab);

          const menu = document.getElementById("fab-ajuda-menu");
          const mainBtn = document.getElementById("fab-ajuda-main");
          const suporteBtn = document.getElementById("fab-suporte-btn");
          const whatsappBtn = document.getElementById("fab-whatsapp-btn");

          mainBtn.addEventListener("click", () => {
            menu.classList.toggle("open");
          });

          suporteBtn.addEventListener("click", () => {
            window.open("https://www.boldtsoft.com.br/acessoremoto/BoldTSofT_Sistemas.exe", "_blank");
          });

          whatsappBtn.addEventListener("click", () => {
            window.open("https://wa.me/5527998051338?text=Olá%20preciso%20de%20suporte%20no%20Uniplus", "_blank");
          });

          document.addEventListener("click", (event) => {
            if (!fab.contains(event.target)) {
              menu.classList.remove("open");
            }
          });
        })();
      `);
    } catch (error) {
      console.error("Erro ao injetar FAB de ajuda:", error);
    }
  });
}

app.whenReady().then(() => {
  criarJanela();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      criarJanela();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});