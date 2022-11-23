const api_endpoint = "http://127.0.0.1:5000/";
let sql = "";

const submit = document.getElementById("submit");
const clear = document.getElementById("clear");
const sqlEL = document.getElementById("sql");
const output = document.querySelector(".output");

clear.addEventListener("click", () => {
  sqlEL.innerHTML = "";
});

submit.addEventListener("click", function (event) {
  event.preventDefault();
  const tooltip = document.querySelectorAll(".tooltip");
  tooltip.forEach((tip) => tip.remove());
  sql = sqlEL.textContent;

  if (sql === "") {
    alert("Please enter a SQL statement");
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
        })
        .catch((err) => {
          console.log(err);
          alert("Unable to get data from server. Please try again later.");
        });
    })
    .catch((err) => {
      console.log(err);
      alert("Unable to get data from server. Please try again later.");
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
    alert("Everything looks good 🙂");
  }
}

function getRecursiveText(node) {
  if (node.nodeName === "#text") {
    return node.textContent.toUpperCase().trim() + "\n";
  } else {
    let text = "";
    node.childNodes.forEach((child) => {
      text += getRecursiveText(child);
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
