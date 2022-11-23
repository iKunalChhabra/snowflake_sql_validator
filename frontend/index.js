const api_endpoint = "http://127.0.0.1:5000/";
let sql = "";

const submit = document.getElementById("submit");
const clear = document.getElementById("clear");
const sqlEL = document.getElementById("sql");
const summary = document.querySelector(".summary");
const sqlForm = document.querySelector(".sql-form");
const copyText = document.getElementById("copy-text");

function clearSummary() {
  const summary = document.querySelectorAll(".summary-el");
  summary.forEach((sum) => sum.remove());
}

function clearTooltip() {
  const tooltip = document.querySelectorAll(".tooltip");
  tooltip.forEach((tip) => tip.remove());
}

function clearAppMessage() {
  const appError = document.querySelector(".app-message");
  if (appError) {
    appError.remove();
  }
}

function showAppMessage(message, type) {
  const appMessage = document.createElement("div");
  appMessage.classList.add(`app-${type}`);
  appMessage.classList.add(`app-message`);
  appMessage.textContent = message;
  sqlForm.insertBefore(appMessage, sqlForm.firstChild);
}

copyText.addEventListener("click", (event) => {
  event.preventDefault();
  const text = navigator.clipboard.writeText(
    getRecursiveText(sqlEL, "tooltip")
  );
});

clear.addEventListener("click", () => {
  sqlEL.innerHTML = "";
  clearAppMessage();
  clearSummary();
});

submit.addEventListener("click", function (event) {
  event.preventDefault();
  clearTooltip();
  clearSummary();
  clearAppMessage();
  sql = sqlEL.textContent;

  if (sql === "") {
    showAppMessage("Please enter a SQL statement", "warning");
    return;
  }

  let response = fetch(api_endpoint, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql }),
  });

  response
    .then((res) => {
      res
        .json()
        .then((data) => {
          highlightText(data);
          addSummary(data);
        })
        .catch((err) => {
          console.log(err);
          showAppMessage(
            "Unable to get data from server. Please try again later.",
            "error"
          );
        });
    })
    .catch((err) => {
      console.log(err);
      showAppMessage(
        "Unable to get data from server. Please try again later.",
        "error"
      );
    });
});

function highlightText(data) {
  let text = getRecursiveText(sqlEL);
  let lines = text.split("\n");
  sqlEL.innerHTML = "";
  lines.forEach((line) => {
    let lineEL = document.createElement("p");
    lineEL.textContent = line;
    lineEL.classList.add("line");
    for (let row in data) {
      if (line.includes(data[row].sql)) {
        lineEL.classList.add(data[row].msg_type);
        addTooltip(lineEL, data[row].msg);
      }
    }
    sqlEL.appendChild(lineEL);
    sqlEL.appendChild(document.createElement("br"));
  });

  if (data.length === 0) {
    showAppMessage("Everything looks good", "success");
  }
}

function getRecursiveText(node, ignoreClass = null) {
  if (node.nodeName === "#text") {
    return node.textContent.toUpperCase().trim() + "\n";
  } else {
    let text = "";

    if (ignoreClass && node.classList && node.classList.contains(ignoreClass)) {
      return text;
    }
    node.childNodes.forEach((child) => {
      text += getRecursiveText(child, ignoreClass);
    });
    return text;
  }
}

function addTooltip(lineEL, msg) {
  let tooltip = document.createElement("div");
  tooltip.setAttribute("contenteditable", "false");
  tooltip.classList.add("tooltip");
  tooltip.textContent = msg;
  lineEL.appendChild(tooltip);
}

function addSummary(data) {
  let warningCount = 0;
  let errorCount = 0;
  data.forEach((row) => {
    if (row.msg_type === "warning") {
      warningCount++;
    } else if (row.msg_type === "error") {
      errorCount++;
    }
  });

  if (warningCount > 0) {
    let warningCountEl = document.createElement("p");
    warningCountEl.textContent = `Warnings: ${warningCount}`;
    warningCountEl.classList.add("warning-count");
    warningCountEl.classList.add("summary-el");
    summary.appendChild(warningCountEl);
  }

  if (errorCount > 0) {
    let errorCountEl = document.createElement("p");
    errorCountEl.textContent = `Errors: ${errorCount}`;
    errorCountEl.classList.add("error-count");
    errorCountEl.classList.add("summary-el");
    summary.appendChild(errorCountEl);
  }
}
