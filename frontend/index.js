const api_endpoint = "http://127.0.0.1:5000/";
let sql = "";

const submit = document.getElementById("submit");

submit.addEventListener("click", function (event) {
  event.preventDefault();
  sql = document.getElementById("sql").value;

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
          createTable(data);
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

function createTable(data) {
  const output = document.querySelector(".output");
  output.childElementCount > 0 && output.removeChild(output.firstChild);

  if (data.length === 0) {
    let message = document.createElement("p");
    message.textContent = "Everything looks good 🙂";
    output.appendChild(message);
    return;
  }

  let table = document.createElement("table");
  output.appendChild(table);

  let thead = table.createTHead();
  let tRow = thead.insertRow();
  tRow.insertCell().innerHTML = "Validation Name";
  tRow.insertCell().innerHTML = "SQL";
  tRow.insertCell().innerHTML = "Message Type";
  tRow.insertCell().innerHTML = "Message";

  let tbody = table.createTBody();
  for (let row in data) {
    let tRow = tbody.insertRow();
    let check = tRow.insertCell();
    let sql = tRow.insertCell();
    let msg_type = tRow.insertCell();
    let msg = tRow.insertCell();

    check.innerHTML = data[row].validation_name;
    sql.innerHTML = data[row].sql;
    msg_type.innerHTML = data[row].msg_type;
    msg.innerHTML = data[row].msg;
  }
}
